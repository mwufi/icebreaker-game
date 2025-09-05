import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

export const sqlite = new Database("profiles.db");
export const db = drizzle(sqlite, { schema });
