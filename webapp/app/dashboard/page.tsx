'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';
import Link from 'next/link';
import { Lock, Sparkles, BookOpen, Coffee, Music, Tag, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UnlockedMatch {
  [key: string]: boolean;
}

function DashboardContent() {
  const [unlockedConnections, setUnlockedConnections] = useState<UnlockedMatch>({});
  const [userAnswers, setUserAnswers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = db.useAuth();

  // Get today's and yesterday's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Fetch current user's profile, connections, and active questions
  const { data } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id || ''
        }
      },
      odfProfile: {
        dailyConnections: {
          $: {
            where: {
              date: { $gte: yesterday }
            }
          },
          targetProfile: {}
        }
      }
    },
    activityQuestions: {
      $: {
        where: {
          isActive: true
        }
      }
    }
  });

  const currentUser = data?.$users?.[0];
  const profile = currentUser?.odfProfile?.[0];
  const connections = profile?.dailyConnections || [];
  const activeQuestions = data?.activityQuestions || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUnlock = (matchId: string) => {
    setUnlockedConnections(prev => ({ ...prev, [matchId]: true }));
  };

  const handleSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswers.trim() || isSubmitting || !profile) return;

    setIsSubmitting(true);

    try {
      // Create a new activity answer record
      const answerId = id();
      const questionIds = activeQuestions.map((q: any) => q.id);

      await db.transact([
        db.tx.activityAnswers[answerId].update({
          answerText: userAnswers.trim(),
          submittedAt: new Date(),
        }).link({
          author: profile.id,
          questions: questionIds,
        })
      ]);

      setSubmitted(true);

    } catch (error) {
      console.error('Error submitting answers:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample challenges
  const challenges = [
    "Figure out what their favorite book is",
    "Ask about their most memorable travel experience",
    "Discover what they're passionate about",
    "Find out their hidden talent",
    "Learn about their favorite coffee order"
  ];

  // Map questions to icons based on tags
  const getIconForTag = (tags: string) => {
    const tagLower = tags?.toLowerCase() || '';
    if (tagLower.includes('personal')) return BookOpen;
    if (tagLower.includes('dream')) return Sparkles;
    if (tagLower.includes('values') || tagLower.includes('company')) return Coffee;
    return Music; // default icon
  };

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
        <div className="md:max-w-4xl mx-auto space-y-16">
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

          <div className="grid md:grid-cols-2 gap-12">

            {/* Connections Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
                Your Connections
              </h2>

              <div className="space-y-4">
                {connections.length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                    <p className="text-white/70">No connections yet today. Check back soon!</p>
                    <Link
                      href="/profile/edit"
                      className="inline-block mt-4 text-sm text-white/50 hover:text-white/70 transition-colors"
                    >
                      Update your preferences →
                    </Link>
                  </div>
                ) : (
                  connections.map((match: any, index: number) => {
                    const targetProfile = match.targetProfile?.[0];
                    const isUnlocked = unlockedConnections[match.id];
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
                          {unlockedConnections[match.id] && (
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
                                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
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
                Tell us more about you
              </h2>

              <p className="text-white/70 text-lg">
                Answer today for us to improve your matches tomorrow. The more you tell us, the better your match.
              </p>

              {activeQuestions.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
                  <p className="text-white/70">No activities available right now. Check back soon!</p>
                </div>
              ) : submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Send className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-[family-name:var(--font-merriweather)] text-white">
                      Thank you for sharing!
                    </h3>
                    <p className="text-white/70">
                      Your answers will help us find better matches for you.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setUserAnswers('');
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 text-sm transition-all"
                    >
                      Answer Again
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Questions List */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-[family-name:var(--font-merriweather)] text-white mb-4">
                      Questions to answer:
                    </h3>
                    <ul className="space-y-3">
                      {activeQuestions.map((question: any, index: number) => {
                        const Icon = getIconForTag(question.tags);
                        return (
                          <motion.li
                            key={question.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <Icon className="h-4 w-4 text-white/50 mt-1 flex-shrink-0" />
                            <span className="text-white/80 text-sm leading-relaxed">
                              {question.questionText}
                            </span>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Answer Form */}
                  <form onSubmit={handleSubmitAnswers} className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                      <label htmlFor="answers" className="block text-white/80 text-sm font-medium mb-3">
                        Your answers:
                      </label>
                      <textarea
                        id="answers"
                        value={userAnswers}
                        onChange={(e) => setUserAnswers(e.target.value)}
                        placeholder="Share your thoughts on the questions above. You can answer them all together or individually - whatever feels natural to you."
                        className="w-full h-32 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!userAnswers.trim() || isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Answers
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.section>
          </div>

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