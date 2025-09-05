import { db, sqlite } from "./db";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

await migrate(db, { migrationsFolder: "./drizzle" });
console.log("✅ migrations applied");

sqlite.close();
