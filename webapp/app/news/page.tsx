'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, Trophy, Clock, Zap } from 'lucide-react';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';
import { useUser } from '@clerk/nextjs';
import JSConfetti from 'js-confetti';

const DAILY_PROMPT = "What happens when founders' wildest startup dreams become tomorrow's reality?";
const REVEAL_TIME = "6:00 PM";
const MAX_VOTES = 15;
const TARGET_VOTES = 10;

// Vote weight system
const getVoteWeight = (totalVotes: number): number => {
    if (totalVotes >= 1 && totalVotes <= 3) return 1;
    if (totalVotes >= 4 && totalVotes <= 6) return 2;
    if (totalVotes >= 7 && totalVotes <= 10) return 3;
    return 1; // Default
};

const getVoteWeightProgress = (totalVotes: number) => {
    if (totalVotes <= 3) return { current: totalVotes, max: 3, nextWeight: 2 };
    if (totalVotes <= 6) return { current: totalVotes - 3, max: 3, nextWeight: 3 };
    if (totalVotes <= 10) return { current: totalVotes - 6, max: 4, nextWeight: null };
    return { current: 0, max: 0, nextWeight: null };
};

interface HeadlineItem {
    id: string;
    text: string;
    votes: any[];
    isYours?: boolean;
    author?: any;
}

// Function to count votes based on voter weights
const countVotes = (votes: any[]): number => {
    const total = votes.reduce((sum, vote) => {
        const voteWeight = vote.voter?.[0].voteWeight || 1; // Default to 1 if no weight
        return sum + voteWeight;
    }, 0);

    // if (votes && votes.length) {
    //     console.log("votes:", votes)
    //     console.log('Vote calculation:', {
    //         voteCount: votes.length,
    //         weightedTotal: total,
    //         voters: votes.map(v => ({
    //             voterId: v.voter?.[0].id,
    //             weight: v.voter?.[0].voteWeight || 1
    //         }))
    //     });
    // }

    return total;
};

// Function to count only current user's votes
const countUserVotes = (votes: any[], currentProfileId: string | undefined): number => {
    if (!currentProfileId) return 0;
    
    const userVotes = votes.filter(vote => vote.voter?.[0]?.id === currentProfileId);
    return userVotes.length; // Just return count, not weighted, for user's own votes display
};

export default function NewsPage() {
    const { user } = useUser();
    const [currentView, setCurrentView] = useState<'voting' | 'leaderboard'>('voting');
    const [timeUntilReveal, setTimeUntilReveal] = useState('Loading...');
    const [showConfetti, setShowConfetti] = useState(false);
    const [votedItemId, setVotedItemId] = useState<string | null>(null);
    const [animateVoteWeight, setAnimateVoteWeight] = useState(false);

    // Get current user's profile
    const { data: profileData } = db.useQuery({
        $users: {
            odfProfile: {}
        }
    });

    const currentProfile = profileData?.$users?.[0]?.odfProfile?.[0];

    // Get contests to find the ODF Hack Demo contest
    const { data: contestsData } = db.useQuery({
        contests: {
            $: {
                where: {
                    name: "ODF Hack Demo"
                }
            }
        }
    });

    const contest = contestsData?.contests?.[0];

    // Get all headline items with their votes and potential author
    const { data: headlinesData } = db.useQuery({
        headlineItems: {
            votes: {
                voter: {}
            },
            author: {}
        }
    });

    // Get user's votes to track what they've already voted on
    const { data: userVotesData } = db.useQuery({
        headlineItemVotes: {
            $: {
                where: {
                    voter: currentProfile?.id
                }
            },
            item: {}
        }
    });

    const userVotes = userVotesData?.headlineItemVotes || [];
    const userVotedIds = userVotes.map((vote: any) => vote.item?.id).filter(Boolean);

    // Helper function to check if user has voted on an item
    const hasUserVotedOnItem = (itemId: string) => {
        if (!currentProfile) return false;
        const voteKey = `${currentProfile.id}-${itemId}`;
        const hasVoted = userVotes.some(vote => vote.key === voteKey);

        return hasVoted;
    };

    // Transform headlines data
    const headlines: HeadlineItem[] = (headlinesData?.headlineItems || []).map(item => ({
        id: item.id,
        text: item.text,
        votes: item.votes || [],
        isYours: item.author?.[0]?.id === currentProfile?.id,
        author: item.author?.[0]
    }));

    // Debug logging
    console.log("Contest data:", contest);
    console.log("Headlines with authors:", headlines.map(h => ({ text: h.text.substring(0, 30), author: h.author })));
    console.log("Current profile:", currentProfile);
    console.log("User votes data:", userVotesData);
    console.log("User votes:", userVotes);
    console.log("User voted IDs:", userVotedIds);

    // Real countdown timer based on contest reveal time
    useEffect(() => {
        if (!contest?.revealTime) {
            setTimeUntilReveal('No contest found');
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            const revealTime = new Date(contest.revealTime);
            const diff = revealTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeUntilReveal('REVEALED!');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeUntilReveal(`${hours}h ${minutes}m`);
            } else if (minutes > 0) {
                setTimeUntilReveal(`${minutes}m ${seconds}s`);
            } else {
                setTimeUntilReveal(`${seconds}s`);
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    const handleVote = (headlineId: string) => {
        if (!currentProfile || userVotedIds.length >= MAX_VOTES || hasUserVotedOnItem(headlineId)) {
            return;
        }

        // Create a unique key for this vote
        const voteKey = `${currentProfile.id}-${headlineId}`;

        // Calculate new vote weight based on total lifetime votes
        const currentTotalVotes = userVotes.length; // Total votes from database
        const newTotalVotes = currentTotalVotes + 1;
        const newVoteWeight = getVoteWeight(newTotalVotes);
        const oldVoteWeight = getVoteWeight(currentTotalVotes);

        // Trigger animations
        setVotedItemId(headlineId);
        if (newVoteWeight > oldVoteWeight) {
            // Spectacular confetti celebration!
            const jsConfetti = new JSConfetti();

            // Different celebrations based on weight level
            if (newVoteWeight === 2) {
                // 2x Weight Celebration - Extra special!
                jsConfetti.addConfetti({
                    emojis: ['⚡', '🔥', '💥', '🚀', '⭐', '✨', '💫', '🎆', '🎇'],
                    emojiSize: 120,
                    confettiNumber: 75,
                });

                // Multiple bursts for 2x weight
                setTimeout(() => {
                    jsConfetti.addConfetti({
                        confettiColors: ['#ff0000', '#ffaa00', '#ffff00', '#00ff00', '#00aaff', '#aa00ff'],
                        confettiRadius: 8,
                        confettiNumber: 150,
                    });
                }, 300);

                setTimeout(() => {
                    jsConfetti.addConfetti({
                        emojis: ['⚡', '🔥', '💥'],
                        emojiSize: 80,
                        confettiNumber: 30,
                    });
                }, 800);
            } else if (newVoteWeight === 3) {
                // 3x Weight Celebration - MAXIMUM POWER!
                jsConfetti.addConfetti({
                    emojis: ['👑', '⚡', '🔥', '💥', '🚀', '⭐', '✨', '💫', '🎆', '🎇', '🌟'],
                    emojiSize: 150,
                    confettiNumber: 100,
                });

                // Multiple massive bursts for 3x weight
                setTimeout(() => {
                    jsConfetti.addConfetti({
                        confettiColors: ['#ff0000', '#ffaa00', '#ffff00', '#00ff00', '#00aaff', '#aa00ff', '#ff00ff'],
                        confettiRadius: 10,
                        confettiNumber: 200,
                    });
                }, 200);

                setTimeout(() => {
                    jsConfetti.addConfetti({
                        emojis: ['👑', '⚡', '🔥'],
                        emojiSize: 100,
                        confettiNumber: 50,
                    });
                }, 600);

                setTimeout(() => {
                    jsConfetti.addConfetti({
                        confettiColors: ['#ff0000', '#ffff00', '#ff00ff'],
                        confettiRadius: 12,
                        confettiNumber: 100,
                    });
                }, 1000);
            }

            // Animate vote weight display
            setAnimateVoteWeight(true);
            setTimeout(() => setAnimateVoteWeight(false), 2000);

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }

        // Reset voted item animation after a short delay
        setTimeout(() => setVotedItemId(null), 1000);

        // Create a new vote with unique key and update profile vote weight
        db.transact([
            db.tx.headlineItemVotes[id()].update({
                key: voteKey
            }).link({
                voter: currentProfile.id,
                item: headlineId
            }),
            db.tx.profiles[currentProfile.id].update({
                voteWeight: newVoteWeight
            })
        ]);
    };

    const sortedHeadlines = [...headlines].sort((a, b) => countVotes(b.votes) - countVotes(a.votes));
    const remainingVotes = MAX_VOTES - userVotedIds.length;

    // Calculate vote weight progress based on total lifetime votes
    const totalLifetimeVotes = userVotes.length; // Total votes from database
    const currentVoteWeight = getVoteWeight(totalLifetimeVotes);
    const progress = getVoteWeightProgress(totalLifetimeVotes);

    // Determine if we should show names
    const currentTime = new Date();
    const revealTime = contest?.revealTime ? new Date(contest.revealTime) : null;
    const shouldShowNames = contest?.showNames || (revealTime && currentTime >= revealTime);
    console.log("shouldShowNames", shouldShowNames)

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
                <div className="max-w-4xl mx-auto p-4 pb-40 space-y-2">
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
                                        <span className="text-red-400 text-xs font-mono">{countVotes(headline.votes)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="mb-2 text-gray-200 text-sm leading-tight">{headline.text}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-xs font-mono">
                                                {shouldShowNames && headline.author?.name ? headline.author.name : 'ANONYMOUS'}
                                                {/* Debug: {shouldShowNames ? `(show: ${headline.author?.name || 'no name'})` : '(hidden)'} */}
                                            </span>
                                            {headline.isYours && (
                                                <Badge className="ml-auto bg-red-600 text-white border-none text-xs font-mono">YOU</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Bottom padding to account for fixed footer */}
                    <div className="h-32"></div>
                </div>

                {/* Fixed Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-red-900/50 p-4">
                    <div className="max-w-4xl mx-auto">
                        <Button
                            variant="ghost"
                            className="w-full bg-gray-800 text-red-400 hover:bg-gray-700 border-gray-600 font-mono text-sm"
                            onClick={() => setCurrentView('voting')}
                        >
                            RETURN TO VOTING
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="text-6xl animate-bounce">
                            {currentVoteWeight === 2 ? '⚡' : currentVoteWeight === 3 ? '👑' : '🎉'}
                        </div>
                        <div className="text-4xl animate-pulse text-red-400 font-mono text-center mt-2">
                            {currentVoteWeight === 2 ? '2X POWER UNLOCKED!' :
                                currentVoteWeight === 3 ? 'MAXIMUM POWER ACHIEVED!' :
                                    'VOTE WEIGHT UP!'}
                        </div>
                        <div className="text-2xl animate-bounce text-yellow-400 font-mono text-center mt-1">
                            {currentVoteWeight === 2 ? 'Your votes now count DOUBLE!' :
                                currentVoteWeight === 3 ? 'Your votes now count TRIPLE!' :
                                    'Power increased!'}
                        </div>
                    </div>
                </div>
            )}
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
            <div className="max-w-4xl mx-auto p-4 pb-40 space-y-2">
                {headlines.map((headline) => (
                    <Card key={headline.id} className="bg-gray-900 border-gray-700 hover:border-red-800 transition-colors">
                        <CardContent className="p-3">
                            <div className="flex gap-3 items-center">
                                <div className="flex-1">
                                    <p className="text-gray-200 text-sm leading-tight mb-1">{headline.text}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs font-mono">
                                            {shouldShowNames && headline.author?.name ? headline.author.name : 'ANONYMOUS'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        size="sm"
                                        onClick={() => handleVote(headline.id)}
                                        disabled={userVotedIds.length >= MAX_VOTES && !hasUserVotedOnItem(headline.id)}
                                        className={`w-14 h-10 p-0 font-mono text-xs transition-all transform hover:scale-105 ${votedItemId === headline.id
                                            ? 'animate-pulse bg-yellow-500 text-black border-2 border-yellow-300 shadow-lg shadow-yellow-500/50 scale-110'
                                            : hasUserVotedOnItem(headline.id)
                                                ? 'bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 shadow-lg shadow-red-500/50'
                                                : 'bg-gray-800 hover:bg-red-900 text-red-400 border-2 border-red-800 hover:border-red-600'
                                            }`}
                                    >
                                        {votedItemId === headline.id ? (
                                            <Zap className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ArrowUp className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <span className="text-red-400 text-xs font-mono">{countUserVotes(headline.votes, currentProfile?.id)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Separator className="bg-gray-800 my-4" />

                {/* Fixed Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-red-900/50 p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center">
                            {/* Vote Weight Progress */}
                            <div className="mb-3">
                                <div className={`flex items-center justify-center gap-2 mb-2 transition-all duration-500 ${animateVoteWeight ? 'scale-110 animate-pulse' : ''
                                    }`}>
                                    <Zap className={`w-4 h-4 text-yellow-400 transition-all duration-500 ${animateVoteWeight ? 'animate-spin text-red-400' : ''
                                        }`} />
                                    <span className={`text-yellow-400 font-mono text-sm transition-all duration-500 ${animateVoteWeight ? 'text-red-400 text-lg font-bold' : ''
                                        }`}>
                                        VOTE WEIGHT: {currentVoteWeight}x
                                    </span>
                                    {animateVoteWeight && (
                                        <span className="text-red-400 font-mono text-xs animate-bounce">
                                            POWER UP! ⚡
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
                                    <div
                                        className={`bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full transition-all duration-500 ${animateVoteWeight ? 'animate-pulse shadow-lg shadow-red-500/50' : ''
                                            }`}
                                        style={{ width: `${(progress.current / progress.max) * 100}%` }}
                                    ></div>
                                </div>

                                {/* Progress Text */}
                                <p className={`font-mono text-xs transition-all duration-500 ${animateVoteWeight ? 'text-red-400 font-bold animate-bounce' : 'text-gray-400'
                                    }`}>
                                    {progress.nextWeight ?
                                        `${progress.current}/${progress.max} to ${progress.nextWeight}x weight` :
                                        'MAX VOTE WEIGHT ACHIEVED!'
                                    }
                                </p>
                            </div>

                            <p className="text-red-400 mb-3 font-mono text-sm">
                                {remainingVotes} VOTES REMAINING
                            </p>
                            <Button
                                variant="outline"
                                className="bg-gray-900 text-red-400 hover:bg-red-900 border-red-800 hover:border-red-600 font-mono w-full"
                                onClick={() => setCurrentView('leaderboard')}
                            >
                                ACCESS LEADERBOARD
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom padding to account for fixed footer */}
                <div className="h-32"></div>
            </div>
        </div>
    );
}
