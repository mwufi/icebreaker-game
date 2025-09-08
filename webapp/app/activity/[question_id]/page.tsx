'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { Send, Loader2, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

function ActivityContent() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.question_id as string;
  
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch the question details
  const { data } = db.useQuery({
    activityQuestions: {
      $: {
        where: {
          id: questionId
        }
      }
    }
  });

  const question = data?.activityQuestions?.[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userAnswer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isSubmitting || !question) return;

    setIsSubmitting(true);
    
    try {
      // Here you would save the answer to the database
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setIsGeneratingFollowUps(true);
      
      // Generate follow-up questions based on the answer
      // This would be replaced with an actual AI call
      setTimeout(() => {
        setFollowUpQuestions([
          "That's interesting! What specifically drew you to that aspect?",
          "How has this shaped your perspective on building products?",
          "Have you had any experiences that reinforced or challenged this view?"
        ]);
        setIsGeneratingFollowUps(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
      </div>
    );
  }

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
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <Link
              href="/dashboard"
              className="text-white/50 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-[family-name:var(--font-merriweather)] text-white/70">
              Activity
            </h1>
          </motion.div>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
              {question.questionText}
            </h2>

            {/* Fake active users */}
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Users className="h-4 w-4" />
              <span>5 other people are answering this</span>
            </div>
          </motion.div>

          {/* Answer form */}
          {!submitted ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full min-h-[120px] max-h-[400px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 transition-all"
                  disabled={isSubmitting}
                />
              </div>
              
              <button
                type="submit"
                disabled={!userAnswer.trim() || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Answer
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* User's answer */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <p className="text-sm text-white/50 mb-2">Your answer:</p>
                <p className="text-white/90">{userAnswer}</p>
              </div>

              {/* Follow-up questions */}
              {isGeneratingFollowUps ? (
                <div className="flex items-center gap-2 text-white/50">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is thinking of follow-up questions...</span>
                </div>
              ) : followUpQuestions.length > 0 && (
                <div className="space-y-4">
                  <p className="text-white/70">The AI would like to know more:</p>
                  <div className="space-y-3">
                    {followUpQuestions.map((q, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                      >
                        <p className="text-white/80">{q}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 text-sm transition-all"
                    >
                      Answer Later
                    </button>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setUserAnswer('');
                        setFollowUpQuestions([]);
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 text-sm transition-all"
                    >
                      Continue Conversation
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <ClerkSignedInComponent>
      <ActivityContent />
    </ClerkSignedInComponent>
  );
}