'use client';

import { useState, useRef } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';
import { Sparkles, BookOpen, Coffee, Heart, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog } from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from 'next/link';
import { X } from 'lucide-react';

interface ConnectionModalProps {
  connection: any;
  onClose: () => void;
}

export function ConnectionModal({ connection, onClose }: ConnectionModalProps) {
  const targetProfile = connection.targetProfile?.[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    scrollY.set(scrollTop);
  };

  // Animation values
  const headerHeight = useTransform(scrollY, (y) => {
    return Math.max(80, 128 - y * 0.6);
  });

  const avatarScale = useTransform(scrollY, (y) => {
    return Math.max(0.5, 1 - y * 0.004);
  });

  const nameOpacity = useTransform(scrollY, (y) => {
    return Math.min(1, y * 0.02);
  });

  const bannerOpacity = useTransform(scrollY, (y) => {
    return Math.max(0, 1 - y * 0.01);
  });

  const headerBgOpacity = useTransform(scrollY, (y) => {
    return Math.min(1, y / 50);
  });

  const mainTitleOpacity = useTransform(scrollY, (y) => {
    return Math.max(0, 1 - y * 0.02);
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[600px] h-[90vh] pb-20 translate-x-[-50%] translate-y-[-50%] bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl text-white overflow-hidden shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Title className="sr-only">
            {targetProfile?.name ? `Connection with ${targetProfile.name}` : 'Connection'}
          </DialogPrimitive.Title>

          {/* Fixed Header */}
          <motion.div
            className="relative z-10 flex flex-col"
            style={{ height: headerHeight }}
          >
            {/* Background layers */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-600/40 to-red-600/40"
                style={{ opacity: bannerOpacity }}
              />
              <motion.div
                className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm"
                style={{ opacity: headerBgOpacity }}
              />
            </div>

            {/* Header content */}
            <div className="relative flex items-center justify-between px-4 py-5 h-full">
              {/* Left side: Avatar and name */}
              <div className="flex items-center gap-4">
                <motion.div style={{ scale: avatarScale }}>
                  <Avatar className="h-24 w-24 border-4 border-gray-900">
                    <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl">
                      {targetProfile ? getInitials(targetProfile.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                {/* Name that appears on scroll */}
                <motion.div style={{ opacity: nameOpacity }}>
                  <h3 className="text-lg font-medium text-white">
                    {targetProfile?.name || 'Mystery Match'}
                  </h3>
                  {targetProfile?.tagline && (
                    <p className="text-sm text-white/60">
                      {targetProfile.tagline}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Close button */}
              <DialogPrimitive.Close className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all focus:outline-none focus:ring-0">
                <X className="h-5 w-5 text-white" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </motion.div>

          {/* Scrollable Content */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto"
          >
            <div className="px-8 pb-8 space-y-6 mt-6">
              {/* Name and basic info - fade out as we scroll */}
              <motion.div
                className="space-y-2"
                style={{ opacity: mainTitleOpacity }}
              >
                <h2 className="text-3xl font-[family-name:var(--font-merriweather)] text-white">
                  {targetProfile?.name || 'Mystery Match'}
                </h2>
                {targetProfile?.tagline && (
                  <p className="text-white/70 text-lg">
                    {targetProfile.tagline}
                  </p>
                )}
              </motion.div>

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
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}