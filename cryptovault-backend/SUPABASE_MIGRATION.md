# Supabase Migration Guide

This guide explains how to migrate CryptoVault Pro from PostgreSQL to Supabase.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your project URL and API keys

## Environment Configuration

Update your `.env` file with Supabase credentials:

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-SUPABASE-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SUPABASE-SERVICE-ROLE-KEY]"
```

## Migration Steps

### 1. Update Prisma Schema

The existing Prisma schema should work with Supabase, but you may need to make some adjustments:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Your existing models remain the same
```

### 2. Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init_supabase
```

### 3. Seed Data

```bash
# Run the seed script
npx prisma db seed
```

## Supabase Features

### Row Level Security (RLS)

Supabase provides built-in Row Level Security. You can enable RLS for additional security:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);
```

### Real-time Subscriptions

Supabase supports real-time subscriptions out of the box:

```typescript
// Example in your services
const subscription = supabaseService
  .getClient()
  .channel('wallet_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'wallets' },
    (payload) => {
      console.log('Wallet changed:', payload);
    }
  )
  .subscribe();
```

### Authentication Integration

You can integrate Supabase Auth with your existing JWT system:

```typescript
// Verify Supabase JWT tokens
const { data: { user }, error } = await supabaseService
  .getClient()
  .auth.getUser(jwtToken);
```

## Benefits of Supabase

1. **Managed PostgreSQL**: No need to manage database servers
2. **Real-time**: Built-in real-time subscriptions
3. **Authentication**: Optional Supabase Auth integration
4. **Storage**: File storage for KYC documents
5. **Edge Functions**: Serverless functions for additional logic
6. **Dashboard**: Built-in database management interface

## Migration Checklist

- [ ] Create Supabase project
- [ ] Update environment variables
- [ ] Test database connection
- [ ] Run Prisma migrations
- [ ] Seed initial data
- [ ] Test all API endpoints
- [ ] Set up Row Level Security (optional)
- [ ] Configure real-time subscriptions (optional)

## Troubleshooting

### Connection Issues

1. Verify your DATABASE_URL format
2. Check if your IP is whitelisted in Supabase
3. Ensure your API keys are correct

### Migration Issues

1. Run `npx prisma db push` for schema changes
2. Use `npx prisma migrate reset` if needed
3. Check Supabase dashboard for table creation

### Performance

1. Use Supabase's built-in analytics
2. Monitor query performance
3. Enable connection pooling if needed
