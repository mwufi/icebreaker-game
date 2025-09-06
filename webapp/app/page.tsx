'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Navigation } from '@/components/Navigation';
import { ClerkSignedInComponent } from '@/components/auth/ClerkAuth';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Welcome to SuperSecret
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Your exclusive platform for anonymous connections and authentic conversations. 
                Share your thoughts freely, meet new people, and discover meaningful connections.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="text-4xl mb-4">🎭</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Anonymous</h3>
                  <p className="text-gray-600">Express yourself freely without revealing your identity</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="text-4xl mb-4">💫</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Matches</h3>
                  <p className="text-gray-600">Get matched with someone new every day for meaningful conversations</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Private & Secure</h3>
                  <p className="text-gray-600">Your conversations and data are always protected</p>
                </div>
              </div>
              
              <Link
                href="/sign-in"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign in to claim your profile
              </Link>
            </div>
          </main>
        </div>
      </SignedOut>
      
      <SignedIn>
        <ClerkSignedInComponent>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Your Dashboard
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    💝 Your Daily Match
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Ready to meet someone new today?
                  </p>
                  <button className="w-full bg-purple-600 text-white rounded-md py-2 px-4 hover:bg-purple-700 transition-colors">
                    View Today's Match
                  </button>
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
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
                  <p className="text-gray-600">Manage your account settings and preferences.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
                  <p className="text-gray-600">View your ongoing conversations.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
                  <p className="text-gray-600">Explore and connect with others.</p>
                </div>
              </div>
            </div>
          </div>
        </ClerkSignedInComponent>
      </SignedIn>
    </>
  );
}