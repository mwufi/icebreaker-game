'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileCardProps {
    profile: {
        id: string;
        name: string;
        tagline?: string;
        profilePicUrl?: string;
        profileText?: string;
    };
    className?: string;
}

export function ProfileCard({ profile, className = '' }: ProfileCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card className={`overflow-hidden border-gray-200 ${className}`}>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8">
                <div className="flex items-start space-x-6">
                    <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                        <AvatarImage 
                            src={profile.profilePicUrl} 
                            alt={profile.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                            {getInitials(profile.name)}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                        {profile.tagline && (
                            <p className="text-lg text-gray-600 mt-2">{profile.tagline}</p>
                        )}
                        {profile.profileText && (
                            <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {profile.profileText}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}