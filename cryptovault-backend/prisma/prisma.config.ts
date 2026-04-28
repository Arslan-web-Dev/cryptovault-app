import type { PrismaConfig } from '@prisma/config'

const config: PrismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

export default config
