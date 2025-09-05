// Check if profiles and comments are already in InstantDB
import { init } from '@instantdb/admin';
import { config } from 'dotenv';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../scraper/src/schema';

config({ path: '.env.local' });

const db = init({
    appId: 'c9101835-8d47-43cd-bb30-ff27dda49da7',
    adminToken: process.env.INSTANT_APP_ADMIN_TOKEN as string,
});

async function check() {
    try {
        console.log('\x1b[36m📊 Database Comparison Summary\x1b[0m');
        console.log('\x1b[36m' + '═'.repeat(50) + '\x1b[0m\n');
        
        // Check SQLite database
        const sqlitePath = '../scraper/profiles.db';
        const sqlite = new Database(sqlitePath, { readonly: true });
        const sqliteDb = drizzle(sqlite, { schema });
        
        const sqliteProfiles = sqliteDb.select().from(schema.profiles).all();
        const sqliteComments = sqliteDb.select().from(schema.comments).all();
        
        console.log('\x1b[33m📁 SQLite Database (profiles.db)\x1b[0m');
        console.log(`   └─ Profiles: \x1b[32m${sqliteProfiles.length}\x1b[0m`);
        console.log(`   └─ Comments: \x1b[32m${sqliteComments.length}\x1b[0m`);
        
        // Check InstantDB
        const result = await db.query({
            profiles: {},
            profileComments: {}
        });
        
        const instantProfiles = result.profiles || [];
        const instantComments = result.profileComments || [];
        
        console.log('\n\x1b[35m☁️  InstantDB\x1b[0m');
        console.log(`   └─ Profiles: \x1b[32m${instantProfiles.length}\x1b[0m`);
        console.log(`   └─ Comments: \x1b[32m${instantComments.length}\x1b[0m`);
        
        // Show sync status
        console.log('\n\x1b[36m🔄 Sync Status\x1b[0m');
        
        const profileDiff = sqliteProfiles.length - instantProfiles.length;
        const commentDiff = sqliteComments.length - instantComments.length;
        
        if (profileDiff === 0 && commentDiff === 0) {
            console.log('   \x1b[32m✅ Fully synchronized!\x1b[0m');
        } else {
            if (profileDiff > 0) {
                console.log(`   \x1b[33m⚠️  ${profileDiff} profiles pending migration\x1b[0m`);
            } else if (profileDiff < 0) {
                console.log(`   \x1b[31m⚠️  InstantDB has ${Math.abs(profileDiff)} extra profiles\x1b[0m`);
            } else {
                console.log('   \x1b[32m✓ Profiles synced\x1b[0m');
            }
            
            if (commentDiff > 0) {
                console.log(`   \x1b[33m⚠️  ${commentDiff} comments pending migration\x1b[0m`);
            } else if (commentDiff < 0) {
                console.log(`   \x1b[31m⚠️  InstantDB has ${Math.abs(commentDiff)} extra comments\x1b[0m`);
            } else {
                console.log('   \x1b[32m✓ Comments synced\x1b[0m');
            }
        }
        
        // Show profile details if requested
        const args = process.argv.slice(2);
        if (args.includes('--details') || args.includes('-d')) {
            console.log('\n\x1b[36m📋 Profile Details\x1b[0m');
            console.log('\x1b[90m' + '─'.repeat(50) + '\x1b[0m');
            
            // Create a map of InstantDB profiles by name
            const instantProfileMap = new Map(instantProfiles.map(p => [p.name, p]));
            
            for (const sqliteProfile of sqliteProfiles) {
                const instantProfile = instantProfileMap.get(sqliteProfile.name);
                const status = instantProfile ? '\x1b[32m✓\x1b[0m' : '\x1b[33m○\x1b[0m';
                console.log(`${status} ${sqliteProfile.name}`);
            }
            
            // Check for profiles that exist in InstantDB but not SQLite
            const sqliteNames = new Set(sqliteProfiles.map(p => p.name));
            for (const instantProfile of instantProfiles) {
                if (!sqliteNames.has(instantProfile.name)) {
                    console.log(`\x1b[31m✗ ${instantProfile.name} (only in InstantDB)\x1b[0m`);
                }
            }
        } else {
            console.log('\n\x1b[90mTip: Use --details or -d flag to see individual profiles\x1b[0m');
        }
        
        sqlite.close();
        
    } catch (error) {
        console.error('\x1b[31m❌ Error:\x1b[0m', error);
    }
}

check();