"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const socket_handler_1 = __importDefault(require("./websocket/socket.handler"));
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
async function startServer() {
    console.log('🚀 Starting CryptoVault Pro Backend...');
    // Check database connection
    const dbConnected = await (0, database_1.checkConnection)();
    if (!dbConnected) {
        console.error('❌ Failed to connect to database. Exiting...');
        process.exit(1);
    }
    // Create HTTP server
    const server = (0, http_1.createServer)(app_1.default);
    // Initialize WebSocket
    const wsHandler = new socket_handler_1.default(server);
    global.wsHandler = wsHandler; // Make available globally for services
    // Start server
    server.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
        console.log(`🔗 WebSocket ready for connections`);
    });
    // Error handling
    server.on('error', (error) => {
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
//# sourceMappingURL=server.js.map