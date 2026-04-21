import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

function createClientPromise() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  const client = new MongoClient(uri);

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = client.connect();
    }

    return globalWithMongo._mongoClientPromise;
  }

  return client.connect();
}

export async function getDB() {
  if (!clientPromise) {
    clientPromise = createClientPromise();
  }

  const connectedClient = await clientPromise;
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error("DB_NAME environment variable is not set");
  }
  return connectedClient.db(dbName);
}
