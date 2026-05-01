import { PrismaClient } from '@prisma/client';
import supabaseService from './supabase';

const prisma = new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env['DATABASE_URL']
    }
  }
});

export { prisma };

export const connectDB = async (): Promise<void> => {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log('✅ Prisma connected to Supabase successfully');
    
    // Test Supabase connection
    const supabaseConnected = await supabaseService.testConnection();
    if (!supabaseConnected) {
      console.warn('⚠️ Supabase client connection failed, but Prisma works');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Don't throw error in development to allow server to start without DB
    if (process.env['NODE_ENV'] === 'production') {
      throw error;
    }
    console.warn('⚠️ Continuing without database connection (development mode)');
  }
}

export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
};

export const checkDBHealth = async (): Promise<boolean> => {
  try {
    // Check Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Supabase connection
    const supabaseHealth = await supabaseService.healthCheck();
    
    return supabaseHealth.status === 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Export Supabase service for direct access when needed
export { supabaseService };
