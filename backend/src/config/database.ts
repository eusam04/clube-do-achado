import { MongoClient, Db } from 'mongodb'
import 'dotenv/config'

const uri = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DATABASE

if (!uri) {
  throw new Error('A variável MONGODB_URI não foi configurada.')
}

if (!databaseName) {
  throw new Error('A variável MONGODB_DATABASE não foi configurada.')
}

const client = new MongoClient(uri)

let database: Db

export async function connectToDatabase(): Promise<Db> {
  if (database) {
    return database
  }

  await client.connect()

  database = client.db(databaseName)

  console.log(`Conectado ao MongoDB: ${databaseName}`)

  return database
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error(
      'O banco ainda não foi conectado. Execute connectToDatabase() primeiro.'
    )
  }

  return database
}