'use client';

import { motion } from 'framer-motion';
import { ProfileSearch } from '@/components/ProfileSearch';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ProfileFinderProps {
  unlinkedProfiles: any[];
  selectedProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onLinkProfile: (id: string) => void;
  onCreateNew: () => void;
}

export function ProfileFinder({
  unlinkedProfiles,
  selectedProfileId,
  onSelectProfile,
  onLinkProfile,
  onCreateNew,
}: ProfileFinderProps) {
  return (
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
          Welcome to Appy
        </h1>

        <p className="text-xl text-white/80">
          Let's get you started by linking your profile
        </p>
      </div>

      {unlinkedProfiles.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-[family-name:var(--font-merriweather)] text-white mb-4">
            Find Your Profile
          </h2>
          <ProfileSearch
            profiles={unlinkedProfiles}
            linkedProfiles={[]}
            onLink={onLinkProfile}
            onConfirmLink={onLinkProfile}
            selectedId={selectedProfileId}
            onSelect={onSelectProfile}
          />
          <div className="mt-6">
            {selectedProfileId && (
              <button
                onClick={() => onLinkProfile(selectedProfileId)}
                className="w-full md:w-auto mx-auto flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 hover:from-green-700 hover:via-emerald-700 hover:to-green-600 text-white text-lg md:text-xl font-medium rounded-full transition-all shadow-lg"
              >
                Link this profile
                <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/50 text-sm">can't find your profile?</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      <div className="flex justify-center">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all"
        >
          Create New Profile
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}