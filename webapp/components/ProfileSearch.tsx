'use client';

import { useState, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Profile {
    id: string;
    name: string;
    tagline?: string;
    profilePicUrl?: string;
    createdAt: number;
    linkedUser?: {
        id: string;
        email?: string;
    } | null;
}

interface ProfileSearchProps {
    profiles: Profile[];
    linkedProfiles: Profile[];
    onLink: (profileId: string) => void;
    onConfirmLink?: (profileId: string) => void;
}

export function ProfileSearch({ profiles, linkedProfiles, onLink, onConfirmLink }: ProfileSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const allProfiles = [...profiles, ...linkedProfiles];
    
    const filteredProfiles = useMemo(() => {
        if (!searchQuery.trim()) return allProfiles;
        
        const query = searchQuery.toLowerCase();
        return allProfiles.filter(profile => 
            profile.name.toLowerCase().includes(query) ||
            profile.tagline?.toLowerCase().includes(query)
        );
    }, [allProfiles, searchQuery]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                    type="text"
                    placeholder="Search profiles by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent backdrop-blur-sm"
                />
            </div>

            <ScrollArea className="h-[400px] rounded-lg border border-white/10">
                <div className="space-y-3 p-3">
                    {filteredProfiles.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="h-12 w-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/50">No profiles found matching your search</p>
                        </div>
                    ) : (
                        filteredProfiles.map((profile) => (
                            <div 
                                key={profile.id} 
                                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                            >
                                <Avatar className="h-12 w-12 border border-white/20">
                                    <AvatarImage 
                                        src={profile.profilePicUrl} 
                                        alt={profile.name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
                                        {getInitials(profile.name)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white truncate">
                                        {profile.name}
                                    </h3>
                                    {profile.tagline && (
                                        <p className="text-sm text-white/60">
                                            {profile.tagline}
                                        </p>
                                    )}
                                </div>

                                {profile.linkedUser ? (
                                    <span className="text-sm text-white/40 px-3 py-1 bg-white/5 rounded-full">
                                        Already linked
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => onConfirmLink ? onConfirmLink(profile.id) : onLink(profile.id)}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-full transition-all whitespace-nowrap"
                                    >
                                        Link This Profile
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}