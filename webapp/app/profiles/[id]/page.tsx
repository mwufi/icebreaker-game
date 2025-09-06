'use client';

import { useParams } from 'next/navigation';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { GameProfile } from '@/components/profile/GameProfile';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ProfileViewContent() {
    const params = useParams();
    const profileId = params.id as string;
    const { user } = db.useAuth();

    const { data, isLoading, error } = db.useQuery({
        profiles: {
            $: {
                where: {
                    id: profileId
                }
            },
            linkedUser: {},
            comments: {
                $: {
                    order: {
                        createdAt: 'desc'
                    }
                }
            }
        }
    });

    const profile = data?.profiles?.[0];
    const isOwner = profile?.linkedUser?.[0]?.id === user?.id;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="text-red-500">Profile not found</div>
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        );
    }

    const handleIce = () => {
        // TODO: Implement ice breaking functionality
        console.log('Breaking the ice with', profile.name);
    };

    return (
        <GameProfile 
            profile={profile}
            isOwner={isOwner}
            onIce={handleIce}
        />
    );
}

export default function ProfileViewPage() {
    return (
        <ClerkSignedInComponent>
            <ProfileViewContent />
        </ClerkSignedInComponent>
    );
}