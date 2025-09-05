import { config } from 'dotenv';
import { init, id } from '@instantdb/admin';

// Load environment variables from .env.local
config({ path: '.env.local' });

// ID for app: nglapp
const APP_ID = 'c9101835-8d47-43cd-bb30-ff27dda49da7';
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN!;

if (!ADMIN_TOKEN) {
    throw new Error('INSTANT_APP_ADMIN_TOKEN is required');
}

const db = init({
    appId: APP_ID,
    adminToken: ADMIN_TOKEN,
});


