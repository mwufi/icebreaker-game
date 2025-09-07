'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Sparkles, 
  MessageCircle, 
  X,
  Stars,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface DailyMatchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  match: any;
  targetProfile: any;
}

export function DailyMatchModal({ isOpen, onOpenChange, match, targetProfile }: DailyMatchModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation when modal opens
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#ff69b4', '#ff1493', '#ff69b4', '#ffc0cb', '#ffb6c1']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#ff69b4', '#ff1493', '#ff69b4', '#ffc0cb', '#ffb6c1']
        });
      }, 250);

      // Show content after a slight delay for dramatic effect
      setTimeout(() => setShowContent(true), 500);

      return () => {
        clearInterval(interval);
      };
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 opacity-20 animate-gradient" />
        
        <div className="relative p-6">
          <DialogHeader className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Heart className="h-12 w-12 text-pink-500 animate-pulse" fill="currentColor" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
              It's a Match!
            </DialogTitle>
          </DialogHeader>

          <div className={`space-y-6 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Profile Section */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <Avatar className="relative h-24 w-24 border-4 border-white shadow-xl">
                  <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl font-bold">
                    {targetProfile ? getInitials(targetProfile.name) : '??'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {targetProfile?.name || 'Mystery Match'}
              </h3>
              {targetProfile?.tagline && (
                <p className="text-sm text-gray-600 italic mb-4">
                  "{targetProfile.tagline}"
                </p>
              )}
            </div>

            {/* Match Text */}
            {match?.text && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                <div className="flex items-start gap-2">
                  <Stars className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Why you matched:</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {match.text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Link href={`/profiles/${targetProfile?.id}`}>
                  <HeartHandshake className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
                onClick={() => onOpenChange(false)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}