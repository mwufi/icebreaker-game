'use client';

import { useParams } from 'next/navigation';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { CommentsList } from '@/components/profile/CommentsList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ProfileViewContent() {
    const params = useParams();
    const profileId = params.id as string;

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

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Profile
                </h1>
                <Button asChild variant="outline" size="sm">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
            </div>

            <ProfileCard profile={profile} />

            {profile.linkedUser && (
                <div className="text-sm text-gray-600 bg-gray-100 rounded-lg p-4">
                    <span className="font-medium">Linked to user:</span> {profile.linkedUser?.[0]?.email || 'User'}
                </div>
            )}

            <CommentsList comments={profile.comments || []} />
        </div>
    );
}

export default function ProfileViewPage() {
    return (
        <ClerkSignedInComponent>
            <ProfileViewContent />
        </ClerkSignedInComponent>
    );
}