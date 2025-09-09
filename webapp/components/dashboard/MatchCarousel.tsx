'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Coffee, Heart, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ConnectionModal } from './ConnectionModal';

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center',
    skipSnaps: false,
    containScroll: 'trimSnaps'
  });
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Force reinitialization when connections change
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, connections.length]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="relative">
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex gap-4">
            {connections.map((connection, index) => {
              const targetProfile = connection.targetProfile?.[0];
              const challenge = challenges[index % challenges.length];

              return (
                <motion.div
                  key={connection.id}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-24 w-24 border-2 border-white/20">
                        <AvatarImage src={targetProfile?.profilePicUrl} alt={targetProfile?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl">
                          {targetProfile ? getInitials(targetProfile.name) : '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-[family-name:var(--font-merriweather)] text-white">
                          {targetProfile?.name || 'Mystery Match'}
                        </h3>

                        {targetProfile?.tagline && (
                          <p className="text-white/60 text-sm">
                            {targetProfile.tagline}
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-2 pt-2">
                          <Sparkles className="h-4 w-4 text-yellow-500/70" />
                          <p className="text-yellow-500/70 text-sm italic">
                            {challenge}
                          </p>
                        </div>
                      </div>

                      {connection.text && (
                        <p className="text-white/70 text-sm text-center line-clamp-3">
                          {connection.text}
                        </p>
                      )}

                      <button className="mt-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                        View details →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {connections.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {selectedConnection && (
        <ConnectionModal
          connection={selectedConnection}
          onClose={() => setSelectedConnection(null)}
        />
      )}
    </>
  );
}