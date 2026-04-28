export interface WalletData {
    address: string;
    privateKey: string;
    mnemonic?: string;
}
export interface BalanceResponse {
    balance: string;
    usdValue?: number;
    lastUpdated: Date;
}
export interface TransactionRequest {
    fromAddress: string;
    toAddress: string;
    amount: string;
    privateKey: string;
    feeLevel?: 'low' | 'medium' | 'high';
}
export interface TransactionResponse {
    txHash: string;
    status: 'pending' | 'confirmed' | 'failed';
    fee: string;
    estimatedTime?: string;
}
export interface PriceData {
    usd: number;
    change_24h: number;
}
declare class BlockchainService {
    private web3;
    private solanaConnection;
    private readonly encryptionKey;
    constructor();
    encryptPrivateKey(privateKey: string): string;
    decryptPrivateKey(encryptedKey: string): string;
    createEthereumWallet(): Promise<WalletData>;
    getEthereumBalance(address: string): Promise<BalanceResponse>;
    sendEthereum(request: TransactionRequest): Promise<TransactionResponse>;
    createBitcoinWallet(): Promise<WalletData>;
    getBitcoinBalance(address: string): Promise<BalanceResponse>;
    sendBitcoin(request: TransactionRequest): Promise<TransactionResponse>;
    private getUtxos;
    createSolanaWallet(): Promise<WalletData>;
    getSolanaBalance(address: string): Promise<BalanceResponse>;
    sendSolana(request: TransactionRequest): Promise<TransactionResponse>;
    getUSDTBalance(address: string): Promise<BalanceResponse>;
    sendUSDT(request: TransactionRequest): Promise<TransactionResponse>;
    getPrice(symbol: string): Promise<PriceData>;
    getAllPrices(): Promise<{
        [key: string]: PriceData;
    }>;
    validateAddress(address: string, coinType: string): boolean;
    validatePrivateKey(privateKey: string, coinType: string): boolean;
}
declare const _default: BlockchainService;
export default _default;
//# sourceMappingURL=blockchain.service.d.ts.map