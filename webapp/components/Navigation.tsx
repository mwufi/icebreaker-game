'use client';

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { AvatarPopover } from '@/components/auth/AvatarPopover';
import { SignInLink } from '@/components/auth/SignInLink';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
                        {/* Gem count display */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 mr-2 cursor-help">
                                    <img
                                        src="/assets/gem.png"
                                        alt="Gems"
                                        className="w-6 h-6"
                                    />
                                    <span className="font-medium text-gray-800">
                                        0
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Gems are earned through meaningful interactions and help unlock special features</p>
                            </TooltipContent>
                        </Tooltip>
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
