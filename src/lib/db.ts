import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cachedClient: NeonQueryFunction<false, false> | undefined;

export function getDbClient() {
  if (!cachedClient) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    cachedClient = neon(connectionString);
  }

  return cachedClient;
}
