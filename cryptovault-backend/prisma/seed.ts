import { PrismaClient, UserRole, CoinType, KycLevel } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cryptovault.com' },
    update: {},
    create: {
      email: 'admin@cryptovault.com',
      password_hash: adminPassword,
      full_name: 'System Admin',
      role: UserRole.SUPER_ADMIN,
      is_email_verified: true,
      kyc_level: KycLevel.LEVEL_2,
      status: 'ACTIVE'
    }
  });

  // Create test user
  const userPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password_hash: userPassword,
      full_name: 'Test User',
      role: UserRole.USER,
      is_email_verified: true,
      kyc_level: KycLevel.LEVEL_1,
      status: 'ACTIVE',
      wallets: {
        create: [
          {
            wallet_address: '0x742d35Cc6634C0532925a3b8D4332eD24aC3cD2B',
            coin_type: CoinType.ETH,
            private_key_encrypted: 'encrypted_private_key_here',
            balance: 1.5,
            is_default: true
          },
          {
            wallet_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            coin_type: CoinType.BTC,
            private_key_encrypted: 'encrypted_private_key_here',
            balance: 0.05
          }
        ]
      }
    }
  });

  // Create some system settings
  await prisma.systemSetting.createMany({
    data: [
      {
        category: 'fees',
        key: 'trading_fee_percentage',
        value: 0.1,
        description: 'Default trading fee percentage'
      },
      {
        category: 'security',
        key: 'max_login_attempts',
        value: 5,
        description: 'Maximum login attempts before account lock'
      },
      {
        category: 'general',
        key: 'platform_name',
        value: 'CryptoVault Pro',
        description: 'Platform display name'
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Seed data created successfully');
  console.log('👤 Admin:', admin.email);
  console.log('👤 User:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
