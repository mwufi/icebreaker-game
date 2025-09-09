'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, User, Heart, Sparkles, Zap, ChevronRight, X } from 'lucide-react';
import { db } from '@/lib/instantdb';

interface TutorialProps {
  onComplete: () => void;
  onSkip?: () => void;
  isStandalone?: boolean;
  userId?: string;
}

export function Tutorial({ onComplete, onSkip, isStandalone = false, userId }: TutorialProps) {
  const [step, setStep] = useState(0);

  // Mark tutorial as seen when component unmounts or completes
  useEffect(() => {
    return () => {
      if (userId) {
        // Mark tutorial as seen in the database
        db.transact([
          db.tx.users[userId].update({
            hasSeenTutorial: true,
          })
        ]);
      }
    };
  }, [userId]);

  const handleComplete = () => {
    if (userId) {
      db.transact([
        db.tx.users[userId].update({
          hasSeenTutorial: true,
        })
      ]);
    }
    onComplete();
  };

  return (
    <div className={isStandalone ? "fixed inset-0 z-50 bg-black/90 backdrop-blur-md" : ""}>
      <div className={`${isStandalone ? "relative h-full" : ""} flex items-center justify-center min-h-screen px-6 py-16`}>
        {isStandalone && onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8 max-w-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-full"
              >
                <MessageCircle className="h-12 w-12 text-yellow-400" />
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-merriweather)] text-white">
                  How this works
                </h2>
                <div className="max-w-md mx-auto space-y-6">
                  <p className="text-xl text-white/90 font-medium">
                    Appy is NOT a matchmaking app
                  </p>
                  <p className="text-lg text-white/80">
                    It's a conversation app
                  </p>
                  <p className="text-lg text-white/80">
                    To help you have special conversations with amazing people
                  </p>
                  <p className="text-lg text-white/80">
                    Every day, we highlight a few connections based on what you tell us
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="mx-auto flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-medium rounded-full transition-all shadow-lg"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8 max-w-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full"
              >
                <Users className="h-12 w-12 text-blue-400" />
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
                  We learn from...
                </h2>
                <div className="max-w-md mx-auto">
                  <div className="grid gap-4 text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Your profile</h3>
                        <p className="text-sm text-white/60">Who you are and what you're looking for</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Conversations</h3>
                        <p className="text-sm text-white/60">What you talk about and enjoy</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Notes</h3>
                        <p className="text-sm text-white/60">Your thoughts and reflections</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Chatting with AppyBot</h3>
                        <p className="text-sm text-white/60">Our AI companion learns your preferences</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="mx-auto flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-full transition-all shadow-lg"
              >
                <Zap className="h-5 w-5" />
                I'm excited!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}