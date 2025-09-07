import { init } from '@instantdb/react';

// Initialize InstantDB client
export const db = init({
    appId: 'c9101835-8d47-43cd-bb30-ff27dda49da7',
    devtool: false
});

// Export the database instance for use in components
export default db;
