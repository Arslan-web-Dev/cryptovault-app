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
declare class TransactionService {
    sendTransaction(userId: string, request: SendTransactionRequest): Promise<TransactionResponse>;
    receiveTransaction(userId: string, walletId: string): Promise<{
        address: string;
        qrCode: string;
    }>;
    swapTransaction(userId: string, request: SwapTransactionRequest): Promise<TransactionResponse>;
    getTransactionHistory(userId: string, walletId?: string, page?: number, limit?: number): Promise<{
        transactions: {
            type: import(".prisma/client").$Enums.TransactionType;
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            created_at: Date;
            fee: import("@prisma/client-runtime-utils").Decimal;
            wallet: {
                coin_type: import(".prisma/client").$Enums.CoinType;
                wallet_name: string | null;
            };
            transaction_hash: string | null;
            from_address: string;
            to_address: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            risk_score: number;
            completed_at: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTransactionDetails(userId: string, transactionId: string): Promise<{
        blockchainDetails: {
            confirmations: number;
            status: string;
        } | null;
        type: import(".prisma/client").$Enums.TransactionType;
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        created_at: Date;
        fee: import("@prisma/client-runtime-utils").Decimal;
        wallet: {
            coin_type: import(".prisma/client").$Enums.CoinType;
            wallet_name: string | null;
        };
        transaction_hash: string | null;
        from_address: string;
        to_address: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        risk_score: number;
        completed_at: Date | null;
    }>;
    updateTransactionStatus(transactionId: string): Promise<void>;
    private executeBlockchainTransaction;
    private estimateFee;
    private estimateSwapFee;
    private assessTransactionRisk;
    private getExchangeRate;
    private executeSwap;
    private getBlockchainTransactionDetails;
    private checkKnownAddress;
    private getHighValueThreshold;
    private getUserTransactionHistory;
    private isSuspiciousAddress;
}
declare const _default: TransactionService;
export default _default;
//# sourceMappingURL=transaction.service.d.ts.map