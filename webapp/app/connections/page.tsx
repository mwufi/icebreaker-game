'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import Link from 'next/link';
import { Calendar, Users, ChevronRight, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ConnectionModal } from '@/components/dashboard/ConnectionModal';

function ConnectionsContent() {
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const { user } = db.useAuth();

  // Fetch current user's profile and all connections
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
            order: { date: 'desc' }
          },
          targetProfile: {}
        }
      }
    }
  });

  const currentUser = data?.$users?.[0];
  const profile = currentUser?.odfProfile?.[0];
  const connections = profile?.dailyConnections || [];

  // Group connections by date
  const groupedConnections = connections.reduce((acc: any, connection: any) => {
    const dateStr = new Date(connection.date).toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(connection);
    return acc;
  }, {});

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (!profile) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/70 text-center space-y-4">
          <p>You need to complete your profile to view connections.</p>
          <Link
            href="/profile/edit"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all"
          >
            Complete Profile
          </Link>
        </div>
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
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] text-white">
              Your Connections
            </h1>
            <p className="text-white/70 text-lg">
              Every person you've met on your journey
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-white/50" />
                <span className="text-white/50 text-sm">Total Connections</span>
              </div>
              <p className="text-2xl font-semibold text-white">{connections.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-white/50" />
                <span className="text-white/50 text-sm">Connection Days</span>
              </div>
              <p className="text-2xl font-semibold text-white">{Object.keys(groupedConnections).length}</p>
            </div>
          </motion.div>

          {/* Connections List */}
          {connections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center"
            >
              <User className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg">No connections yet.</p>
              <p className="text-white/50 text-sm mt-2">
                Check back tomorrow for your first match!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {Object.entries(groupedConnections).map(([dateStr, dateConnections]: [string, any], dateIndex) => (
                  <motion.div
                    key={dateStr}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: dateIndex * 0.1 }}
                    className="space-y-4"
                  >
                    {/* Date Header */}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-white/50" />
                      <h2 className="text-white/70 text-sm font-medium">
                        {formatDateHeader(dateStr)}
                      </h2>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Connections for this date */}
                    <div className="space-y-3">
                      {dateConnections.map((connection: any, index: number) => {
                        const targetProfile = connection.targetProfile?.[0];
                        return (
                          <motion.button
                            key={connection.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            onClick={() => setSelectedConnection(connection)}
                            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-white/20">
                                  <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
                                  <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
                                    {targetProfile ? getInitials(targetProfile.name) : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <h3 className="font-medium text-white">
                                    {targetProfile?.name || 'Mystery Match'}
                                  </h3>
                                  {targetProfile?.tagline && (
                                    <p className="text-sm text-white/60 line-clamp-1">
                                      {targetProfile.tagline}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/50 transition-colors" />
                            </div>
                            {connection.text && (
                              <p className="text-sm text-white/60 mt-3 text-left line-clamp-2">
                                {connection.text}
                              </p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center pt-8"
          >
            <Link 
              href="/dashboard" 
              className="text-white/30 hover:text-white/50 text-sm transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Connection Modal */}
      <AnimatePresence>
        {selectedConnection && (
          <ConnectionModal
            connection={selectedConnection}
            onClose={() => setSelectedConnection(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Connections() {
  return (
    <ClerkSignedInComponent>
      <ConnectionsContent />
    </ClerkSignedInComponent>
  );
}