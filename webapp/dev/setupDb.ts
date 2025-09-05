import { config } from 'dotenv';
import { init, id } from '@instantdb/admin';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as readline from 'readline';
import * as schema from '../../scraper/src/schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

// ID for app: nglapp
const APP_ID = 'c9101835-8d47-43cd-bb30-ff27dda49da7';
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN!;

if (!ADMIN_TOKEN) {
    throw new Error('INSTANT_APP_ADMIN_TOKEN is required');
}

const instantDb = init({
    appId: APP_ID,
    adminToken: ADMIN_TOKEN,
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

async function migrate() {
    console.log('\x1b[36m🚀 InstantDB Migration Tool\x1b[0m');
    console.log('');

    // Check for existing data
    const existingData = await instantDb.query({
        profiles: {},
        profileComments: {}
    });

    if (existingData && existingData.profiles && existingData.profiles.length > 0) {
        console.log('\x1b[32m📊 Found existing data in InstantDB:\x1b[0m');
        console.log(`  - ${existingData.profiles.length} profiles`);
        console.log(`  - ${existingData.profileComments?.length || 0} comments`);
        console.log('');
    }

    const dbPath = await question('Where do you want to migrate from? ');

    try {
        // Connect to SQLite using Drizzle with Bun
        const sqlite = new Database(dbPath, { readonly: true });
        const db = drizzle(sqlite, { schema });

        // Get all profiles and comments using Drizzle
        const allProfiles = db.select().from(schema.profiles).all();
        const allComments = db.select().from(schema.comments).all();

        console.log(`\n\x1b[32m✨ SQLite database contains ${allProfiles.length} profiles and ${allComments.length} comments\x1b[0m`);

        // Create a map of existing profile names to their InstantDB IDs
        const existingProfileMap = new Map<string, string>();
        if (existingData && existingData.profiles) {
            for (const profile of existingData.profiles) {
                existingProfileMap.set(profile.name, profile.id);
            }
        }

        console.log(`\x1b[33m🔍 Checking for new profiles to migrate...\x1b[0m\n`);

        const profileIdMap = new Map<number, string>();
        const profileTransactions = [];
        let skippedProfiles = 0;

        for (const profile of allProfiles) {
            // Check if profile already exists by name
            const existingId = existingProfileMap.get(profile.name);

            if (existingId) {
                // Profile exists, use existing ID
                profileIdMap.set(profile.id, existingId);
                skippedProfiles++;
                console.log(`\x1b[33m⏭️  Skipping existing profile: ${profile.name}\x1b[0m`);
            } else {
                // New profile, create it
                const instantId = id();
                profileIdMap.set(profile.id, instantId);

                profileTransactions.push(
                    instantDb.tx.profiles[instantId].update({
                        name: profile.name,
                        tagline: profile.tagline || undefined,
                        profileText: profile.profileText || undefined,
                        profileRawHtml: profile.profileRawHtml || undefined,
                        profilePicUrl: profile.profilePicUrl || undefined,
                        createdAt: profile.createdAt.getTime()
                    })
                );

                console.log(`\x1b[32m✓ Migrating new profile: ${profile.name}\x1b[0m`);
            }
        }

        if (profileTransactions.length > 0) {
            console.log(`\n\x1b[33m📤 Uploading ${profileTransactions.length} new profiles to InstantDB...\x1b[0m`);
            const profileResult = await instantDb.transact(profileTransactions);
            console.log(`\x1b[32m✅ New profiles uploaded! Transaction ID: ${profileResult['tx-id']}\x1b[0m\n`);
        } else if (skippedProfiles > 0) {
            console.log(`\n\x1b[33m✅ All ${skippedProfiles} profiles already exist, skipping profile upload\x1b[0m\n`);
        }

        const commentTransactions = [];

        for (const comment of allComments) {
            const profileInstantId = profileIdMap.get(comment.profileId);

            if (!profileInstantId) {
                console.log(`\x1b[31m⚠️  Warning: No profile found for comment ${comment.id}\x1b[0m`);
                continue;
            }

            commentTransactions.push(
                instantDb.tx.profileComments[id()].update({
                    profile: profileInstantId,
                    authorName: comment.authorName || undefined,
                    authorTagline: comment.authorTagline || undefined,
                    authorHref: comment.authorHref || undefined,
                    dateText: comment.dateText || undefined,
                    bodyText: comment.bodyText || undefined,
                    bodyHtml: comment.bodyHtml || undefined,
                    likes: comment.likes,
                    createdAt: comment.createdAt.getTime()
                }).link({
                    profileLink: profileInstantId
                })
            );
        }

        if (commentTransactions.length > 0) {
            console.log('\x1b[33m📤 Uploading comments to InstantDB...\x1b[0m');
            const commentResult = await instantDb.transact(commentTransactions);
            console.log(`\x1b[32m✅ Comments uploaded! Transaction ID: ${commentResult['tx-id']}\x1b[0m`);
        }

        console.log('\n\x1b[32m🎉 Migration completed successfully!\x1b[0m');
        console.log(`\x1b[36m📊 Summary:\x1b[0m`);
        console.log(`  - ${profileTransactions.length} new profiles added`);
        console.log(`  - ${skippedProfiles} existing profiles retained`);
        console.log(`  - ${commentTransactions.length} comments migrated`);

        sqlite.close();

    } catch (error) {
        console.error('\x1b[31m❌ Migration failed:\x1b[0m', error);
    } finally {
        rl.close();
    }
}

migrate();
