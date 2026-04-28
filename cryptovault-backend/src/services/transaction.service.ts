import { prisma } from '../config/database';
import blockchainService from './blockchain.service';
import { createError } from '../middleware/error.middleware';
import { CoinType } from '@prisma/client';

export interface SendTransactionRequest {
  walletId: string;
  toAddress: string;
  amount: string;
  feeLevel?: 'low' | 'medium' | 'high';
  twoFactorCode?: string;
}

export interface SwapTransactionRequest {
  fromWalletId: string;
  toWalletId: string;
  amount: string;
  slippage?: number;
}

export interface TransactionResponse {
  transactionId: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  fromAddress: string;
  toAddress: string;
  amount: number;
  fee: number;
  estimatedTime?: string;
  riskScore: number;
}

class TransactionService {
  async sendTransaction(userId: string, request: SendTransactionRequest): Promise<TransactionResponse> {
    // Get wallet and validate ownership
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: request.walletId,
        user_id: userId,
        is_active: true
      }
    });

    if (!wallet) {
      throw createError('Wallet not found', 404);
    }

    // Validate address
    const isValidAddress = blockchainService.validateAddress(request.toAddress, wallet.coin_type);
    if (!isValidAddress) {
      throw createError('Invalid recipient address', 400);
    }

    // Check balance
    const amount = parseFloat(request.amount);
    const estimatedFee = this.estimateFee(wallet.coin_type, request.feeLevel || 'medium');
    
    if (parseFloat(wallet.balance.toString()) < amount + estimatedFee) {
      throw createError('Insufficient balance', 400);
    }

    // Risk assessment
    const riskScore = await this.assessTransactionRisk(userId, request.toAddress, amount, wallet.coin_type);
    
    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        wallet_id: request.walletId,
        type: 'SEND',
        from_address: wallet.wallet_address,
        to_address: request.toAddress,
        amount: amount,
        fee: estimatedFee,
        status: 'PENDING',
        risk_score: riskScore,
        created_at: new Date()
      }
    } as any);

    try {
      // Decrypt private key
      const privateKey = blockchainService.decryptPrivateKey(wallet.private_key_encrypted);
      
      // Send blockchain transaction
      const blockchainTx = await this.executeBlockchainTransaction(
        wallet.coin_type,
        {
          fromAddress: wallet.wallet_address,
          toAddress: request.toAddress,
          amount: request.amount,
          privateKey: privateKey,
          feeLevel: request.feeLevel
        }
      );

      // Update transaction with blockchain hash
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          transaction_hash: blockchainTx.txHash,
          fee: parseFloat(blockchainTx.fee)
        }
      });

      // Update wallet balance (will be synced later)
      await prisma.wallet.update({
        where: { id: request.walletId },
        data: {
          balance: { decrement: amount + estimatedFee }
        }
      });

      return {
        transactionId: transaction.id,
        transactionHash: blockchainTx.txHash,
        status: 'pending',
        fromAddress: wallet.wallet_address,
        toAddress: request.toAddress,
        amount: amount,
        fee: parseFloat(blockchainTx.fee),
        estimatedTime: blockchainTx.estimatedTime,
        riskScore: riskScore
      };

    } catch (error) {
      // Mark transaction as failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED'
        }
      });
      
      throw createError(`Transaction failed: ${error}`, 500);
    }
  }

  async receiveTransaction(userId: string, walletId: string): Promise<{ address: string; qrCode: string }> {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        user_id: userId,
        is_active: true
      }
    });

    if (!wallet) {
      throw createError('Wallet not found', 404);
    }

    // Generate QR code for the address (simplified - in production use a proper QR library)
    const qrCode = `crypto:${wallet.wallet_address}?chain=${wallet.coin_type.toLowerCase()}`;

    return {
      address: wallet.wallet_address,
      qrCode: qrCode
    };
  }

  async swapTransaction(userId: string, request: SwapTransactionRequest): Promise<TransactionResponse> {
    // Get both wallets
    const [fromWallet, toWallet] = await Promise.all([
      prisma.wallet.findFirst({
        where: { id: request.fromWalletId, user_id: userId, is_active: true }
      }),
      prisma.wallet.findFirst({
        where: { id: request.toWalletId, user_id: userId, is_active: true }
      })
    ]);

    if (!fromWallet || !toWallet) {
      throw createError('One or both wallets not found', 404);
    }

    if (fromWallet.coin_type === toWallet.coin_type) {
      throw createError('Cannot swap between same currency wallets', 400);
    }

    const amount = parseFloat(request.amount);
    
    if (parseFloat(fromWallet.balance.toString()) < amount) {
      throw createError('Insufficient balance', 400);
    }

    // Get exchange rate (simplified - in production use a proper exchange API)
    const exchangeRate = await this.getExchangeRate(fromWallet.coin_type, toWallet.coin_type);
    const toAmount = amount * exchangeRate * (1 - (request.slippage || 0.5) / 100);

    // Risk assessment for swap
    const riskScore = await this.assessTransactionRisk(userId, toWallet.wallet_address, toAmount, toWallet.coin_type);

    // Create swap transaction record
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        wallet_id: request.fromWalletId,
        type: 'SWAP',
        from_address: fromWallet.wallet_address,
        to_address: toWallet.wallet_address,
        amount: amount,
        fee: this.estimateSwapFee(fromWallet.coin_type, toWallet.coin_type, amount),
        status: 'PENDING',
        risk_score: riskScore
      }
    } as any);

    try {
      // Execute swap (simplified - in production use a proper DEX or exchange)
      const swapResult = await this.executeSwap(
        fromWallet,
        toWallet,
        amount,
        toAmount,
        userId
      );

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          transaction_hash: swapResult.txHash,
          status: 'CONFIRMED' as any,
          completed_at: new Date()
        }
      });

      return {
        transactionId: transaction.id,
        transactionHash: swapResult.txHash,
        status: 'CONFIRMED' as any,
        fromAddress: fromWallet.wallet_address,
        toAddress: toWallet.wallet_address,
        amount: amount,
        fee: swapResult.fee,
        riskScore: riskScore
      };

    } catch (error) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED'
        }
      });
      
      throw createError(`Swap failed: ${error}`, 500);
    }
  }

  async getTransactionHistory(userId: string, walletId?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const whereClause: any = { user_id: userId };
    if (walletId) {
      whereClause.wallet_id = walletId;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        select: {
          id: true,
          transaction_hash: true,
          type: true,
          from_address: true,
          to_address: true,
          amount: true,
          fee: true,
          status: true,
          risk_score: true,
          created_at: true,
          completed_at: true,
          wallet: {
            select: {
              coin_type: true,
              wallet_name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTransactionDetails(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        user_id: userId
      },
      select: {
        id: true,
        transaction_hash: true,
        type: true,
        from_address: true,
        to_address: true,
        amount: true,
        fee: true,
        status: true,
        risk_score: true,
        created_at: true,
        completed_at: true,
        wallet: {
          select: {
            coin_type: true,
            wallet_name: true
          }
        }
      }
    });

    if (!transaction) {
      throw createError('Transaction not found', 404);
    }

    // Get blockchain confirmation details
    let blockchainDetails = null;
    if (transaction.transaction_hash && transaction.status !== 'FAILED') {
      try {
        blockchainDetails = await this.getBlockchainTransactionDetails(
          transaction.wallet.coin_type,
          transaction.transaction_hash
        );
      } catch (error) {
        console.error('Failed to get blockchain details:', error);
      }
    }

    return {
      ...transaction,
      blockchainDetails
    };
  }

  async updateTransactionStatus(transactionId: string): Promise<void> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: {
          select: { coin_type: true }
        }
      }
    });

    if (!transaction || !transaction.transaction_hash) {
      return;
    }

    try {
      const details = await this.getBlockchainTransactionDetails(
        transaction.wallet.coin_type,
        transaction.transaction_hash
      );

      const newStatus = details.confirmations > 0 ? 'CONFIRMED' : 'PENDING';
      
      if (transaction.status !== newStatus as any) {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: newStatus as any,
            completed_at: newStatus === 'CONFIRMED' ? new Date() : null
          }
        });
      }
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  }

  private async executeBlockchainTransaction(coinType: CoinType, request: any) {
    switch (coinType) {
      case 'BTC':
        return await blockchainService.sendBitcoin(request);
      case 'ETH':
        return await blockchainService.sendEthereum(request);
      case 'SOL':
        return await blockchainService.sendSolana(request);
      case 'USDT':
        return await blockchainService.sendUSDT(request);
      default:
        throw createError('Unsupported coin type', 400);
    }
  }

  private estimateFee(coinType: CoinType, feeLevel: 'low' | 'medium' | 'high'): number {
    const fees = {
      BTC: { low: 0.0001, medium: 0.0002, high: 0.0005 },
      ETH: { low: 0.001, medium: 0.002, high: 0.005 },
      SOL: { low: 0.000005, medium: 0.00001, high: 0.000025 },
      USDT: { low: 1, medium: 2, high: 5 } // USDT fees in USD
    };
    return fees[coinType][feeLevel];
  }

  private estimateSwapFee(fromCoin: CoinType, toCoin: CoinType, amount: number): number {
    // Simplified swap fee calculation (0.5% + network fees)
    const baseFee = amount * 0.005;
    const networkFee = this.estimateFee(toCoin, 'medium');
    return baseFee + networkFee;
  }

  private async assessTransactionRisk(userId: string, toAddress: string, amount: number, coinType: CoinType): Promise<number> {
    // Simplified risk assessment (0-100 scale)
    let riskScore = 10; // Base risk score

    // Check if recipient is a known address
    const isKnownRecipient = await this.checkKnownAddress(toAddress);
    if (isKnownRecipient) {
      riskScore -= 5;
    }

    // Amount-based risk
    const highValueThreshold = this.getHighValueThreshold(coinType);
    if (amount > highValueThreshold) {
      riskScore += 15;
    }

    // User history-based risk
    const userHistory = await this.getUserTransactionHistory(userId);
    if (userHistory.totalTransactions < 5) {
      riskScore += 10; // New user penalty
    }

    // Address pattern analysis (simplified)
    if (this.isSuspiciousAddress(toAddress)) {
      riskScore += 25;
    }

    return Math.min(Math.max(riskScore, 0), 100);
  }

  private async getExchangeRate(fromCoin: CoinType, toCoin: CoinType): Promise<number> {
    // Simplified exchange rate - in production use real-time rates
    const rates = {
      'BTC-ETH': 18.5,
      'ETH-BTC': 0.054,
      'BTC-USDT': 42000,
      'USDT-BTC': 0.000024,
      'ETH-USDT': 2300,
      'USDT-ETH': 0.000435,
      'SOL-BTC': 0.0023,
      'BTC-SOL': 435,
      'SOL-ETH': 0.041,
      'ETH-SOL': 24.4,
      'SOL-USDT': 95,
      'USDT-SOL': 0.0105
    };

    const key = `${fromCoin}-${toCoin}`;
    return rates[key as keyof typeof rates] || 1;
  }

  private async executeSwap(fromWallet: any, toWallet: any, fromAmount: number, toAmount: number, userId: string): Promise<{ txHash: string; fee: number }> {
    // Simplified swap execution - in production use a proper DEX
    const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update wallet balances
    await Promise.all([
      prisma.wallet.update({
        where: { id: fromWallet.id },
        data: { balance: { decrement: fromAmount } }
      }),
      prisma.wallet.update({
        where: { id: toWallet.id },
        data: { balance: { increment: toAmount } }
      })
    ]);

    return {
      txHash: swapId,
      fee: this.estimateSwapFee(fromWallet.coin_type, toWallet.coin_type, fromAmount)
    };
  }

  private async getBlockchainTransactionDetails(coinType: CoinType, txHash: string): Promise<{ confirmations: number; status: string }> {
    // Simplified - in production query actual blockchain
    return {
      confirmations: 3,
      status: 'confirmed'
    };
  }

  private async checkKnownAddress(address: string): Promise<boolean> {
    // Check if address is in user's wallet list or known exchange addresses
    const wallet = await prisma.wallet.findFirst({
      where: { wallet_address: address }
    });
    return !!wallet;
  }

  private getHighValueThreshold(coinType: CoinType): number {
    const thresholds = {
      BTC: 1.0,
      ETH: 10.0,
      SOL: 100.0,
      USDT: 10000.0
    };
    return thresholds[coinType];
  }

  private async getUserTransactionHistory(userId: string): Promise<{ totalTransactions: number; successRate: number }> {
    const [total, successful] = await Promise.all([
      prisma.transaction.count({ where: { user_id: userId } }),
      prisma.transaction.count({ where: { user_id: userId, status: 'CONFIRMED' as any } })
    ]);

    return {
      totalTransactions: total,
      successRate: total > 0 ? (successful / total) * 100 : 100
    };
  }

  private isSuspiciousAddress(address: string): boolean {
    // Simplified suspicious address detection
    const suspiciousPatterns = [
      /^0x0+/, // All zeros after 0x
      /^bc1q0+/, // All zeros after bc1q
      /^[a-f0-9]{40}$/i, // Potential hex-only address
    ];

    return suspiciousPatterns.some(pattern => pattern.test(address));
  }
}

export default new TransactionService();
