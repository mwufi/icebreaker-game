'use client';

import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { useState } from 'react';
import { id } from '@instantdb/react';
import { ProfileSearch } from '@/components/ProfileSearch';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MessageCircle } from 'lucide-react';

const DEV_MODE = true;

function ProfileContent() {
    const { user } = db.useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileTagline, setNewProfileTagline] = useState('');

    // Get user's linked profile
    const { data, isLoading } = db.useQuery({
        $users: {
            $: {
                where: {
                    id: user?.id
                }
            },
            odfProfile: {}
        },
        profiles: {
            $: {
                where: {
                    linkedUser: { $isNull: true },
                }
            }
        }
    });

    const currentUser = data?.$users?.[0];
    console.log("Current user data", currentUser);
    const linkedProfile = currentUser?.odfProfile?.[0];
    const unlinkedProfiles = data?.profiles || [];

    const handleLinkProfile = async (profileId: string) => {
        if (!user?.id) return;

        await db.transact([
            db.tx.profiles[profileId].update({
                linkedUser: user.id
            })
        ]);
    };

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !newProfileName) return;

        const newProfile = {
            id: id(),
            name: newProfileName,
            tagline: newProfileTagline,
            createdAt: Date.now(),
            linkedUser: user.id
        };

        await db.transact([
            db.tx.profiles[newProfile.id].update(newProfile)
        ]);

        setIsCreating(false);
        setNewProfileName('');
        setNewProfileTagline('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (linkedProfile && !DEV_MODE) {
        const getInitials = (name: string) => {
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        };

        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Your Profile
                </h1>

                <Card className="overflow-hidden border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8">
                        <div className="flex items-start space-x-6">
                            <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                                <AvatarImage
                                    src={linkedProfile.profilePicUrl}
                                    alt={linkedProfile.name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                                    {getInitials(linkedProfile.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-gray-900">{linkedProfile.name}</h2>
                                {linkedProfile.tagline && (
                                    <p className="text-lg text-gray-600 mt-2">{linkedProfile.tagline}</p>
                                )}
                                {linkedProfile.profileText && (
                                    <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {linkedProfile.profileText}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {linkedProfile.comments && linkedProfile.comments.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <MessageCircle className="h-6 w-6 text-blue-600" />
                            Comments ({linkedProfile.comments.length})
                        </h3>
                        <div className="space-y-4">
                            {linkedProfile.comments.map((comment: any) => (
                                <Card key={comment.id} className="border-gray-200">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-semibold text-gray-900">{comment.authorName || 'Anonymous'}</span>
                                                    <span className="text-gray-500 text-sm">• {comment.dateText}</span>
                                                </div>
                                                <div className="text-gray-700 leading-relaxed">{comment.bodyText}</div>
                                                {comment.likes > 0 && (
                                                    <div className="mt-3 text-sm text-gray-600 font-medium">
                                                        ❤️ {comment.likes} like{comment.likes !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Link Your Profile
            </h1>

            {unlinkedProfiles.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Available Profiles</h2>
                    <ProfileSearch
                        profiles={unlinkedProfiles}
                        onLink={handleLinkProfile}
                    />
                </div>
            )}

            <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Plus className="h-6 w-6 text-green-600" />
                        {unlinkedProfiles.length === 0 ? "No profiles found" : "Can't find one?"} Make a new profile
                    </h2>
                </CardHeader>

                <CardContent>
                    {!isCreating ? (
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                            size="lg"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create New Profile
                        </Button>
                    ) : (
                        <form onSubmit={handleCreateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Profile Name
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    placeholder="Enter your profile name"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="tagline" className="text-sm font-medium text-gray-700">
                                    Tagline (optional)
                                </label>
                                <Input
                                    id="tagline"
                                    type="text"
                                    value={newProfileTagline}
                                    onChange={(e) => setNewProfileTagline(e.target.value)}
                                    placeholder="A brief description"
                                    className="h-11"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                                >
                                    Create Profile
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewProfileName('');
                                        setNewProfileTagline('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ClerkSignedInComponent>
            <ProfileContent />
        </ClerkSignedInComponent>
    );
}