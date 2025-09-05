'use client';

import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, CheckCircle, Clock, User, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { id } from '@instantdb/react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';

function CommunityContent() {
    const { user } = db.useAuth();
    const router = useRouter();
    const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = db.useQuery({
        $users: {
            $: {},
            odfProfile: {}
        },
        profiles: {
            $: {},
            linkedUser: {}
        },
        inviteLink: {
            $: {},
            inviter: {},
            invitees: {}
        }
    });

    const allUsers = data?.$users || [];
    const allProfiles = data?.profiles || [];
    const allInvites = data?.inviteLink || [];

    // Users with linked profiles
    const linkedUsers = allUsers.filter((u: any) => u.odfProfile && u.odfProfile.length > 0);

    // Profiles without linked users (people we want to invite)
    const unlinkedProfiles = allProfiles.filter((p: any) => !p.linkedUser || p.linkedUser.length === 0);

    // Filter based on search query
    const filteredLinkedUsers = useMemo(() => {
        if (!searchQuery.trim()) return linkedUsers;
        
        const query = searchQuery.toLowerCase();
        return linkedUsers.filter((user: any) => {
            const profile = user.odfProfile?.[0];
            return profile?.name?.toLowerCase().includes(query) ||
                   user.email?.toLowerCase().includes(query);
        });
    }, [linkedUsers, searchQuery]);

    const filteredUnlinkedProfiles = useMemo(() => {
        if (!searchQuery.trim()) return unlinkedProfiles;
        
        const query = searchQuery.toLowerCase();
        return unlinkedProfiles.filter((profile: any) => 
            profile.name?.toLowerCase().includes(query) ||
            profile.tagline?.toLowerCase().includes(query)
        );
    }, [unlinkedProfiles, searchQuery]);

    console.log('Community page data:', {
        totalUsers: allUsers.length,
        linkedUsers: linkedUsers.length,
        totalProfiles: allProfiles.length,
        unlinkedProfiles: unlinkedProfiles.length,
        allProfiles
    });

    // Check if profile has been invited
    const hasBeenInvited = (profileId: string) => {
        // Check if there's an invite for this profile
        return allInvites.some((invite: any) =>
            invite.invitees?.some((invitee: any) => invitee.id === profileId) && !invite.fulfilledAt
        );
    };

    const handleInvite = async (targetProfile: any) => {
        const currentUserProfile = linkedUsers.find((u: any) => u.id === user?.id)?.odfProfile?.[0];
        if (!currentUserProfile) {
            alert("You need a profile to send invites!");
            return;
        }

        setInvitingUserId(null);

        // Create new invite link with a unique code
        const newInviteId = id();
        const inviteCode = `invite-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        await db.transact([
            db.tx.inviteLink[newInviteId].update({
                code: inviteCode,
                createdAt: Date.now()
            }),
            db.tx.inviteLink[newInviteId].link({
                inviter: currentUserProfile.id,
                invitees: targetProfile.id
            })
        ]);

        // Navigate to the invite page
        router.push(`/invites/${newInviteId}`);
    };

    const getInitials = (email: string) => {
        return email
            .split('@')[0]
            .split('.')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading community...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Community
            </h1>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search by name, tagline, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                />
            </div>

            {/* Users with profiles */}
            {filteredLinkedUsers.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        Active Members ({filteredLinkedUsers.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLinkedUsers.map((user: any) => {
                            const profile = user.odfProfile[0];
                            return (
                                <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                    src={profile.profilePicUrl}
                                                    alt={profile.name}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    {getInitials(profile.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 max-w-[240px] overflow-hidden">
                                                <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
                                                {profile.tagline && (
                                                    <p className="text-sm text-gray-600 truncate">{profile.tagline}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="text-sm text-gray-600 mb-3">
                                            {user.email}
                                        </div>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={`/profiles/${profile.id}`}>
                                                View Profile
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Profiles without users (people to invite) */}
            {filteredUnlinkedProfiles.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <User className="h-6 w-6 text-orange-600" />
                        People to Invite ({filteredUnlinkedProfiles.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredUnlinkedProfiles.map((profile: any) => {
                            const hasPendingInvite = hasBeenInvited(profile.id);
                            const initials = profile.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);

                            return (
                                <Card key={profile.id} className="hover:shadow-lg transition-all duration-200 bg-orange-50">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                    src={profile.profilePicUrl}
                                                    alt={profile.name}
                                                />
                                                <AvatarFallback className="bg-orange-400 text-white">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 max-w-[200px] overflow-hidden">
                                                <h3 className="font-semibold text-lg truncate">
                                                    {profile.name}
                                                </h3>
                                                {profile.tagline && (
                                                    <p className="text-sm text-gray-600 truncate">{profile.tagline}</p>
                                                )}
                                                <p className="text-xs text-orange-600 mt-1">Not signed up yet</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        {hasPendingInvite ? (
                                            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                                                <p className="font-medium text-yellow-800">Invite sent!</p>
                                                <p className="text-yellow-700 text-xs mt-1">
                                                    Waiting for them to sign up
                                                </p>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    setInvitingUserId(profile.id);
                                                }}
                                                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Invite
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No results message */}
            {searchQuery && filteredLinkedUsers.length === 0 && filteredUnlinkedProfiles.length === 0 && (
                <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No members found matching "{searchQuery}"</p>
                </div>
            )}

            <AlertDialog open={!!invitingUserId} onOpenChange={(open) => !open && setInvitingUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Send Profile Invite</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to send an invite to this user? They'll receive a notification to create their profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            const profileToInvite = filteredUnlinkedProfiles.find((p: any) => p.id === invitingUserId);
                            if (profileToInvite) {
                                handleInvite(profileToInvite);
                            }
                        }}>
                            Send Invite
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function CommunityPage() {
    return (
        <ClerkSignedInComponent>
            <CommunityContent />
        </ClerkSignedInComponent>
    );
}