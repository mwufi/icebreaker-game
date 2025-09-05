'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Navigation } from '@/components/Navigation';
import { ClerkSignedInComponent } from './ClerkAuth';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SignedOut>
                <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SuperSecret</h1>
                            <p className="text-lg text-gray-600 mb-8">Please sign in to continue</p>
                            <a
                                href="/sign-in"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Sign In
                            </a>
                        </div>
                    </main>
                </div>
            </SignedOut>
            <SignedIn>
                <ClerkSignedInComponent>
                    {children}
                </ClerkSignedInComponent>
            </SignedIn>
        </>
    );
}
