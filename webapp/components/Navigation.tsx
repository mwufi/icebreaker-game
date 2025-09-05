'use client';

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AvatarPopover } from '@/components/auth/AvatarPopover';
import { SignInLink } from '@/components/auth/SignInLink';

export function Navigation() {
    return (
        <nav className="px-6 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                        SuperSecret
                    </Link>
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
