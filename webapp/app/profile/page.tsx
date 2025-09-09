'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Target, 
  User, 
  Sparkles, 
  PenTool,
  Calendar,
  Plus,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Onboarding } from '@/components/onboarding/Onboarding';

function ProfileContent() {
  const { user } = db.useAuth();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [preferencesText, setPreferencesText] = useState('');

  // Fetch user profile and activity answers
  const { data } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id || ''
        }
      },
      odfProfile: {
        preferences: {},
        activityAnswers: {
          $: {
            order: { submittedAt: 'desc' }
          },
          questions: {}
        }
      }
    }
  });

  const currentUser = data?.$users?.[0];
  const profile = currentUser?.odfProfile?.[0];
  const preferences = profile?.preferences?.[0];
  const activityAnswers = profile?.activityAnswers || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim() || isSaving || !profile) return;

    setIsSaving(true);
    try {
      const answerId = id();
      await db.transact([
        db.tx.activityAnswers[answerId].update({
          answerText: newNoteText.trim(),
          submittedAt: new Date().toISOString(),
        }).link({
          author: profile.id
        })
      ]);

      setNewNoteText('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAnswer = async (answerId: string) => {
    if (!editText.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await db.transact([
        db.tx.activityAnswers[answerId].update({
          answerText: editText.trim(),
          submittedAt: new Date().toISOString(),
        })
      ]);

      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating answer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBio = async () => {
    if (!bioText.trim() || isSaving || !profile) return;

    setIsSaving(true);
    try {
      await db.transact([
        db.tx.profiles[profile.id].update({
          profileText: bioText.trim()
        })
      ]);
      setIsEditingBio(false);
    } catch (error) {
      console.error('Error saving bio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferencesText.trim() || isSaving || !profile) return;

    setIsSaving(true);
    try {
      if (preferences?.id) {
        // Update existing preferences
        await db.transact([
          db.tx.preferences[preferences.id].update({
            lookingFor: preferencesText.trim()
          })
        ]);
      } else {
        // Create new preferences linked to profile
        const prefId = id();
        await db.transact([
          db.tx.preferences[prefId].update({
            lookingFor: preferencesText.trim()
          }).link({
            profile: profile.id
          })
        ]);
      }
      setIsEditingPreferences(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Show onboarding if user doesn't have a profile
  if (!profile && user) {
    return <Onboarding user={user} onComplete={() => window.location.reload()} />;
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
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20">
                <AvatarImage src={profile?.profilePicUrl} alt={profile?.name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl">
                  {profile ? getInitials(profile.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
                  {profile?.name || 'Anonymous'}
                </h1>
                {profile?.tagline && (
                  <p className="text-white/70 text-lg">{profile.tagline}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Bio Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                <User className="h-5 w-5" />
                <h2 className="text-lg font-medium">About Me</h2>
              </div>
              {!isEditingBio && profile && (
                <button
                  onClick={() => {
                    setIsEditingBio(true);
                    setBioText(profile.profileText || '');
                  }}
                  className="p-2 text-white/50 hover:text-white/70 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {isEditingBio ? (
              <div className="space-y-3">
                <Textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-white/20"
                  disabled={isSaving}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioText('');
                    }}
                    className="px-4 py-2 text-white/60 hover:text-white/80 text-sm transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    disabled={!bioText.trim() || isSaving}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {profile?.profileText || <span className="text-white/50 italic">No bio yet. Click edit to add one.</span>}
              </p>
            )}
          </motion.div>

          {/* Preferences Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                <Target className="h-5 w-5" />
                <h2 className="text-lg font-medium">Looking For</h2>
              </div>
              {!isEditingPreferences && profile && (
                <button
                  onClick={() => {
                    setIsEditingPreferences(true);
                    setPreferencesText(preferences?.lookingFor || '');
                  }}
                  className="p-2 text-white/50 hover:text-white/70 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {isEditingPreferences ? (
              <div className="space-y-3">
                <Textarea
                  value={preferencesText}
                  onChange={(e) => setPreferencesText(e.target.value)}
                  placeholder="What are you looking for in connections?"
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-white/20"
                  disabled={isSaving}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditingPreferences(false);
                      setPreferencesText('');
                    }}
                    className="px-4 py-2 text-white/60 hover:text-white/80 text-sm transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={!preferencesText.trim() || isSaving}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white/80 leading-relaxed">
                {preferences?.lookingFor || <span className="text-white/50 italic">No preferences yet. Click edit to add them.</span>}
              </p>
            )}
          </motion.div>

          {/* Activity Answers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-[family-name:var(--font-merriweather)] text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                My Thoughts & Answers
              </h2>
              <button
                onClick={() => setIsAddingNote(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Note
              </button>
            </div>

            {/* Add Note Form */}
            <AnimatePresence>
              {isAddingNote && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <PenTool className="h-4 w-4" />
                      <span className="text-sm font-medium">New Note</span>
                    </div>
                    <Textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-white/20"
                      disabled={isSaving}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNoteText('');
                        }}
                        className="px-4 py-2 text-white/60 hover:text-white/80 text-sm transition-colors"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        disabled={!newNoteText.trim() || isSaving}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Note
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Activity Answer Cards */}
            {activityAnswers.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center">
                <MessageSquare className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">No thoughts or answers yet.</p>
                <p className="text-white/50 text-sm mt-2">
                  Answer daily questions or add notes to build your profile.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {activityAnswers.map((answer: any, index: number) => (
                    <motion.div
                      key={answer.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 space-y-4"
                    >
                      {/* Questions Header */}
                      {answer.questions && answer.questions.length > 0 && (
                        <div className="space-y-2">
                          {answer.questions.map((question: any) => (
                            <div key={question.id} className="flex items-start gap-2 text-white/60 text-sm">
                              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p className="italic">{question.questionText}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer Text */}
                      {editingId === answer.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-white/20"
                            disabled={isSaving}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditText('');
                              }}
                              className="p-2 text-white/60 hover:text-white/80 transition-colors"
                              disabled={isSaving}
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateAnswer(answer.id)}
                              disabled={!editText.trim() || isSaving}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative">
                          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                            {answer.answerText}
                          </p>
                          <button
                            onClick={() => {
                              setEditingId(answer.id);
                              setEditText(answer.answerText);
                            }}
                            className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4 text-white/50 hover:text-white/70" />
                          </button>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(answer.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center pt-8 space-y-2"
          >
            <Link 
              href="/dashboard" 
              className="text-white/30 hover:text-white/50 text-sm transition-colors block"
            >
              ← Back to Dashboard
            </Link>
            <Link 
              href="/connections" 
              className="text-white/30 hover:text-white/50 text-sm transition-colors block"
            >
              View Connections
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ClerkSignedInComponent>
      <ProfileContent />
    </ClerkSignedInComponent>
  );
}