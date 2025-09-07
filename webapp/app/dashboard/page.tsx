'use client';

import { useState } from 'react';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import { db } from '@/lib/instantdb';
import Link from 'next/link';
import { DailyMatchModal } from '@/components/DailyMatchModal';

export default function Dashboard() {
  const [showMatchModal, setShowMatchModal] = useState(false);
  const { user } = db.useAuth();

  // Get today's and yesterday's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Fetch current user's profile and today's matches
  const { data } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id || ''
        }
      },
      odfProfile: {
        dailyMatches: {
          $: {
            where: {
              date: { $gte: yesterday }
            }
          },
          targetProfile: {}
        }
      }
    }
  });

  const currentUser = data?.$users?.[0];
  const profile = currentUser?.odfProfile?.[0];
  const todaysMatch = profile?.dailyMatches?.[0];

  const handleViewMatch = () => {
    if (!todaysMatch) {
      return;
    }
    setShowMatchModal(true);
  };

  return (
    <ClerkSignedInComponent>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💝 Your Daily Match
            </h2>
            {todaysMatch ? (
              <>
                <p className="text-gray-600 mb-4">
                  You got a new match today!
                </p>
                <button
                  onClick={handleViewMatch}
                  className="w-full bg-purple-600 text-white rounded-md py-2 px-4 hover:bg-purple-700 transition-colors"
                >
                  View Today's Match
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  No match yet! Check back in a few hours!
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  In the meantime, why don't you update your preferences?
                </p>
                <Link
                  href="/profile/edit"
                  className="block w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition-colors text-center"
                >
                  Update Preferences
                </Link>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 Pending Activities
            </h2>
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border">
                <p className="text-sm text-gray-600">No pending activities</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/profile" className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600">Manage your account settings and preferences.</p>
          </Link>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600">View your ongoing conversations.</p>
          </div>
          <Link href="/community" className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-gray-600">Explore and connect with others.</p>
          </Link>
        </div>
      </div>

      {/* Daily Match Modal */}
      <DailyMatchModal
        isOpen={showMatchModal}
        onOpenChange={setShowMatchModal}
        match={todaysMatch}
        targetProfile={todaysMatch?.targetProfile?.[0]}
      />
    </ClerkSignedInComponent>
  );
}