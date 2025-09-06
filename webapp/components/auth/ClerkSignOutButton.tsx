'use client';

import { useClerk } from '@clerk/nextjs';
import { db } from '@/lib/instantdb';
import { IconLogout } from "@tabler/icons-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5">
            <IconLogout className="h-4 w-4 font-bold" />
            <span className="font-semibold">Sign Out</span>
        </DropdownMenuItem>
    );
}
