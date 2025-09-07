import 'dotenv/config';
import { init, tx } from '@instantdb/admin';

if (!process.env.INSTANT_APP_ID || !process.env.INSTANT_ADMIN_TOKEN) {
  console.error('Missing INSTANT_APP_ID or INSTANT_ADMIN_TOKEN in environment variables');
  process.exit(1);
}

const db = init({
  appId: process.env.INSTANT_APP_ID,
  adminToken: process.env.INSTANT_ADMIN_TOKEN,
});

async function makeAdmin(profileId: string) {
  try {
    await db.transact([
      tx.profiles[profileId].update({
        isAdmin: true
      })
    ]);
    
    console.log(`Successfully set isAdmin=true for profile ${profileId}`);
  } catch (error) {
    console.error('Error setting admin status:', error);
  }
}

// Get profile ID from command line argument
const profileId = process.argv[2];

if (!profileId) {
  console.error('Usage: bun run dev/makeAdmin.ts <profileId>');
  console.log('\nTo find profile IDs, you can check the profiles in the database');
  process.exit(1);
}

makeAdmin(profileId);