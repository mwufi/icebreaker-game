import { db } from "./db";
import { profiles, comments } from "./schema";
import { eq } from "drizzle-orm";

const PORT = 3000;

type IncomingProfile = {
    name: string;
    tagline?: string | null;
    profileText?: string | null;
    profileRawHtml?: string | null;
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

// Simple CORS helper
function withCORS(init: ResponseInit = {}) {
    const headers = new Headers(init.headers || {});
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    return headers;
}

async function handlePostProfiles(req: Request) {
    let payload: IncomingProfile;
    try {
        payload = await req.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid JSON" }),
            { status: 400, headers: withCORS({ "Content-Type": "application/json" }) }
        );
    }

    if (!payload?.name) {
        return new Response(
            JSON.stringify({ error: "`name` is required" }),
            { status: 400, headers: withCORS({ "Content-Type": "application/json" }) }
        );
    }

    // Insert the profile (optional: upsert by name if you want)
    const inserted = await db.insert(profiles).values({
        name: payload.name,
        tagline: payload.tagline ?? null,
        profileText: payload.profileText ?? null,
        profileRawHtml: payload.profileRawHtml ?? null
    }).returning({ id: profiles.id });

    const profileId = inserted[0].id;

    // Insert comments (if any)
    const items = (payload.comments ?? []).map((c) => ({
        profileId,
        authorName: c.authorName ?? null,
        authorTagline: c.authorTagline ?? null,
        authorHref: c.authorHref ?? null,
        dateText: c.dateText ?? null,
        bodyText: c.text ?? null,
        bodyHtml: c.rawHtml ?? null,
        likes: Number.isFinite(c.likes as number) ? (c.likes as number) : 0
    }));

    if (items.length) {
        await db.insert(comments).values(items);
    }

    return new Response(
        JSON.stringify({ ok: true, profileId, commentsInserted: items.length }),
        { status: 201, headers: withCORS({ "Content-Type": "application/json" }) }
    );
}

const server = Bun.serve({
    port: PORT,
    fetch: async (req) => {
        const url = new URL(req.url);

        // CORS preflight
        if (req.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: withCORS() });
        }

        if (url.pathname === "/profiles" && req.method === "POST") {
            return handlePostProfiles(req);
        }

        if (url.pathname === "/profiles" && req.method === "GET") {
            // quick viewer
            const rows = await db.query.profiles.findMany({
                orderBy: (p, { desc }) => [desc(p.createdAt)]
            });
            return new Response(JSON.stringify(rows, null, 2), {
                headers: withCORS({ "Content-Type": "application/json" })
            });
        }

        return new Response("Not found", { status: 404, headers: withCORS() });
    }
});

console.log(`🚀 listening on http://localhost:${server.port}`);
