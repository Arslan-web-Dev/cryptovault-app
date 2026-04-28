"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseService = exports.checkDBHealth = exports.disconnectDB = exports.connectDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const supabase_1 = __importDefault(require("./supabase"));
exports.supabaseService = supabase_1.default;
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
        db: {
            url: process.env['DATABASE_URL']
        }
    }
});
exports.prisma = prisma;
const connectDB = async () => {
    try {
        // Test Prisma connection
        await prisma.$connect();
        console.log('✅ Prisma connected to Supabase successfully');
        // Test Supabase connection
        const supabaseConnected = await supabase_1.default.testConnection();
        if (!supabaseConnected) {
            console.warn('⚠️ Supabase client connection failed, but Prisma works');
        }
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log('✅ Database disconnected successfully');
    }
    catch (error) {
        console.error('❌ Database disconnection failed:', error);
    }
};
exports.disconnectDB = disconnectDB;
const checkDBHealth = async () => {
    try {
        // Check Prisma connection
        await prisma.$queryRaw `SELECT 1`;
        // Check Supabase connection
        const supabaseHealth = await supabase_1.default.healthCheck();
        return supabaseHealth.status === 'healthy';
    }
    catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
};
exports.checkDBHealth = checkDBHealth;
//# sourceMappingURL=database.js.map