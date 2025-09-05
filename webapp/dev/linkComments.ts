import { init } from '@instantdb/admin';
import { config } from 'dotenv';

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

async function linkComments() {
    console.log('\x1b[36m🔗 Linking Comments to Profiles\x1b[0m');
    console.log('');

    try {
        // Get all profiles and comments
        const result = await instantDb.query({
            profiles: {},
            profileComments: {}
        });

        const profiles = result.profiles || [];
        const comments = result.profileComments || [];

        console.log(`\x1b[32m📊 Found ${profiles.length} profiles and ${comments.length} comments\x1b[0m`);

        // Create maps for quick lookup
        const profileMap = new Map<string, string>();
        const profileNameMap = new Map<string, string>(); // name -> id
        for (const profile of profiles) {
            profileMap.set(profile.id, profile.id);
            profileNameMap.set(profile.name, profile.id);
        }

        // Find comments that need linking
        const commentsToLinkParent = [];
        const commentsToLinkAuthor = [];
        let alreadyLinkedParent = 0;
        let alreadyLinkedAuthor = 0;
        let missingProfile = 0;
        let missingAuthor = 0;

        for (const comment of comments) {
            // Check parent profile linking
            if (comment.profile) {
                // Check if the profile ID exists
                if (profileMap.has(comment.profile)) {
                    // Check if already linked (has parentProfile relationship)
                    if (!comment.parentProfile) {
                        commentsToLinkParent.push(comment);
                    } else {
                        alreadyLinkedParent++;
                    }
                } else {
                    console.log(`\x1b[31m⚠️  Comment ${comment.id} references non-existent profile: ${comment.profile}\x1b[0m`);
                    missingProfile++;
                }
            } else {
                console.log(`\x1b[33m⚠️  Comment ${comment.id} has no profile field\x1b[0m`);
                missingProfile++;
            }

            // Check author linking
            if (comment.authorName) {
                const authorProfileId = profileNameMap.get(comment.authorName);
                if (authorProfileId) {
                    // Check if already linked (has author relationship)
                    if (!comment.author) {
                        commentsToLinkAuthor.push({ ...comment, authorProfileId });
                    } else {
                        alreadyLinkedAuthor++;
                    }
                } else {
                    console.log(`\x1b[33m⚠️  Comment ${comment.id} author "${comment.authorName}" not found in profiles\x1b[0m`);
                    missingAuthor++;
                }
            }
        }

        console.log(`\x1b[33m📋 Status:\x1b[0m`);
        console.log(`  Parent Profile Links:`);
        console.log(`    - ${alreadyLinkedParent} comments already linked`);
        console.log(`    - ${commentsToLinkParent.length} comments need linking`);
        console.log(`    - ${missingProfile} comments have issues`);
        console.log(`  Author Links:`);
        console.log(`    - ${alreadyLinkedAuthor} comments already linked`);
        console.log(`    - ${commentsToLinkAuthor.length} comments need linking`);
        console.log(`    - ${missingAuthor} authors not found in profiles`);

        if (commentsToLinkParent.length === 0 && commentsToLinkAuthor.length === 0) {
            console.log('\n\x1b[32m✅ All comments are already properly linked!\x1b[0m');
            return;
        }

        // Create transactions to link comments to profiles
        const linkTransactions = [];

        // Link parent profiles
        if (commentsToLinkParent.length > 0) {
            console.log(`\n\x1b[33m🔗 Linking ${commentsToLinkParent.length} comments to parent profiles...\x1b[0m`);
            for (const comment of commentsToLinkParent) {
                linkTransactions.push(
                    instantDb.tx.profileComments[comment.id].link({
                        parentProfile: comment.profile
                    })
                );
            }
        }

        // Link authors
        if (commentsToLinkAuthor.length > 0) {
            console.log(`\n\x1b[33m👤 Linking ${commentsToLinkAuthor.length} comments to author profiles...\x1b[0m`);
            for (const comment of commentsToLinkAuthor) {
                linkTransactions.push(
                    instantDb.tx.profileComments[comment.id].link({
                        author: comment.authorProfileId
                    })
                );
            }
        }

        // Execute the linking transactions
        if (linkTransactions.length > 0) {
            const linkResult = await instantDb.transact(linkTransactions);
            console.log(`\x1b[32m✅ Successfully linked comments! Transaction ID: ${linkResult['tx-id']}\x1b[0m`);
        }

        console.log('\n\x1b[32m🎉 Comment linking completed successfully!\x1b[0m');
        console.log(`\x1b[36m📊 Summary:\x1b[0m`);
        console.log(`  Parent Profile Links:`);
        console.log(`    - ${commentsToLinkParent.length} comments linked to parent profiles`);
        console.log(`    - ${alreadyLinkedParent} comments were already linked`);
        console.log(`    - ${missingProfile} comments had issues`);
        console.log(`  Author Links:`);
        console.log(`    - ${commentsToLinkAuthor.length} comments linked to author profiles`);
        console.log(`    - ${alreadyLinkedAuthor} comments were already linked`);
        console.log(`    - ${missingAuthor} authors not found in profiles`);

    } catch (error) {
        console.error('\x1b[31m❌ Linking failed:\x1b[0m', error);
    }
}

linkComments();
