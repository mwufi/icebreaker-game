'use client';

import { useAuth } from '@clerk/nextjs';
import { db } from '@/lib/instantdb';
import { useEffect } from 'react';
import { ResponsiveNavigation } from '@/components/ResponsiveNavigation';

// Use the clerk client name you set in the InstantDB dashboard auth tab
const CLERK_CLIENT_NAME = process.env.NEXT_PUBLIC_CLERK_CLIENT_NAME || 'clerk';

export function ClerkSignedInComponent({ children }: { children: React.ReactNode }) {
    const { getToken, signOut } = useAuth();

    const signInToInstantWithClerkToken = async () => {
        // getToken gets the jwt from Clerk for your signed in user.
        const idToken = await getToken();

        if (!idToken) {
            // No jwt, can't sign in to instant
            return;
        }

        // Create a long-lived session with Instant for your clerk user
        // It will look up the user by email or create a new user with
        // the email address in the session token.
        db.auth.signInWithIdToken({
            clientName: CLERK_CLIENT_NAME,
            idToken: idToken,
        });
    };

    useEffect(() => {
        signInToInstantWithClerkToken();
    }, []);

    const { isLoading, user, error } = db.useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error signing in to Instant! {error.message}</div>;
    }
    if (user) {
        return (
            <>
                <ResponsiveNavigation />
                <main className="pb-16 md:pb-0">
                    {children}
                </main>
            </>
        );
    }
    return (
        <div>
            <button onClick={signInToInstantWithClerkToken}>
                Sign in to Instant
            </button>
        </div>
    );
}
