'use client';

import { Sparkles, BookOpen, Coffee, Heart, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface ConnectionModalProps {
  connection: any;
  onClose: () => void;
}

export function ConnectionModal({ connection, onClose }: ConnectionModalProps) {
  const targetProfile = connection.targetProfile?.[0];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-b from-gray-900 to-black border-white/10 text-white p-0 overflow-hidden">
        <div className="relative">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-br from-orange-600/40 to-red-600/40" />
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-8">
            <Avatar className="h-32 w-32 border-4 border-black">
              <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-3xl">
                {targetProfile ? getInitials(targetProfile.name) : '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="pt-16 px-8 pb-8 space-y-6">
          {/* Name and basic info */}
          <div className="space-y-2">
            <h2 className="text-3xl font-[family-name:var(--font-merriweather)] text-white">
              {targetProfile?.name || 'Mystery Match'}
            </h2>
            {targetProfile?.tagline && (
              <p className="text-white/70 text-lg">
                {targetProfile.tagline}
              </p>
            )}
          </div>

          {/* Connection message */}
          {connection.text && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {connection.text}
              </p>
            </div>
          )}

          {/* Profile highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targetProfile?.bio && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">About</span>
                </div>
                <p className="text-white/80 text-sm">
                  {targetProfile.bio}
                </p>
              </div>
            )}

            {targetProfile?.lookingFor && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">Looking For</span>
                </div>
                <p className="text-white/80 text-sm">
                  {targetProfile.lookingFor}
                </p>
              </div>
            )}

            {targetProfile?.personality && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Personality</span>
                </div>
                <p className="text-white/80 text-sm">
                  {targetProfile.personality}
                </p>
              </div>
            )}

            {targetProfile?.values && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <Coffee className="h-4 w-4" />
                  <span className="text-sm font-medium">Values</span>
                </div>
                <p className="text-white/80 text-sm">
                  {targetProfile.values}
                </p>
              </div>
            )}
          </div>

          {/* Match details */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Matched on {new Date(connection.date).toLocaleDateString()}</span>
            </div>
            
            <Link
              href={`/profiles/${targetProfile?.id}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all"
            >
              View Full Profile
            </Link>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}