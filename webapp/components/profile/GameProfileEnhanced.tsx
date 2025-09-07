'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
    Sparkles,
    Calendar,
    Activity,
    MessageCircle,
    Trophy,
    Star,
    Zap,
    Edit,
    Unlink,
    Snowflake,
    Save,
    X,
    Eye,
    EyeOff,
    Lock
} from 'lucide-react';
import { CommentsList } from './CommentsList';
import Link from 'next/link';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';

interface GameProfileProps {
    profile: any;
    isOwner: boolean;
    onUnlink?: () => void;
    onIce?: () => void;
}

export function GameProfileEnhanced({ profile, isOwner, onUnlink, onIce }: GameProfileProps) {
    const [activeTab, setActiveTab] = useState('bio');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingPreferences, setIsEditingPreferences] = useState(false);
    const [bioText, setBioText] = useState(profile.profileText || '');
    const [preferencesText, setPreferencesText] = useState(profile.preferences?.[0]?.lookingFor || '');
    const [showPreferences, setShowPreferences] = useState(true);
    const [saving, setSaving] = useState(false);

    // Mock data for now - would come from the profile data
    const level = 6;
    const currentExp = 65;
    const maxExp = 100;
    const stats = {
        connections: 15,
        affinity: 31,
        awards: 4
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSaveBio = async () => {
        setSaving(true);
        try {
            await db.transact([
                db.tx.profiles[profile.id].update({
                    profileText: bioText,
                    profileRawHtml: `<p>${bioText.replace(/\n/g, '<br/>')}</p>`
                })
            ]);
            setIsEditingBio(false);
        } catch (error) {
            console.error('Error saving bio:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            const preferences = profile.preferences?.[0];
            if (preferences) {
                // Update existing preferences
                await db.transact([
                    db.tx.preferences[preferences.id].update({
                        lookingFor: preferencesText
                    })
                ]);
            } else {
                // Create new preferences linked to profile
                await db.transact([
                    db.tx.preferences[id()].update({
                        lookingFor: preferencesText
                    }).link({
                        profile: profile.id
                    })
                ]);
            }
            setIsEditingPreferences(false);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 pb-20 space-y-6">
            {/* Header with Avatar and Basic Info */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Avatar with glow effect */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-lg opacity-50" />
                                <Avatar className="relative h-24 w-24 ring-4 ring-white dark:ring-gray-800">
                                    <AvatarImage src={profile.profilePicUrl} alt={profile.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                                        {getInitials(profile.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Name and Tagline */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {profile.name}
                                </h1>
                                {profile.tagline && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {profile.tagline}
                                    </p>
                                )}
                            </div>

                            {/* Level Progress */}
                            <div className="w-full max-w-xs space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        Level {level}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {currentExp}/{maxExp} XP
                                    </span>
                                </div>
                                <Progress value={(currentExp / maxExp) * 100} className="h-2" />
                            </div>

                            {/* Stats */}
                            <div className="flex justify-around w-full max-w-sm pt-2">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.connections}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">connections</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.affinity}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">affinity</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.awards}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">awards</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                {isOwner ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onUnlink}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Unlink className="h-4 w-4 mr-2" />
                                            Unlink Profile
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={onIce}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                                    >
                                        <Snowflake className="h-4 w-4 mr-2" />
                                        Break the Ice
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preferences Section - Only visible to owner */}
            {isOwner && (
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Lock className="h-5 w-5 text-purple-600" />
                                Your Preferences (Hidden)
                            </h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPreferences(!showPreferences)}
                                >
                                    {showPreferences ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                {!isEditingPreferences && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingPreferences(true)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {showPreferences && (
                            <>
                                {isEditingPreferences ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={preferencesText}
                                            onChange={(e) => setPreferencesText(e.target.value)}
                                            placeholder="Tell the AI what kind of connections you'd like..."
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setPreferencesText(profile.preferences?.[0]?.lookingFor || '');
                                                    setIsEditingPreferences(false);
                                                }}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSavePreferences}
                                                disabled={saving}
                                            >
                                                <Save className="h-4 w-4 mr-1" />
                                                {saving ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {preferencesText || 'No preferences set yet. Click the pencil to add what you\'re looking for!'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tabs for different sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="bio" className="flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Bio</span>
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="flex items-center gap-1.5">
                        <Activity className="h-4 w-4" />
                        <span className="hidden sm:inline">Activities</span>
                    </TabsTrigger>
                    <TabsTrigger value="events" className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">Events</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="bio" className="mt-6">
                    <Card className="border-0 bg-gray-50 dark:bg-gray-900">
                        <CardContent className="p-6">
                            {isOwner && (
                                <div className="flex justify-end mb-2">
                                    {!isEditingBio && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditingBio(true)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit Bio
                                        </Button>
                                    )}
                                </div>
                            )}

                            {isEditingBio ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={bioText}
                                        onChange={(e) => setBioText(e.target.value)}
                                        placeholder="Tell everyone about yourself..."
                                        className="min-h-[200px]"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setBioText(profile.profileText || '');
                                                setIsEditingBio(false);
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveBio}
                                            disabled={saving}
                                        >
                                            <Save className="h-4 w-4 mr-1" />
                                            {saving ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: profile.profileRawHtml || profile.profileText || '<p>No bio yet.</p>'
                                    }}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Comments</h3>
                        <CommentsList comments={profile.comments || []} />
                    </div>
                </TabsContent>

                <TabsContent value="activities" className="mt-6">
                    <Card className="border-0 bg-gray-50 dark:bg-gray-900">
                        <CardContent className="p-12 text-center">
                            <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No activities yet.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Games and activities will appear here</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events" className="mt-6">
                    <Card className="border-0 bg-gray-50 dark:bg-gray-900">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No events yet.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Attended events will appear here</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Achievements/Awards Section */}
            <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        Achievements
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">First Steps</p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Quick Match</p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Party Star</p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg opacity-50">
                            <div className="h-8 w-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mx-auto mb-1" />
                            <p className="text-xs text-gray-400 dark:text-gray-500">Locked</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}