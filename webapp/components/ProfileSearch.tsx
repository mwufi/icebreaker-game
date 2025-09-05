'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search profiles by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                />
            </div>

            {filteredProfiles.length === 0 && (
                <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No profiles found matching your search</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.map((profile) => (
                    <Card key={profile.id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
                        <CardHeader className="pb-4">
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage 
                                        src={profile.profilePicUrl} 
                                        alt={profile.name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                                        {getInitials(profile.name)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                    <Link href={`/profiles/${profile.id}`} className="hover:underline">
                                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                                            {profile.name}
                                        </h3>
                                    </Link>
                                    {profile.tagline && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {profile.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            {profile.linkedUser ? (
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Linked to:</span>
                                        <p className="text-gray-900">{profile.linkedUser.email || 'User'}</p>
                                    </div>
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        disabled
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Already Linked
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    onClick={() => onConfirmLink ? onConfirmLink(profile.id) : onLink(profile.id)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                                >
                                    Link This Profile
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}