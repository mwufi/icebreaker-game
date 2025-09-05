// Check if profiles and comments are already in InstantDB
import { init } from '@instantdb/admin';
import { config } from 'dotenv';

config({ path: '.env.local' });

const db = init({
    appId: 'c9101835-8d47-43cd-bb30-ff27dda49da7',
    adminToken: process.env.INSTANT_APP_ADMIN_TOKEN as string,
});

async function check() {
    try {
        const result = await db.query({
            profiles: {},
            profileComments: {}
        });
        
        console.log('Query result:', result);
        
        if (result.data) {
            console.log('Profiles count:', result.data.profiles?.length || 0);
            console.log('Comments count:', result.data.profileComments?.length || 0);
            
            if (result.data.profileComments && result.data.profileComments.length > 0) {
                console.log('Sample comment:', result.data.profileComments[0]);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

check();