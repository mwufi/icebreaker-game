'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import Link from 'next/link';
import { Lock, Sparkles, BookOpen, Coffee, Music } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UnlockedMatch {
  [key: string]: boolean;
}

function DashboardContent() {
  const [unlockedMatches, setUnlockedMatches] = useState<UnlockedMatch>({});
  const { user } = db.useAuth();

  // Get today's and yesterday's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Fetch current user's profile and matches
  const { data } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id || ''
        }
      },
      odfProfile: {
        dailyMatches: {
          $: {
            where: {
              date: { $gte: yesterday }
            }
          },
          targetProfile: {}
        }
      }
    }
  });

  const currentUser = data?.$users?.[0];
  const profile = currentUser?.odfProfile?.[0];
  const matches = profile?.dailyMatches || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUnlock = (matchId: string) => {
    setUnlockedMatches(prev => ({ ...prev, [matchId]: true }));
  };

  // Sample challenges
  const challenges = [
    "Figure out what their favorite book is",
    "Ask about their most memorable travel experience",
    "Discover what they're passionate about",
    "Find out their hidden talent",
    "Learn about their favorite coffee order"
  ];

  const activities = [
    { icon: BookOpen, text: "Tell us about your favorite book", link: "/activities/book" },
    { icon: Coffee, text: "What's your ideal morning routine?", link: "/activities/morning" },
    { icon: Music, text: "Share your go-to playlist", link: "/activities/music" },
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-orange-900/40 via-red-900/30 to-black" />
      
      {/* Grainy texture overlay */}
      <div
        className="fixed inset-0 opacity-30 mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-16">
        <div className="max-w-2xl mx-auto space-y-16">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-merriweather)] text-white">
              Welcome, {profile?.name?.split(' ')[0] || 'Friend'}
            </h1>
          </motion.div>

          {/* Matches Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
              Your Matches
            </h2>

            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                  <p className="text-white/70">No matches yet today. Check back soon!</p>
                  <Link
                    href="/profile/edit"
                    className="inline-block mt-4 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Update your preferences →
                  </Link>
                </div>
              ) : (
                matches.map((match: any, index: number) => {
                  const targetProfile = match.targetProfile?.[0];
                  const isUnlocked = unlockedMatches[match.id];
                  const challenge = challenges[index % challenges.length];

                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative overflow-hidden"
                    >
                      {/* Unlock animation overlay */}
                      <AnimatePresence>
                        {unlockedMatches[match.id] && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none z-20"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent skew-x-12" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className={`
                        relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6
                        transition-all duration-500
                        ${isUnlocked ? 'bg-white/10' : 'hover:bg-white/10'}
                      `}>
                        {!isUnlocked ? (
                          // Locked state
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Lock className="h-5 w-5 text-white/50" />
                              <p className="text-white/70">New match available</p>
                            </div>
                            <button
                              onClick={() => handleUnlock(match.id)}
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 text-sm transition-all"
                            >
                              Unlock
                            </button>
                          </div>
                        ) : (
                          // Unlocked state
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 border border-white/20">
                                <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
                                <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
                                  {targetProfile ? getInitials(targetProfile.name) : '?'}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-[family-name:var(--font-merriweather)] text-white">
                                  {targetProfile?.name || 'Mystery Match'}
                                </h3>

                                {match.text && (
                                  <p className="text-white/70 text-sm leading-relaxed">
                                    {match.text}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                  <Sparkles className="h-4 w-4 text-yellow-500/70" />
                                  <p className="text-yellow-500/70 text-sm italic">
                                    Challenge: {challenge}
                                  </p>
                                </div>

                                <Link
                                  href={`/profiles/${targetProfile?.id}`}
                                  className="inline-block mt-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                                >
                                  View full profile →
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.section>

          {/* Activities Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
              Activities
            </h2>

            <p className="text-white/70 text-lg">
              Share more about yourself to improve your matches
            </p>

            <div className="space-y-3">
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      href={activity.link}
                      className="flex items-center gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-4 transition-all group"
                    >
                      <Icon className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
                      <span className="text-white/70 group-hover:text-white/90 transition-colors">
                        {activity.text}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center pb-8"
          >
            <Link href="/profile" className="text-white/30 hover:text-white/50 text-sm transition-colors">
              View your profile
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ClerkSignedInComponent>
      <DashboardContent />
    </ClerkSignedInComponent>
  );
}