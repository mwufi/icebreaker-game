'use client';

import Link from 'next/link';

export function SignInLink() {
    return (
        <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
            Sign In
        </Link>
    );
}
