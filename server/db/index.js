import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DATABASE_PATH || join(__dirname, 'mission-control.db')

const db = new Database(dbPath)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDb() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
  db.exec(schema)

  // Check if data already seeded
  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get()
  if (count.c === 0) {
    const seed = readFileSync(join(__dirname, 'seed.sql'), 'utf-8')
    db.exec(seed)
    console.log('Database seeded with initial data')
  }
}

export default db
