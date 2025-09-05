'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AvatarPopover } from '@/components/auth/AvatarPopover';
import { SignInLink } from '@/components/auth/SignInLink';

export function Navigation() {
    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-900">SuperSecret</h1>
                </div>

                <div className="flex items-center gap-4">
                    <SignedIn>
                        <AvatarPopover />
                    </SignedIn>
                    <SignedOut>
                        <SignInLink />
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
}
