import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const profiles = sqliteTable("profiles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    tagline: text("tagline"),
    profileText: text("profile_text"),
    profileRawHtml: text("profile_raw_html"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`)
});

export const comments = sqliteTable("comments", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    authorName: text("author_name"),
    authorTagline: text("author_tagline"),
    authorHref: text("author_href"),
    dateText: text("date_text"),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),
    likes: integer("likes").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`)
});
