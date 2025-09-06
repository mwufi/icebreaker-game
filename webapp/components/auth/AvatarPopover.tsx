'use client';

import { useUser } from '@clerk/nextjs';
import { ClerkSignOutButton } from './ClerkSignOutButton';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    IconUser,
    IconUsers,
    IconBug,
    IconSettings,
    IconCode,
} from "@tabler/icons-react";

export function AvatarPopover() {
    const { user } = useUser();

    const menuItems = [
        { label: 'Profile', icon: IconUser, href: '/profile' },
        { label: 'Community', icon: IconUsers, href: '/community' },
        { label: 'Settings', icon: IconSettings, href: '/settings' },
        {
            label: 'Report Bug', icon: IconBug, href: null, onClick: () => {
                window.open('https://github.com/mwufi/icebreaker-game/issues', '_blank');
            }
        },
        {
            label: 'Modify this site', icon: IconCode, href: null, onClick: () => {
                window.open('https://github.com/mwufi/icebreaker-game', '_blank');
            }
        },
    ];

    const userDisplayName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
    const userInitials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.firstName?.[0]?.toUpperCase() || 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-transparent hover:border-gray-200 transition-colors">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl} alt={userDisplayName} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-sm font-medium">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.imageUrl} alt={userDisplayName} />
                            <AvatarFallback className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {userDisplayName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.emailAddresses?.[0]?.emailAddress}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return item.href ? (
                        <DropdownMenuItem key={index} asChild>
                            <Link href={item.href} className="flex items-center gap-3 cursor-pointer px-2 py-1.5">
                                <IconComponent className="h-4 w-4 text-muted-foreground font-bold" />
                                <span className="font-semibold">{item.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem key={index} onClick={item.onClick} className="flex items-center gap-3 cursor-pointer px-2 py-1.5">
                            <IconComponent className="h-4 w-4 text-muted-foreground font-bold" />
                            <span className="font-semibold">{item.label}</span>
                        </DropdownMenuItem>
                    );
                })}
                <DropdownMenuSeparator />
                <ClerkSignOutButton />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
