import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

export const sqlite = new Database("profiles.db");
export const db = drizzle(sqlite);
