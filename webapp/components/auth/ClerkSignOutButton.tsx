'use client';

import { useClerk } from '@clerk/nextjs';
import { db } from '@/lib/instantdb';

export function ClerkSignOutButton() {
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        try {
            // First sign out of Instant to clear the Instant session
            await db.auth.signOut();
            // Then sign out of Clerk to clear the Clerk session
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
        >
            <span className="text-base">🚪</span>
            Sign Out
        </button>
    );
}
