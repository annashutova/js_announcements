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

async function teardownTestDatabase() {
    try {
      console.log(`Dropping test database: ${dbName}...`)
      execSync(`psql "${connectionString}" -c "DROP DATABASE ${dbName} WITH (FORCE)"`, {
        stdio: 'ignore',
      })
      console.log('Test database dropped.')
    } catch (err) {
      console.error('Error dropping test database:', err.message)
    }
  }
  
teardownTestDatabase()