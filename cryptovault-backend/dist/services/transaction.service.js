"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const blockchain_service_1 = __importDefault(require("./blockchain.service"));
const error_middleware_1 = require("../middleware/error.middleware");
class TransactionService {
    async sendTransaction(userId, request) {
        // Get wallet and validate ownership
        const wallet = await database_1.prisma.wallet.findFirst({
            where: {
                id: request.walletId,
                user_id: userId,
                is_active: true
            }
        });
        if (!wallet) {
            throw (0, error_middleware_1.createError)('Wallet not found', 404);
        }
        // Validate address
        const isValidAddress = blockchain_service_1.default.validateAddress(request.toAddress, wallet.coin_type);
        if (!isValidAddress) {
            throw (0, error_middleware_1.createError)('Invalid recipient address', 400);
        }
        // Check balance
        const balance = await blockchain_service_1.default.getWalletBalance(request.walletId, userId);
        const amount = parseFloat(request.amount);
        const estimatedFee = this.estimateFee(wallet.coin_type, request.feeLevel || 'medium');
        if (parseFloat(balance.balance) < amount + estimatedFee) {
            throw (0, error_middleware_1.createError)('Insufficient balance', 400);
        }
        // Risk assessment
        const riskScore = await this.assessTransactionRisk(userId, request.toAddress, amount, wallet.coin_type);
        // Create transaction record
        const transaction = await database_1.prisma.transaction.create({
            data: {
                user_id: userId,
                wallet_id: request.walletId,
                type: 'send',
                from_address: wallet.wallet_address,
                to_address: request.toAddress,
                amount: amount,
                fee: estimatedFee,
                status: 'pending',
                risk_score: riskScore,
                created_at: new Date()
            }
        });
        try {
            // Decrypt private key
            const privateKey = blockchain_service_1.default.decryptPrivateKey(wallet.private_key_encrypted);
            // Send blockchain transaction
            const blockchainTx = await this.executeBlockchainTransaction(wallet.coin_type, {
                fromAddress: wallet.wallet_address,
                toAddress: request.toAddress,
                amount: request.amount,
                privateKey: privateKey,
                feeLevel: request.feeLevel
            });
            // Update transaction with blockchain hash
            await database_1.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    transaction_hash: blockchainTx.txHash,
                    fee: parseFloat(blockchainTx.fee),
                    updated_at: new Date()
                }
            });
            // Update wallet balance (will be synced later)
            await database_1.prisma.wallet.update({
                where: { id: request.walletId },
                data: {
                    balance: parseFloat(balance.balance) - amount - estimatedFee,
                    updated_at: new Date()
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
        }
        catch (error) {
            // Mark transaction as failed
            await database_1.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'failed',
                    updated_at: new Date()
                }
            });
            throw (0, error_middleware_1.createError)(`Transaction failed: ${error}`, 500);
        }
    }
    async receiveTransaction(userId, walletId) {
        const wallet = await database_1.prisma.wallet.findFirst({
            where: {
                id: walletId,
                user_id: userId,
                is_active: true
            }
        });
        if (!wallet) {
            throw (0, error_middleware_1.createError)('Wallet not found', 404);
        }
        // Generate QR code for the address (simplified - in production use a proper QR library)
        const qrCode = `crypto:${wallet.wallet_address}?chain=${wallet.coin_type.toLowerCase()}`;
        return {
            address: wallet.wallet_address,
            qrCode: qrCode
        };
    }
    async swapTransaction(userId, request) {
        // Get both wallets
        const [fromWallet, toWallet] = await Promise.all([
            database_1.prisma.wallet.findFirst({
                where: { id: request.fromWalletId, user_id: userId, is_active: true }
            }),
            database_1.prisma.wallet.findFirst({
                where: { id: request.toWalletId, user_id: userId, is_active: true }
            })
        ]);
        if (!fromWallet || !toWallet) {
            throw (0, error_middleware_1.createError)('One or both wallets not found', 404);
        }
        if (fromWallet.coin_type === toWallet.coin_type) {
            throw (0, error_middleware_1.createError)('Cannot swap between same currency wallets', 400);
        }
        const amount = parseFloat(request.amount);
        const fromBalance = await blockchain_service_1.default.getWalletBalance(request.fromWalletId, userId);
        if (parseFloat(fromBalance.balance) < amount) {
            throw (0, error_middleware_1.createError)('Insufficient balance', 400);
        }
        // Get exchange rate (simplified - in production use a proper exchange API)
        const exchangeRate = await this.getExchangeRate(fromWallet.coin_type, toWallet.coin_type);
        const toAmount = amount * exchangeRate * (1 - (request.slippage || 0.5) / 100);
        // Risk assessment for swap
        const riskScore = await this.assessTransactionRisk(userId, toWallet.wallet_address, toAmount, toWallet.coin_type);
        // Create swap transaction record
        const transaction = await database_1.prisma.transaction.create({
            data: {
                user_id: userId,
                wallet_id: request.fromWalletId,
                type: 'swap',
                from_address: fromWallet.wallet_address,
                to_address: toWallet.wallet_address,
                amount: amount,
                fee: this.estimateSwapFee(fromWallet.coin_type, toWallet.coin_type, amount),
                status: 'pending',
                risk_score: riskScore,
                created_at: new Date()
            }
        });
        try {
            // Execute swap (simplified - in production use a proper DEX or exchange)
            const swapResult = await this.executeSwap(fromWallet, toWallet, amount, toAmount, userId);
            // Update transaction
            await database_1.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    transaction_hash: swapResult.txHash,
                    status: 'confirmed',
                    completed_at: new Date(),
                    updated_at: new Date()
                }
            });
            return {
                transactionId: transaction.id,
                transactionHash: swapResult.txHash,
                status: 'confirmed',
                fromAddress: fromWallet.wallet_address,
                toAddress: toWallet.wallet_address,
                amount: amount,
                fee: swapResult.fee,
                riskScore: riskScore
            };
        }
        catch (error) {
            await database_1.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'failed',
                    updated_at: new Date()
                }
            });
            throw (0, error_middleware_1.createError)(`Swap failed: ${error}`, 500);
        }
    }
    async getTransactionHistory(userId, walletId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const whereClause = { user_id: userId };
        if (walletId) {
            whereClause.wallet_id = walletId;
        }
        const [transactions, total] = await Promise.all([
            database_1.prisma.transaction.findMany({
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
            database_1.prisma.transaction.count({ where: whereClause })
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
    async getTransactionDetails(userId, transactionId) {
        const transaction = await database_1.prisma.transaction.findFirst({
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
            throw (0, error_middleware_1.createError)('Transaction not found', 404);
        }
        // Get blockchain confirmation details
        let blockchainDetails = null;
        if (transaction.transaction_hash && transaction.status !== 'failed') {
            try {
                blockchainDetails = await this.getBlockchainTransactionDetails(transaction.wallet.coin_type, transaction.transaction_hash);
            }
            catch (error) {
                console.error('Failed to get blockchain details:', error);
            }
        }
        return {
            ...transaction,
            blockchainDetails
        };
    }
    async updateTransactionStatus(transactionId) {
        const transaction = await database_1.prisma.transaction.findUnique({
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
            const details = await this.getBlockchainTransactionDetails(transaction.wallet.coin_type, transaction.transaction_hash);
            const newStatus = details.confirmations > 0 ? 'confirmed' : 'pending';
            if (transaction.status !== newStatus) {
                await database_1.prisma.transaction.update({
                    where: { id: transactionId },
                    data: {
                        status: newStatus,
                        completed_at: newStatus === 'confirmed' ? new Date() : null,
                        updated_at: new Date()
                    }
                });
            }
        }
        catch (error) {
            console.error('Failed to update transaction status:', error);
        }
    }
    async executeBlockchainTransaction(coinType, request) {
        switch (coinType) {
            case 'BTC':
                return await blockchain_service_1.default.sendBitcoin(request);
            case 'ETH':
                return await blockchain_service_1.default.sendEthereum(request);
            case 'SOL':
                return await blockchain_service_1.default.sendSolana(request);
            case 'USDT':
                return await blockchain_service_1.default.sendUSDT(request);
            default:
                throw (0, error_middleware_1.createError)('Unsupported coin type', 400);
        }
    }
    estimateFee(coinType, feeLevel) {
        const fees = {
            BTC: { low: 0.0001, medium: 0.0002, high: 0.0005 },
            ETH: { low: 0.001, medium: 0.002, high: 0.005 },
            SOL: { low: 0.000005, medium: 0.00001, high: 0.000025 },
            USDT: { low: 1, medium: 2, high: 5 } // USDT fees in USD
        };
        return fees[coinType][feeLevel];
    }
    estimateSwapFee(fromCoin, toCoin, amount) {
        // Simplified swap fee calculation (0.5% + network fees)
        const baseFee = amount * 0.005;
        const networkFee = this.estimateFee(toCoin, 'medium');
        return baseFee + networkFee;
    }
    async assessTransactionRisk(userId, toAddress, amount, coinType) {
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
    async getExchangeRate(fromCoin, toCoin) {
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
        return rates[key] || 1;
    }
    async executeSwap(fromWallet, toWallet, fromAmount, toAmount, userId) {
        // Simplified swap execution - in production use a proper DEX
        const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Update wallet balances
        await Promise.all([
            database_1.prisma.wallet.update({
                where: { id: fromWallet.id },
                data: { balance: { decrement: fromAmount } }
            }),
            database_1.prisma.wallet.update({
                where: { id: toWallet.id },
                data: { balance: { increment: toAmount } }
            })
        ]);
        return {
            txHash: swapId,
            fee: this.estimateSwapFee(fromWallet.coin_type, toWallet.coin_type, fromAmount)
        };
    }
    async getBlockchainTransactionDetails(coinType, txHash) {
        // Simplified - in production query actual blockchain
        return {
            confirmations: 3,
            status: 'confirmed'
        };
    }
    async checkKnownAddress(address) {
        // Check if address is in user's wallet list or known exchange addresses
        const wallet = await database_1.prisma.wallet.findFirst({
            where: { wallet_address: address }
        });
        return !!wallet;
    }
    getHighValueThreshold(coinType) {
        const thresholds = {
            BTC: 1.0,
            ETH: 10.0,
            SOL: 100.0,
            USDT: 10000.0
        };
        return thresholds[coinType];
    }
    async getUserTransactionHistory(userId) {
        const [total, successful] = await Promise.all([
            database_1.prisma.transaction.count({ where: { user_id: userId } }),
            database_1.prisma.transaction.count({ where: { user_id: userId, status: 'confirmed' } })
        ]);
        return {
            totalTransactions: total,
            successRate: total > 0 ? (successful / total) * 100 : 100
        };
    }
    isSuspiciousAddress(address) {
        // Simplified suspicious address detection
        const suspiciousPatterns = [
            /^0x0+/, // All zeros after 0x
            /^bc1q0+/, // All zeros after bc1q
            /^[a-f0-9]{40}$/i, // Potential hex-only address
        ];
        return suspiciousPatterns.some(pattern => pattern.test(address));
    }
}
exports.default = new TransactionService();
//# sourceMappingURL=transaction.service.js.map