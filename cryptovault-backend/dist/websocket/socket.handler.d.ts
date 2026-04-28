declare class WebSocketHandler {
    private io;
    private subscribedPrices;
    constructor(server: any);
    private init;
    private startPriceUpdates;
    notifyTransactionUpdate(userId: string, transaction: any): void;
    notifyBalanceUpdate(walletId: string, balance: any): void;
    notifyUser(userId: string, notification: any): void;
}
export default WebSocketHandler;
//# sourceMappingURL=socket.handler.d.ts.map