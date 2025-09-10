'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, MoreHorizontal, Trophy, Clock, Share2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';
import { useUser } from '@clerk/nextjs';

const DAILY_PROMPT = "What happens when founders' wildest startup dreams become tomorrow's reality?";
const REVEAL_TIME = "6:00 PM";
const MAX_VOTES = 5;

interface HeadlineItem {
    id: string;
    text: string;
    votes: any[];
    isYours?: boolean;
}

export default function NewsPage() {
    const { user } = useUser();
    const [currentView, setCurrentView] = useState<'voting' | 'leaderboard'>('voting');
    const [timeUntilReveal, setTimeUntilReveal] = useState('4h 23m');

    // Get current user's profile
    const { data: profileData } = db.useQuery({
        $users: {
            odfProfile: {}
        }
    });

    const currentProfile = profileData?.$users?.[0]?.odfProfile?.[0];

    // Get all headline items with their votes
    const { data: headlinesData } = db.useQuery({
        headlineItems: {
            votes: {
                voter: {}
            }
        }
    });

    // Get user's votes to track what they've already voted on
    const { data: userVotesData } = db.useQuery({
        headlineItemVotes: {
            $: {
                where: {
                    voter: currentProfile?.id
                }
            }
        }
    });

    const userVotes = userVotesData?.headlineItemVotes || [];
    const userVotedIds = userVotes.map(vote => vote.item?.id).filter(Boolean);

    // Transform headlines data
    const headlines: HeadlineItem[] = (headlinesData?.headlineItems || []).map(item => ({
        id: item.id,
        text: item.text,
        votes: item.votes || [],
        isYours: false // We'll determine this based on the author if needed
    }));

    // Mock countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            // This would be a real countdown in production
            const times = ['4h 22m', '4h 21m', '4h 20m', '4h 19m'];
            setTimeUntilReveal(prev => {
                const currentIndex = times.indexOf(prev);
                return currentIndex < times.length - 1 ? times[currentIndex + 1] : '4h 19m';
            });
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const handleVote = (headlineId: string) => {
        if (!currentProfile || userVotedIds.length >= MAX_VOTES || userVotedIds.includes(headlineId)) {
            return;
        }

        // Create a new vote
        db.transact([
            db.tx.headlineItemVotes[id()].update({}).link({
                voter: currentProfile.id,
                item: headlineId
            })
        ]);
    };

    const handleReport = (headlineId: string) => {
        console.log('Reported headline:', headlineId);
        // Handle report functionality
    };

    const sortedHeadlines = [...headlines].sort((a, b) => b.votes.length - a.votes.length);
    const remainingVotes = MAX_VOTES - userVotedIds.length;

    if (currentView === 'leaderboard') {
        return (
            <div className="min-h-screen bg-black">
                {/* Header */}
                <div className="border-b border-red-900/50 bg-gray-900">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Trophy className="w-5 h-5 text-red-400" />
                            <h1 className="text-red-400 text-lg font-mono">DAILY LEADERBOARD</h1>
                        </div>
                        <p className="text-gray-400 text-sm font-mono">SEPTEMBER 10, 2025</p>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="max-w-4xl mx-auto p-4 space-y-2">
                    {sortedHeadlines.map((headline, index) => (
                        <Card key={headline.id} className={`bg-gray-900 border-gray-700 ${headline.isYours ? 'ring-2 ring-red-500 bg-red-950/30' : ''}`}>
                            <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-mono ${index === 0 ? 'bg-red-600 border-red-400 text-white' :
                                            index === 1 ? 'bg-gray-700 border-gray-500 text-gray-300' :
                                                index === 2 ? 'bg-amber-800 border-amber-600 text-amber-200' :
                                                    'bg-gray-800 border-gray-600 text-gray-400'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <span className="text-red-400 text-xs font-mono">{headline.votes.length}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="mb-2 text-gray-200 text-sm leading-tight">{headline.text}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-xs font-mono">ANONYMOUS</span>
                                            {headline.isYours && (
                                                <Badge className="ml-auto bg-red-600 text-white border-none text-xs font-mono">YOU</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Share Button */}
                    <Card className="bg-gray-900 border-gray-700">
                        <CardContent className="p-3">
                            <Button className="w-full bg-red-800 hover:bg-red-700 text-white border-none font-mono text-sm">
                                <Share2 className="w-4 h-4 mr-2" />
                                EXPORT RESULTS
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Back to Voting */}
                    <Button
                        variant="ghost"
                        className="w-full bg-gray-800 text-red-400 hover:bg-gray-700 border-gray-600 font-mono text-sm"
                        onClick={() => setCurrentView('voting')}
                    >
                        RETURN TO VOTING
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="border-b border-red-900/50 bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="mb-1 text-red-400 text-lg font-mono">{DAILY_PROMPT}</h1>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>REVEAL IN {timeUntilReveal}</span>
                    </div>
                </div>
            </div>

            {/* Headlines List */}
            <div className="max-w-4xl mx-auto p-4 space-y-2">
                {headlines.map((headline) => (
                    <Card key={headline.id} className="bg-gray-900 border-gray-700 hover:border-red-800 transition-colors">
                        <CardContent className="p-3">
                            <div className="flex gap-3 items-center">
                                <div className="flex-1">
                                    <p className="text-gray-200 text-sm leading-tight mb-1">{headline.text}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs font-mono">ANONYMOUS</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-500 hover:text-red-400">
                                                    <MoreHorizontal className="w-3 h-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                                <DropdownMenuItem onClick={() => handleReport(headline.id)} className="text-gray-300 hover:text-red-400">
                                                    Report
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        size="sm"
                                        onClick={() => handleVote(headline.id)}
                                        disabled={userVotedIds.length >= MAX_VOTES && !userVotedIds.includes(headline.id)}
                                        className={`w-14 h-10 p-0 font-mono text-xs transition-all transform hover:scale-105 ${userVotedIds.includes(headline.id)
                                            ? 'bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 shadow-lg shadow-red-500/50'
                                            : 'bg-gray-800 hover:bg-red-900 text-red-400 border-2 border-red-800 hover:border-red-600'
                                            }`}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <span className="text-red-400 text-xs font-mono">{headline.votes.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Separator className="bg-gray-800 my-4" />

                {/* Footer */}
                <div className="text-center py-4">
                    <p className="text-red-400 mb-4 font-mono text-sm">
                        {remainingVotes} VOTES REMAINING
                    </p>
                    <Button
                        variant="outline"
                        className="bg-gray-900 text-red-400 hover:bg-red-900 border-red-800 hover:border-red-600 font-mono"
                        onClick={() => setCurrentView('leaderboard')}
                    >
                        ACCESS LEADERBOARD
                    </Button>
                </div>
            </div>
        </div>
    );
}
