import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
    path: path.join(__dirname, '.env.test')
})

const prismaTest = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
})


export default prismaTest