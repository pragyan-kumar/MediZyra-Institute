import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

const externalMongoUri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME ?? "medizyra";

let clientPromise;
let memoryServer;

async function connectClient() {
  let mongoUri = externalMongoUri;

  if (!mongoUri) {
    // No external MongoDB configured — spin up an embedded in-process instance.
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName },
    });
    mongoUri = memoryServer.getUri();
    console.log(`[MediZyra] Using embedded MongoDB at ${mongoUri}`);
  }

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

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}

export function getMongoConfig() {
  return { dbName, mongoUri: externalMongoUri ?? "(embedded)" };
}
