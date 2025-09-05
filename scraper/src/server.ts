// src/server.ts
import { db } from "./db";
import { profiles, comments } from "./schema";
import { eq } from "drizzle-orm";

const PORT = 3000;

function corsHeaders(req: Request, extras: HeadersInit = {}) {
    const h = new Headers(extras);
    const origin = req.headers.get("origin") || "*";
    const acrh = req.headers.get("access-control-request-headers"); // e.g. "content-type, sentry-trace, baggage"

    h.set("Access-Control-Allow-Origin", origin);
    h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    h.set("Access-Control-Allow-Headers", acrh || "Content-Type, Authorization, sentry-trace, baggage");
    h.set("Access-Control-Max-Age", "86400");
    // so caches don’t mix responses with different allow lists
    h.append("Vary", "Origin");
    h.append("Vary", "Access-Control-Request-Headers");

    return h;
}

async function handlePostProfiles(req: Request) {
    type IncomingProfile = {
        name: string;
        tagline?: string | null;
        profileText?: string | null;
        profileRawHtml?: string | null;
        force?: boolean;
        comments?: Array<{
            authorName?: string | null;
            authorTagline?: string | null;
            authorHref?: string | null;
            dateText?: string | null;
            text?: string | null;
            rawHtml?: string | null;
            likes?: number | null;
        }>;
    };

    let payload: IncomingProfile;
    try {
        payload = await req.json();
        console.log("📥 POST /profiles payload:", JSON.stringify(payload, null, 2));
    } catch {
        console.log("❌ POST /profiles failed: Invalid JSON");
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: corsHeaders(req, { "Content-Type": "application/json" }),
        });
    }

    if (!payload?.name) {
        console.log("❌ POST /profiles failed: Missing required 'name' field");
        return new Response(JSON.stringify({ error: "`name` is required" }), {
            status: 400,
            headers: corsHeaders(req, { "Content-Type": "application/json" }),
        });
    }

    try {
        // Check if profile with this name already exists
        const existingProfile = await db.query.profiles.findFirst({
            where: eq(profiles.name, payload.name),
        });

        if (existingProfile && !payload.force) {
            console.log(`❌ POST /profiles failed: Profile \x1b[31m${payload.name}\x1b[0m already exists`);
            return new Response(JSON.stringify({ error: `${payload.name} already exists` }), {
                status: 409,
                headers: corsHeaders(req, { "Content-Type": "application/json" }),
            });
        }

        let profileId: number;

        if (existingProfile && payload.force) {
            // Update existing profile
            await db
                .update(profiles)
                .set({
                    tagline: payload.tagline ?? null,
                    profileText: payload.profileText ?? null,
                    profileRawHtml: payload.profileRawHtml ?? null,
                })
                .where(eq(profiles.id, existingProfile.id));

            // Delete existing comments for this profile
            await db.delete(comments).where(eq(comments.profileId, existingProfile.id));

            profileId = existingProfile.id;
            console.log(`🔄 Successfully updated \x1b[33m${payload.name}\x1b[0m in DB!`);
        } else {
            // Insert new profile
            const [{ id: newProfileId }] = await db
                .insert(profiles)
                .values({
                    name: payload.name,
                    tagline: payload.tagline ?? null,
                    profileText: payload.profileText ?? null,
                    profileRawHtml: payload.profileRawHtml ?? null,
                })
                .returning({ id: profiles.id });

            profileId = newProfileId;
            console.log(`✅ Successfully inserted \x1b[32m${payload.name}\x1b[0m into DB!`);
        }

        // Insert comments
        const items = (payload.comments ?? []).map((c) => ({
            profileId,
            authorName: c.authorName ?? null,
            authorTagline: c.authorTagline ?? null,
            authorHref: c.authorHref ?? null,
            dateText: c.dateText ?? null,
            bodyText: c.text ?? null,
            bodyHtml: c.rawHtml ?? null,
            likes: Number.isFinite(c.likes as number) ? (c.likes as number) : 0,
        }));

        if (items.length) await db.insert(comments).values(items);

        console.log(`📝 Inserted ${items.length} comments for \x1b[32m${payload.name}\x1b[0m`);

        return new Response(
            JSON.stringify({
                ok: true,
                profileId,
                commentsInserted: items.length,
                action: existingProfile && payload.force ? "updated" : "created"
            }),
            { status: 201, headers: corsHeaders(req, { "Content-Type": "application/json" }) }
        );
    } catch (error) {
        console.log(`❌ POST /profiles failed for \x1b[31m${payload.name}\x1b[0m:`, error);
        return new Response(JSON.stringify({ error: "Database error" }), {
            status: 500,
            headers: corsHeaders(req, { "Content-Type": "application/json" }),
        });
    }
}

Bun.serve({
    port: PORT,
    fetch: async (req) => {
        const url = new URL(req.url);

        // CORS preflight
        if (req.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders(req) });
        }

        if (url.pathname === "/profiles" && req.method === "POST") {
            return handlePostProfiles(req);
        }

        if (url.pathname === "/profiles" && req.method === "GET") {
            const rows = await db.query.profiles.findMany({
                orderBy: (p, { desc }) => [desc(p.createdAt)],
            });
            return new Response(JSON.stringify(rows, null, 2), {
                headers: corsHeaders(req, { "Content-Type": "application/json" }),
            });
        }

        return new Response("Not found", { status: 404, headers: corsHeaders(req) });
    },
});

console.log(`🚀 listening on http://localhost:${PORT}`);
