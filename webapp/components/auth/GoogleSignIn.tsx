'use client';

import React, { useState } from 'react';
import { db } from '@/lib/instantdb';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';

// You'll need to replace these with your actual Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'REPLACE_ME';
const GOOGLE_CLIENT_NAME = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_NAME || 'REPLACE_ME';

export function GoogleSignIn() {
    const [nonce] = useState(crypto.randomUUID());

    // Debug: Log the environment variables
    console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_NAME:', GOOGLE_CLIENT_NAME);

    const handleSignOut = async () => {
        try {
            await db.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center">
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                    nonce={nonce}
                    onError={() => alert('Login failed')}
                    onSuccess={({ credential }) => {
                        db.auth
                            .signInWithIdToken({
                                clientName: GOOGLE_CLIENT_NAME,
                                idToken: credential!,
                                nonce,
                            })
                            .catch((err) => {
                                alert('Uh oh: ' + err.body?.message);
                            });
                    }}
                />
            </GoogleOAuthProvider>

            <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full max-w-xs"
            >
                Sign Out
            </Button>
        </div>
    );
}
