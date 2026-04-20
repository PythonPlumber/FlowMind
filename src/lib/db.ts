import mongoose from "mongoose";
import { getServerEnv } from "@/lib/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  __mongoose?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.__mongoose ?? {
  conn: null,
  promise: null,
};

globalForMongoose.__mongoose = cached;

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const { MONGODB_URI } = getServerEnv();
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // Prevent mongoose from buffering commands forever if Mongo is unreachable.
        bufferCommands: false,
      })
      .catch((err) => {
        // If the first connection attempt fails in dev, allow retries
        // without forcing a server restart.
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
