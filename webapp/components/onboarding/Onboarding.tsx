'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';
import { ProfileFinder } from './ProfileFinder';
import { ProfileCreator } from './ProfileCreator';
import { Tutorial } from './Tutorial';

interface OnboardingProps {
  user: any;
  onComplete: () => void;
}

export function Onboarding({ user, onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'find' | 'create' | 'tutorial'>('find');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
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

    setStep('tutorial');
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
    setStep('tutorial');
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
            {step === 'find' && (
              <ProfileFinder
                unlinkedProfiles={unlinkedProfiles}
                selectedProfileId={selectedProfileId}
                onSelectProfile={setSelectedProfileId}
                onLinkProfile={handleLinkProfile}
                onCreateNew={() => setStep('create')}
              />
            )}

            {step === 'create' && (
              <ProfileCreator
                profileData={profileData}
                onUpdateProfile={setProfileData}
                onCreate={handleCreateProfile}
                onBack={() => setStep('find')}
                isCreating={isCreating}
                showBackButton={unlinkedProfiles.length > 0}
              />
            )}

            {step === 'tutorial' && (
              <Tutorial
                onComplete={onComplete}
                userId={user?.id}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}