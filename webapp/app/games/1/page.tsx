'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { Mic, MicOff, Play, Pause, RotateCcw, CheckCircle, Loader2, Send, BookOpen, Sparkles, Coffee, Music, Keyboard } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';

function GameContent() {
  const [screen, setScreen] = useState<'premise' | 'main' | 'complete'>('premise');
  const [inputMode, setInputMode] = useState<'audio' | 'text'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAnswers, setUserAnswers] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { user } = db.useAuth();

  // Fetch user profile and active questions
  const { data } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id || ''
        }
      },
      odfProfile: {}
    },
    activityQuestions: {
      $: {
        where: {
          isActive: true
        }
      }
    }
  });

  const profile = data?.$users?.[0]?.odfProfile?.[0];
  const activeQuestions = data?.activityQuestions || [];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Map questions to icons based on tags
  const getIconForTag = (tags: string) => {
    const tagLower = tags?.toLowerCase() || '';
    if (tagLower.includes('personal')) return BookOpen;
    if (tagLower.includes('dream')) return Sparkles;
    if (tagLower.includes('values') || tagLower.includes('company')) return Coffee;
    return Music; // default icon
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const submitAnswers = async () => {
    if (!profile) return;

    if (inputMode === 'audio' && !audioBlob) return;
    if (inputMode === 'text' && !userAnswers.trim()) return;

    setIsSubmitting(true);

    try {
      const questionIds = activeQuestions.map((q: any) => q.id);

      if (inputMode === 'audio') {
        // Handle audio submission
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = `games/audio-challenge/${profile.id}/${timestamp}.webm`;

        const audioFile = new File([audioBlob!], `${timestamp}.webm`, {
          type: 'audio/webm'
        });

        await db.storage.uploadFile(filePath, audioFile);

        const gameRecordId = id();
        await db.transact([
          db.tx.gameCompletions[gameRecordId].update({
            gameType: 'audio-challenge-60s',
            completedAt: new Date(),
            audioFilePath: filePath,
          }).link({
            profile: profile.id,
          })
        ]);
      } else {
        // Handle text submission (same as drawer)
        const answerId = id();
        await db.transact([
          db.tx.activityAnswers[answerId].update({
            answerText: userAnswers.trim(),
            submittedAt: new Date(),
          }).link({
            author: profile.id,
            questions: questionIds,
          })
        ]);
      }

      setScreen('complete');
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Failed to save your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/40 via-pink-900/30 to-black" />

      {/* Grainy texture overlay */}
      <div
        className="fixed inset-0 opacity-30 mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {screen === 'premise' && (
              <motion.div
                key="premise"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-6">
                  <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
                    Tell us more about you
                  </h1>

                  <p className="text-white/80 text-lg max-w-2xl mx-auto">
                    Answer today for us to improve your matches tomorrow. The more you tell us, the better your match.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setScreen('main')}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all"
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            )}

            {screen === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {activeQuestions.length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                    <p className="text-white/70">No activities available right now. Check back soon!</p>
                    <Link
                      href="/dashboard"
                      className="inline-block mt-4 text-sm text-white/50 hover:text-white/70 transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-8">
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

                    {/* Input Mode Selector */}
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setInputMode('audio')}
                        className={`px-6 py-3 rounded-full transition-all flex items-center gap-2 ${inputMode === 'audio'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        <Mic className="h-4 w-4" />
                        Talk
                      </button>
                      <button
                        onClick={() => setInputMode('text')}
                        className={`px-6 py-3 rounded-full transition-all flex items-center gap-2 ${inputMode === 'text'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                      >
                        <Keyboard className="h-4 w-4" />
                        Type Answer
                      </button>
                    </div>

                    {/* Audio Recording Section */}
                    {inputMode === 'audio' && (
                      <div className="space-y-8">
                        {/* Timer */}
                        {(isRecording || audioBlob) && (
                          <div className="text-4xl font-mono text-white text-center">
                            {formatTime(recordingTime)} / 1:00
                          </div>
                        )}

                        {/* Recording indicator */}
                        {isRecording && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="flex items-center justify-center gap-2 text-red-400"
                          >
                            <div className="w-3 h-3 bg-red-400 rounded-full" />
                            <span>Recording...</span>
                          </motion.div>
                        )}

                        {/* Audio Control buttons */}
                        <div className="flex items-center justify-center gap-4">
                          {!audioBlob ? (
                            <button
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`p-4 rounded-full transition-all ${isRecording
                                ? 'bg-red-500/80 hover:bg-red-500 text-white'
                                : 'bg-purple-300/20 hover:bg-white/20 text-white/70 hover:text-white border border-white/20'
                                }`}
                            >
                              {isRecording ? (
                                <MicOff className="h-6 w-6" />
                              ) : (
                                <Mic className="h-6 w-6" />
                              )}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={playRecording}
                                className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                              >
                                {isPlaying ? (
                                  <Pause className="h-6 w-6" />
                                ) : (
                                  <Play className="h-6 w-6" />
                                )}
                              </button>

                              <button
                                onClick={resetRecording}
                                className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                              >
                                <RotateCcw className="h-6 w-6" />
                              </button>

                              <button
                                onClick={submitAnswers}
                                disabled={isSubmitting}
                                className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full text-white font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-5 w-5" />
                                    Submit Recording
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Text Input Section */}
                    {inputMode === 'text' && (
                      <form onSubmit={(e) => { e.preventDefault(); submitAnswers(); }} className="space-y-4">
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

                        <div className="flex justify-center">
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
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {screen === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Send className="h-12 w-12 text-white" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
                    Thank you for sharing!
                  </h2>
                  <p className="text-xl text-white/80">
                    Your answers will help us find better matches for you.
                  </p>
                  <p className="text-white/60">
                    Come back tomorrow for new questions and better connections.
                  </p>
                </div>

                <div className="pt-8">
                  <Link
                    href="/dashboard"
                    className="inline-block px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 transition-all"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  return (
    <ClerkSignedInComponent>
      <GameContent />
    </ClerkSignedInComponent>
  );
}