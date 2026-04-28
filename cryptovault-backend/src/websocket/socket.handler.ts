import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import redisService from '../config/redis';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

class WebSocketHandler {
  private io: Server;
  private subscribedPrices: Set<string> = new Set();

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.init();
  }

  private init() {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: any) => {
      console.log(`User ${socket.userId} connected`);
      redisService.setUserOnline(socket.userId, socket.id);

      // Handle subscriptions
      socket.on('SUBSCRIBE_PRICES', (coins: string[]) => {
        socket.join('price-updates');
        coins.forEach(coin => this.subscribedPrices.add(coin));
      });

      socket.on('SUBSCRIBE_TRANSACTIONS', () => {
        socket.join(`user:${socket.userId}:transactions`);
      });

      socket.on('SUBSCRIBE_BALANCE', (walletId: string) => {
        socket.join(`wallet:${walletId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        redisService.setUserOffline(socket.userId, socket.id);
      });
    });

    // Start price update loop
    this.startPriceUpdates();
  }

  private async startPriceUpdates() {
    setInterval(async () => {
      if (this.subscribedPrices.size === 0) return;

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
  notifyTransactionUpdate(userId: string, transaction: any) {
    this.io.to(`user:${userId}:transactions`).emit('TRANSACTION_UPDATE', transaction);
  }

  notifyBalanceUpdate(walletId: string, balance: any) {
    this.io.to(`wallet:${walletId}`).emit('BALANCE_UPDATE', { walletId, balance });
  }

  notifyUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('NOTIFICATION', notification);
  }
}

export default WebSocketHandler;
