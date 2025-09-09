'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { Mic, MicOff, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Day 1 questions from seedQuestions
const gameQuestions = [
  {
    text: "What is your favorite book and why do you like it?",
  },
  {
    text: "If you had three extra hours on a Sunday to do something other than work, what would you be doing?",
  },
  {
    text: "What's something you wish people would ask or talk to you about?",
  },
];

function GameContent() {
  const [screen, setScreen] = useState<'premise' | 'recording' | 'complete'>('premise');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

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

  const submitRecording = async () => {
    if (!audioBlob) return;
    
    // TODO: Upload audio blob to storage
    console.log('Submitting recording...', audioBlob);
    
    // Show completion screen
    setScreen('complete');
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
                    60 Second Challenge
                  </h1>
                  
                  <div className="space-y-4 text-white/80">
                    <p className="text-lg">
                      Record 60 seconds of audio talking about the prompts
                    </p>
                    <p className="text-lg">
                      If you do this, you get a special prize
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setScreen('recording')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Ready
                  </button>
                </div>
              </motion.div>
            )}

            {screen === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-merriweather)] text-white mb-8">
                    Talk about these prompts:
                  </h2>
                  
                  <div className="space-y-4 mb-12">
                    {gameQuestions.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-left"
                      >
                        <p className="text-white/90">
                          {index + 1}. {question.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recording Controls */}
                  <div className="space-y-8">
                    {/* Timer */}
                    <div className="text-4xl font-mono text-white">
                      {formatTime(recordingTime)} / 1:00
                    </div>

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

                    {/* Control buttons */}
                    <div className="flex items-center justify-center gap-4">
                      {!audioBlob ? (
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`p-6 rounded-full transition-all transform hover:scale-105 ${
                            isRecording
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                          } text-white shadow-lg hover:shadow-xl`}
                        >
                          {isRecording ? (
                            <MicOff className="h-8 w-8" />
                          ) : (
                            <Mic className="h-8 w-8" />
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
                            onClick={submitRecording}
                            className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full text-white font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                          >
                            <CheckCircle className="h-5 w-5" />
                            Submit Recording
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
                    Congratulations! 🎉
                  </h2>
                  <p className="text-xl text-white/80">
                    You've unlocked your special prize!
                  </p>
                  <p className="text-white/60">
                    Your recording has been saved and will help us create better connections for you.
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