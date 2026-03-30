import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGO_DB_NAME ?? "medizyra";

let clientPromise;

async function connectClient() {
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  return client;
}

export async function getDb() {
  if (!clientPromise) {
    clientPromise = connectClient();
  }

  const client = await clientPromise;
  return client.db(dbName);
}

export async function closeDb() {
  if (!clientPromise) {
    return;
  }

  try {
    const client = await clientPromise;
    await client.close();
  } catch {
    // Ignore connection failures during shutdown cleanup.
  } finally {
    clientPromise = undefined;
  }
}

export function getMongoConfig() {
  return { dbName, mongoUri };
}
