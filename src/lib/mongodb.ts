import { MongoClient } from "mongodb";

if(!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if(process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
     _mongoClientPromise?: Promise<MongoClient>;
    }

    // In development mode, use a global variable to maintain the MongoDB client
    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
}else {
    // In production mode, create a new MongoDB client for each request
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export default clientPromise;