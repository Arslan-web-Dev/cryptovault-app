import { prisma } from '../config/database';
import blockchainService from './blockchain.service';
import { createError } from '../middleware/error.middleware';
import { CoinType } from '@prisma/client';

interface CreateWalletRequest {
  coinType: CoinType;
  walletName?: string;
  userId: string;
}

interface WalletBalance {
  balance: string;
  usdValue: number;
  lastUpdated: Date;
}

class WalletService {
  async createWallet(request: CreateWalletRequest) {
    // Check if user already has a wallet of this type
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        user_id: request.userId,
        coin_type: request.coinType
      }
    });

    if (existingWallet) {
      throw createError('You already have a wallet of this type', 409);
    }

    // Create blockchain wallet
    let walletData;
    switch (request.coinType) {
      case 'ETH':
        walletData = await blockchainService.createEthereumWallet();
        break;
      case 'BTC':
        walletData = await blockchainService.createBitcoinWallet();
        break;
      case 'SOL':
        walletData = await blockchainService.createSolanaWallet();
        break;
      case 'USDT':
        walletData = await blockchainService.createEthereumWallet(); // USDT uses Ethereum addresses
        break;
      default:
        throw createError('Unsupported coin type', 400);
    }

    // Encrypt private key
    const encryptedPrivateKey = blockchainService.encryptPrivateKey(walletData.privateKey);

    // Check if this should be default wallet
    const userWallets = await prisma.wallet.findMany({
      where: { user_id: request.userId }
    });
    const isDefault = userWallets.length === 0;

    // Save to database
    const wallet = await prisma.wallet.create({
      data: {
        user_id: request.userId,
        wallet_address: walletData.address,
        coin_type: request.coinType,
        private_key_encrypted: encryptedPrivateKey,
        wallet_name: request.walletName || `${request.coinType} Wallet`,
        is_default: isDefault
      },
      select: {
        id: true,
        wallet_address: true,
        coin_type: true,
        wallet_name: true,
        is_default: true,
        created_at: true
      }
    });

    return {
      wallet,
      backup_phrase: walletData.mnemonic || 'N/A'
    };
  }

  async getUserWallets(userId: string) {
    const wallets = await prisma.wallet.findMany({
      where: {
        user_id: userId,
        is_active: true
      },
      select: {
        id: true,
        wallet_address: true,
        coin_type: true,
        wallet_name: true,
        is_default: true,
        balance: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get current balances and USD values
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          let balanceData: WalletBalance;
          
          switch (wallet.coin_type) {
            case 'ETH':
              balanceData = await blockchainService.getEthereumBalance(wallet.wallet_address);
              break;
            case 'BTC':
              balanceData = await blockchainService.getBitcoinBalance(wallet.wallet_address);
              break;
            case 'SOL':
              balanceData = await blockchainService.getSolanaBalance(wallet.wallet_address);
              break;
            case 'USDT':
              balanceData = await blockchainService.getUSDTBalance(wallet.wallet_address);
              break;
            default:
              balanceData = { balance: '0', usdValue: 0, lastUpdated: new Date() };
          }

          return {
            ...wallet,
            balance: balanceData.balance,
            usd_value: balanceData.usdValue,
            last_updated: balanceData.lastUpdated
          };
        } catch (error) {
          console.error(`Failed to get balance for wallet ${wallet.id}:`, error);
          return {
            ...wallet,
            balance: '0',
            usd_value: 0,
            last_updated: new Date()
          };
        }
      })
    );

    const totalUsdValue = walletsWithBalances.reduce((sum, wallet) => sum + wallet.usd_value, 0);

    return {
      wallets: walletsWithBalances,
      total_usd_value: totalUsdValue
    };
  }

  async getWalletBalance(walletId: string, userId: string) {
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

    let balanceData: WalletBalance;

    switch (wallet.coin_type) {
      case 'ETH':
        balanceData = await blockchainService.getEthereumBalance(wallet.wallet_address);
        break;
      case 'BTC':
        balanceData = await blockchainService.getBitcoinBalance(wallet.wallet_address);
        break;
      case 'SOL':
        balanceData = await blockchainService.getSolanaBalance(wallet.wallet_address);
        break;
      case 'USDT':
        balanceData = await blockchainService.getUSDTBalance(wallet.wallet_address);
        break;
      default:
        throw createError('Unsupported coin type', 400);
    }

    // Update database balance
    await prisma.wallet.update({
      where: { id: walletId },
      data: { 
        balance: parseFloat(balanceData.balance),
        updated_at: new Date()
      }
    });

    return {
      balance: balanceData.balance,
      usd_value: balanceData.usdValue,
      last_updated: balanceData.lastUpdated
    };
  }

  async updateWalletName(walletId: string, userId: string, newName: string) {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        user_id: userId
      }
    });

    if (!wallet) {
      throw createError('Wallet not found', 404);
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { wallet_name: newName },
      select: {
        id: true,
        wallet_name: true,
        coin_type: true,
        updated_at: true
      }
    });

    return updatedWallet;
  }

  async setDefaultWallet(walletId: string, userId: string) {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        user_id: userId
      }
    });

    if (!wallet) {
      throw createError('Wallet not found', 404);
    }

    // Remove default from all user wallets
    await prisma.wallet.updateMany({
      where: {
        user_id: userId,
        coin_type: wallet.coin_type
      },
      data: { is_default: false }
    });

    // Set new default
    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { is_default: true },
      select: {
        id: true,
        wallet_name: true,
        coin_type: true,
        is_default: true
      }
    });

    return updatedWallet;
  }

  async deleteWallet(walletId: string, userId: string) {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        user_id: userId
      }
    });

    if (!wallet) {
      throw createError('Wallet not found', 404);
    }

    // Check if wallet has balance
    if (parseFloat(wallet.balance.toString()) > 0) {
      throw createError('Cannot delete wallet with non-zero balance', 400);
    }

    // Soft delete (deactivate)
    await prisma.wallet.update({
      where: { id: walletId },
      data: { 
        is_active: false,
        updated_at: new Date()
      }
    });

    return { message: 'Wallet deleted successfully' };
  }

  async getWalletTransactions(walletId: string, userId: string, page: number = 1, limit: number = 10) {
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        user_id: userId
      }
    });

    if (!wallet) {
      throw createError('Wallet not found', 404);
    }

    const skip = (page - 1) * limit;

    const transactions = await prisma.transaction.findMany({
      where: {
        wallet_id: walletId,
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
        created_at: true,
        completed_at: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.transaction.count({
      where: {
        wallet_id: walletId,
        user_id: userId
      }
    });

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  async validateAddress(address: string, coinType: CoinType): Promise<boolean> {
    return blockchainService.validateAddress(address, coinType);
  }

  async getPortfolioSummary(userId: string) {
    const wallets = await prisma.wallet.findMany({
      where: {
        user_id: userId,
        is_active: true
      }
    });

    let totalValue = 0;
    let totalProfit = 0;
    const allocation: { [key: string]: { value: number; percentage: number } } = {};

    for (const wallet of wallets) {
      try {
        let balanceData: WalletBalance;
        
        switch (wallet.coin_type) {
          case 'ETH':
            balanceData = await blockchainService.getEthereumBalance(wallet.wallet_address);
            break;
          case 'BTC':
            balanceData = await blockchainService.getBitcoinBalance(wallet.wallet_address);
            break;
          case 'SOL':
            balanceData = await blockchainService.getSolanaBalance(wallet.wallet_address);
            break;
          case 'USDT':
            balanceData = await blockchainService.getUSDTBalance(wallet.wallet_address);
            break;
          default:
            continue;
        }

        totalValue += balanceData.usdValue;
        allocation[wallet.coin_type] = {
          value: balanceData.usdValue,
          percentage: 0 // Will be calculated after total is known
        };
      } catch (error) {
        console.error(`Failed to get balance for wallet ${wallet.id}:`, error);
      }
    }

    // Calculate percentages
    for (const coin in allocation) {
      allocation[coin].percentage = totalValue > 0 ? (allocation[coin].value / totalValue) * 100 : 0;
    }

    // Calculate profit (simplified - in production, track cost basis)
    totalProfit = totalValue * 0.1; // Assuming 10% profit for demo

    return {
      total_value: totalValue,
      total_profit: totalProfit,
      profit_percentage: totalValue > 0 ? (totalProfit / totalValue) * 100 : 0,
      allocation: Object.entries(allocation).map(([coin, data]) => ({
        coin,
        value: data.value,
        percentage: data.percentage
      }))
    };
  }
}

export default new WalletService();
