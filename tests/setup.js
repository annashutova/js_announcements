import { execSync } from 'child_process'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load the test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') })

// Parse the database URL
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in .env.test')
}

const [connectionString, dbName] = databaseUrl.match(/^(.*\/)([^/?]+)$/).slice(1, 3)

async function setupTestDatabase() {
  try {
    console.log(`Creating test database: ${dbName}...`)

    // Create the database
    execSync(`psql "${connectionString}" -c "CREATE DATABASE ${dbName}"`) // psql is required

    console.log('Test database created.')
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Test database already exists.')
    } else {
      console.error('Error creating test database:', err.message)
      process.exit(1)
    }
  }

  try {
    console.log('Running Prisma migrations...')
    // Run migrations to set up the schema
    execSync('npx prisma migrate dev', { stdio: 'inherit' })
    console.log('Prisma migrations completed.')
  } catch (err) {
    console.error('Error running Prisma migrations:', err.message)
    process.exit(1)
  }
}

setupTestDatabase().then(() => {
  console.log('Test database setup complete.')
})
