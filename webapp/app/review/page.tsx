'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Edit2, Calendar, Users } from 'lucide-react';

function ReviewContent() {
  const router = useRouter();
  const { user } = db.useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Set selected date to midnight for comparison
  const dateAtMidnight = new Date(selectedDate);
  dateAtMidnight.setHours(0, 0, 0, 0);

  const nextDay = new Date(dateAtMidnight);
  nextDay.setDate(dateAtMidnight.getDate() + 1);

  // Check if user is admin
  const { data: userData } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id || ''
        }
      },
      odfProfile: {}
    }
  });

  const currentUserProfile = userData?.$users?.[0]?.odfProfile?.[0];
  console.log("currentUserProfile", currentUserProfile);
  const isAdmin = currentUserProfile?.isAdmin === true;

  // Fetch all daily connections for the selected date
  const { data: connectionsData } = db.useQuery({
    dailyConnections: {
      $: {
        where: {
          date: { $gte: dateAtMidnight, $lt: nextDay }
        }
      },
      profiles: {},
      targetProfile: {}
    }
  });

  const dailyConnections = connectionsData?.dailyConnections || [];

  // Group connections by profile
  interface ConnectionsByProfile {
    [key: string]: {
      profile: any;
      connections: any[];
    };
  }

  const connectionsByProfile = dailyConnections.reduce((acc: ConnectionsByProfile, connection: any) => {
    const profileId = connection.profiles?.[0]?.id;
    if (!profileId) return acc;
    
    if (!acc[profileId]) {
      acc[profileId] = {
        profile: connection.profiles[0],
        connections: []
      };
    }
    
    acc[profileId].connections.push(connection);
    return acc;
  }, {});

  useEffect(() => {
    // Redirect non-admins to dashboard
    if (userData && !isAdmin) {
      router.push('/dashboard');
    }
  }, [userData, isAdmin, router]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const toggleAcceptance = async (connectionId: string, currentAccepted: boolean) => {
    await db.transact([
      db.tx.dailyConnections[connectionId].update({
        accepted: !currentAccepted
      })
    ]);
  };

  // Show loading state while checking admin status
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/40 via-indigo-900/30 to-black" />

      {/* Grainy texture overlay */}
      <div
        className="fixed inset-0 opacity-30 mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-merriweather)] text-white">
              Review Matches
            </h1>
            <p className="text-white/70 text-lg">
              Admin panel for reviewing and managing daily connections
            </p>
          </motion.div>

          {/* Date Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
          >
            <Calendar className="h-5 w-5 text-white/50" />
            <Button
              onClick={() => handleDateChange(-1)}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Previous Day
            </Button>
            <div className="text-white font-medium">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <Button
              onClick={() => handleDateChange(1)}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
              disabled={selectedDate.toDateString() === new Date().toDateString()}
            >
              Next Day
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-white/70 text-sm">Total Matches</p>
                  <p className="text-2xl font-bold text-white">{dailyConnections.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-white/70 text-sm">Accepted</p>
                  <p className="text-2xl font-bold text-white">
                    {dailyConnections.filter((c) => c.accepted).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-white/70 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {Object.keys(connectionsByProfile).length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Matches List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-[family-name:var(--font-merriweather)] text-white">
              Matches by User
            </h2>

            {Object.keys(connectionsByProfile).length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="text-center py-12">
                  <p className="text-white/70">No matches found for this date</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(connectionsByProfile).map(([profileId, data]) => (
                <Card key={profileId} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-white/20">
                        <AvatarImage src={data.profile.profilePicUrl} alt={data.profile.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                          {getInitials(data.profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">{data.profile.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.connections.map((connection) => {
                      const targetProfile = connection.targetProfile?.[0];
                      return (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-8 w-8 border border-white/20">
                              <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
                              <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-sm">
                                {targetProfile ? getInitials(targetProfile.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {targetProfile?.name || 'Unknown User'}
                              </p>
                              {connection.text && (
                                <p className="text-white/60 text-sm mt-1 whitespace-pre-wrap">{connection.text}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => toggleAcceptance(connection.id, connection.accepted)}
                              variant="ghost"
                              size="sm"
                              className={`
                                ${connection.accepted 
                                  ? 'text-green-400 hover:text-green-300' 
                                  : 'text-gray-400 hover:text-gray-300'
                                } hover:bg-white/10
                              `}
                            >
                              {connection.accepted ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accepted
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Pending
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white/50 hover:text-white hover:bg-white/10"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <ClerkSignedInComponent>
      <ReviewContent />
    </ClerkSignedInComponent>
  );
}