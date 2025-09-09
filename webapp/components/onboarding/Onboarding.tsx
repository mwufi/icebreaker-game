'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileSearch } from '@/components/ProfileSearch';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';
import { ArrowRight, Sparkles, User, Heart, Brain, Target, Check } from 'lucide-react';

interface OnboardingProps {
  user: any;
  onComplete: () => void;
}

export function Onboarding({ user, onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'find' | 'create'>('find');
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    lookingFor: '',
    personality: '',
    values: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Get all profiles
  const { data } = db.useQuery({
    profiles: {
      $: {},
      linkedUser: {}
    }
  });

  const allProfiles = data?.profiles || [];
  const unlinkedProfiles = allProfiles
    .filter((p: any) => !p.linkedUser || p.linkedUser.length === 0)
    .map((p: any) => ({
      ...p,
      linkedUser: null
    }));

  const handleLinkProfile = async (profileId: string) => {
    if (!user?.id) return;
    
    await db.transact([
      db.tx.profiles[profileId].update({
        linkedUser: user.id
      })
    ]);
    
    onComplete();
  };

  const handleCreateProfile = async () => {
    if (!user?.id || !profileData.name) return;
    
    setIsCreating(true);
    
    const newProfileId = id();
    
    await db.transact([
      db.tx.profiles[newProfileId].update({
        name: profileData.name,
        bio: profileData.bio,
        lookingFor: profileData.lookingFor,
        personality: profileData.personality,
        values: profileData.values,
        createdAt: Date.now(),
        linkedUser: user.id
      })
    ]);
    
    setIsCreating(false);
    onComplete();
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
      <div className="relative z-10 min-h-screen px-6 py-16 flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {step === 'find' ? (
              <motion.div
                key="find"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex p-4 bg-white/10 backdrop-blur-sm rounded-full"
                  >
                    <Sparkles className="h-8 w-8 text-yellow-500" />
                  </motion.div>
                  
                  <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-merriweather)] text-white">
                    Welcome to Super Secret
                  </h1>
                  
                  <p className="text-xl text-white/80">
                    Let's get you started by finding or creating your profile
                  </p>
                </div>

                {unlinkedProfiles.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                      <h2 className="text-2xl font-[family-name:var(--font-merriweather)] text-white mb-4">
                        Find Your Profile
                      </h2>
                      <ProfileSearch
                        profiles={unlinkedProfiles}
                        linkedProfiles={[]}
                        onLink={handleLinkProfile}
                        onConfirmLink={handleLinkProfile}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-white/50 text-sm">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-white/70">No existing profiles found</p>
                    <p className="text-white/50 text-sm">Let's create your profile!</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={() => setStep('create')}
                    className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-lg transition-all"
                  >
                    Create New Profile
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
                    Tell us about yourself
                  </h2>
                  <p className="text-white/70">
                    This helps us find your perfect matches
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <User className="h-5 w-5 text-white/50" />
                      <h3 className="text-lg font-medium text-white">Your Name</h3>
                    </div>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                    />
                  </motion.div>

                  {/* Bio */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="h-5 w-5 text-white/50" />
                      <h3 className="text-lg font-medium text-white">Bio</h3>
                    </div>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                    />
                  </motion.div>

                  {/* Looking For */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="h-5 w-5 text-white/50" />
                      <h3 className="text-lg font-medium text-white">What are you looking for?</h3>
                    </div>
                    <textarea
                      value={profileData.lookingFor}
                      onChange={(e) => setProfileData({ ...profileData, lookingFor: e.target.value })}
                      placeholder="Describe what kind of connections you're seeking..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                    />
                  </motion.div>

                  {/* Personality */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-5 w-5 text-white/50" />
                      <h3 className="text-lg font-medium text-white">Personality</h3>
                    </div>
                    <textarea
                      value={profileData.personality}
                      onChange={(e) => setProfileData({ ...profileData, personality: e.target.value })}
                      placeholder="How would you describe your personality?"
                      rows={2}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                    />
                  </motion.div>

                  {/* Values */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="h-5 w-5 text-white/50" />
                      <h3 className="text-lg font-medium text-white">Values</h3>
                    </div>
                    <textarea
                      value={profileData.values}
                      onChange={(e) => setProfileData({ ...profileData, values: e.target.value })}
                      placeholder="What values are important to you?"
                      rows={2}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                    />
                  </motion.div>
                </div>

                <div className="flex items-center gap-4">
                  {unlinkedProfiles.length > 0 && (
                    <button
                      onClick={() => setStep('find')}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white/70 transition-all"
                    >
                      Back
                    </button>
                  )}
                  
                  <button
                    onClick={handleCreateProfile}
                    disabled={!profileData.name || isCreating}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border border-white/20 rounded-full text-white text-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        I'm ready to go!
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}