import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { connectDB } from './config/database';
import WebSocketHandler from './websocket/socket.handler';

// Load environment variables
dotenv.config();

const PORT = process.env['PORT'] || 3000;

async function startServer() {
  console.log('🚀 Starting CryptoVault Pro Backend...');

  // Connect to database
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to database. Exiting...', error);
    process.exit(1);
  }

  // Create HTTP server
  const server = createServer(app);

  // Initialize WebSocket
  const wsHandler = new WebSocketHandler(server);
  (global as any).wsHandler = wsHandler;  // Make available globally for services

  // Start server
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🔗 WebSocket ready for connections`);
  });

  // Error handling
  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`❌ Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
