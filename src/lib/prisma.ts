import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace("sslmode=require", "sslmode=verify-full") : undefined 
})
const adapter = new PrismaPg(pool)

declare global {
  var prisma: PrismaClient | undefined
}

const client = global.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = client
  console.log('Prisma Client Initialized/Reloaded');
}

export default client
