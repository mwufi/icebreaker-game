'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/instantdb';
import { id } from '@instantdb/react';
import Link from 'next/link';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = db.useAuth();
  const [lookingFor, setLookingFor] = useState('');
  const [saving, setSaving] = useState(false);

  // Get current user's profile through the correct relationship
  const { data, isLoading } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id || ''
        }
      },
      odfProfile: {
        preferences: {}
      }
    }
  });

  const currentUser = data?.$users?.[0];
  const profile = currentUser?.odfProfile?.[0];
  const preferences = profile?.preferences?.[0];

  useEffect(() => {
    if (preferences?.lookingFor) {
      setLookingFor(preferences.lookingFor);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      if (preferences) {
        // Update existing preferences
        await db.transact([
          db.tx.preferences[preferences.id].update({
            lookingFor: lookingFor
          })
        ]);
      } else {
        // Create new preferences linked to profile
        console.log("creating new preferences");
        console.log("profile", profile);
        await db.transact([
          db.tx.preferences[id()].update({
            lookingFor: lookingFor
          }).link({
            profile: profile.id
          })
        ]);
      }
      
      router.push('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-6">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to home
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Edit Your Preferences
          </h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-2">
                What are you looking for? 🎯
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Tell the AI what kind of matches you'd like. Be as specific or general as you want!
              </p>
              <textarea
                id="lookingFor"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Example: I'm looking for someone who enjoys deep conversations about philosophy, loves hiking on weekends, and appreciates dark humor. Bonus points if they're into indie music and can teach me something new!"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-800 rounded-md py-2 px-4 hover:bg-gray-300 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}