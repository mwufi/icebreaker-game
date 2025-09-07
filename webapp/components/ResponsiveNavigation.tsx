'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AvatarPopover } from '@/components/auth/AvatarPopover';
import { SignInLink } from '@/components/auth/SignInLink';
import { Home, Users, User, Heart } from 'lucide-react';

export function ResponsiveNavigation() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Home' },
        { href: '/dashboard#connections', icon: Heart, label: 'Connections' },
        { href: '/community', icon: Users, label: 'Community' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <>
            {/* Desktop Navigation - Top */}
            <nav className="hidden md:block fixed top-0 left-0 right-0 px-4 py-3 z-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold text-white hover:text-white/80 transition-colors flex items-center">
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

            {/* Mobile Navigation - Bottom */}
            <SignedIn>
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50">
                    <div className="flex justify-around items-center py-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${isActive
                                        ? 'text-white'
                                        : 'text-white/50 hover:text-white/80'
                                        }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 mb-1 ${isActive ? 'text-white' : ''
                                            }`}
                                    />
                                    <span className="text-xs">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </SignedIn>

            {/* Mobile Top Bar for non-authenticated users */}
            <SignedOut>
                <nav className="md:hidden px-4 py-3 bg-black/50 backdrop-blur-sm border-b border-white/10">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-lg font-bold text-white">
                            SuperSecret
                        </Link>
                        <SignInLink />
                    </div>
                </nav>
            </SignedOut>
        </>
    );
}