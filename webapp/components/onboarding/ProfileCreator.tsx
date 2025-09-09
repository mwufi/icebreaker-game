'use client';

import { motion } from 'framer-motion';
import { User, Sparkles, Target, Brain, Heart, Check } from 'lucide-react';

interface ProfileCreatorProps {
  profileData: {
    name: string;
    bio: string;
    lookingFor: string;
    personality: string;
    values: string;
  };
  onUpdateProfile: (data: any) => void;
  onCreate: () => void;
  onBack?: () => void;
  isCreating: boolean;
  showBackButton: boolean;
}

export function ProfileCreator({
  profileData,
  onUpdateProfile,
  onCreate,
  onBack,
  isCreating,
  showBackButton,
}: ProfileCreatorProps) {
  return (
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
            onChange={(e) => onUpdateProfile({ ...profileData, name: e.target.value })}
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
            onChange={(e) => onUpdateProfile({ ...profileData, bio: e.target.value })}
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
            onChange={(e) => onUpdateProfile({ ...profileData, lookingFor: e.target.value })}
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
            onChange={(e) => onUpdateProfile({ ...profileData, personality: e.target.value })}
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
            onChange={(e) => onUpdateProfile({ ...profileData, values: e.target.value })}
            placeholder="What values are important to you?"
            rows={2}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white/70 transition-all"
          >
            Back
          </button>
        )}

        <button
          onClick={onCreate}
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
  );
}