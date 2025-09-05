'use client';

import { db } from '@/lib/instantdb';
import { GoogleSignIn } from './GoogleSignIn';

function UserInfo() {
    const user = db.useUser();
    return (
        <div className="flex items-center gap-3">
            <span className="font-medium">
                Welcome, {user.email}!
            </span>
        </div>
    );
}

function LoginScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to NGL App</h1>
                <p className="text-gray-600 mb-8">Please sign in to continue</p>
            </div>
            <GoogleSignIn />
        </div>
    );
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <db.SignedIn>
                <div className="min-h-screen">
                    <div className="bg-gray-100 p-4 flex justify-between items-center">
                        <UserInfo />
                        <GoogleSignIn />
                    </div>
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </db.SignedIn>
            <db.SignedOut>
                <LoginScreen />
            </db.SignedOut>
        </>
    );
}
