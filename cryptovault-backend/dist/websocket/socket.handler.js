"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = __importDefault(require("../config/redis"));
class WebSocketHandler {
    constructor(server) {
        this.subscribedPrices = new Set();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:4200',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.init();
    }
    init() {
        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.query.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.userId;
                next();
            }
            catch (err) {
                next(new Error('Invalid token'));
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected`);
            redis_1.default.setUserOnline(socket.userId, socket.id);
            // Handle subscriptions
            socket.on('SUBSCRIBE_PRICES', (coins) => {
                socket.join('price-updates');
                coins.forEach(coin => this.subscribedPrices.add(coin));
            });
            socket.on('SUBSCRIBE_TRANSACTIONS', () => {
                socket.join(`user:${socket.userId}:transactions`);
            });
            socket.on('SUBSCRIBE_BALANCE', (walletId) => {
                socket.join(`wallet:${walletId}`);
            });
            socket.on('disconnect', () => {
                console.log(`User ${socket.userId} disconnected`);
                redis_1.default.setUserOffline(socket.userId, socket.id);
            });
        });
        // Start price update loop
        this.startPriceUpdates();
    }
    async startPriceUpdates() {
        setInterval(async () => {
            if (this.subscribedPrices.size === 0)
                return;
            // TODO: Implement actual price fetching
            const prices = {
                BTC: { usd: 42000, change_24h: 2.5 },
                ETH: { usd: 2300, change_24h: -1.2 },
                SOL: { usd: 95, change_24h: 5.1 },
                USDT: { usd: 1.00, change_24h: 0.01 }
            };
            this.io.to('price-updates').emit('PRICE_UPDATE', prices);
        }, 5000); // Every 5 seconds
    }
    // Emitters for other services to use
    notifyTransactionUpdate(userId, transaction) {
        this.io.to(`user:${userId}:transactions`).emit('TRANSACTION_UPDATE', transaction);
    }
    notifyBalanceUpdate(walletId, balance) {
        this.io.to(`wallet:${walletId}`).emit('BALANCE_UPDATE', { walletId, balance });
    }
    notifyUser(userId, notification) {
        this.io.to(`user:${userId}`).emit('NOTIFICATION', notification);
    }
}
exports.default = WebSocketHandler;
//# sourceMappingURL=socket.handler.js.map