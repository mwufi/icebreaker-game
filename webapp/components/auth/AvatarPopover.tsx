'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ClerkSignOutButton } from './ClerkSignOutButton';

export function AvatarPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();

    const menuItems = [
        { label: 'View Profile', icon: '👤', onClick: () => setIsOpen(false) },
        { label: 'Community', icon: '💬', onClick: () => setIsOpen(false) },
        { label: 'Report a Bug', icon: '🐛', onClick: () => setIsOpen(false) },
    ];

    return (
        <div className="relative">
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium hover:scale-105 transition-transform"
            >
                {user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
            </button>

            {/* Popover */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                        <ClerkSignOutButton />
                    </div>
                </>
            )}
        </div>
    );
}
