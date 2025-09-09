'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ConnectionModal } from './ConnectionModal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Connection {
  id: string;
  text?: string;
  targetProfile?: any;
}

interface MatchCarouselProps {
  connections: Connection[];
  challenges: string[];
}

export function MatchCarousel({ connections, challenges }: MatchCarouselProps) {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Don't render anything if no connections
  if (!connections || connections.length === 0) {
    return null;
  }

  return (
    <>
      <Carousel 
        className="w-full"
        opts={{
          align: 'start',
        }}
      >
        <CarouselContent className="-ml-4">
          {connections.map((connection, index) => {
            const targetProfile = connection.targetProfile?.[0];
            const challenge = challenges[index % challenges.length];

            return (
              <CarouselItem 
                key={connection.id} 
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                >
                  <div 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 cursor-pointer hover:bg-white/10 transition-all h-full"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    <div className="flex flex-col items-center space-y-4 h-full">
                      <Avatar className="h-24 w-24 border-2 border-white/20">
                        <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl">
                          {targetProfile ? getInitials(targetProfile.name) : '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="text-center space-y-2 flex-1 flex flex-col">
                        <h3 className="text-xl font-[family-name:var(--font-merriweather)] text-white">
                          {targetProfile?.name || 'Mystery Match'}
                        </h3>

                        {targetProfile?.tagline && (
                          <p className="text-white/60 text-sm line-clamp-2">
                            {targetProfile.tagline}
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-2 pt-2">
                          <Sparkles className="h-4 w-4 text-yellow-500/70" />
                          <p className="text-yellow-500/70 text-sm italic">
                            {challenge}
                          </p>
                        </div>

                        {connection.text && (
                          <p className="text-white/70 text-sm text-center line-clamp-3 mt-auto">
                            {connection.text}
                          </p>
                        )}
                      </div>

                      <button className="mt-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                        View details →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
        <CarouselNext className="right-2 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
      </Carousel>

      <AnimatePresence>
        {selectedConnection && (
          <ConnectionModal
            connection={selectedConnection}
            onClose={() => setSelectedConnection(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}