'use client';

import { useEffect } from 'react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const story = [
  {
    type: "heading",
    text: "Welcome to Something New"
  },
  {
    type: "paragraph",
    text: "Yesterday was great. We met, we talked, we connected. We shared stories over coffee, laughed at inside jokes that didn't exist an hour before, and discovered that strangers can feel like old friends in the right moment."
  },
  {
    type: "paragraph",
    text: "We came away with new perspectives, unexpected commonalities, and that warm feeling of genuine human connection."
  },
  {
    type: "paragraph",
    text: "And yet what's magical about meeting people is how much we have yet to discover. The conversations that almost happened. The stories left untold. What if you had five more minutes? What if you had asked that one question? What if the right person was just one introduction away?"
  },
  {
    type: "heading",
    text: "Our Experiment"
  },
  {
    type: "paragraph",
    text: "SuperSecret is a layer on top of life for connecting with each other in a new, meaningful way."
  },
  {
    type: "paragraph",
    text: "We're not building a social platform. We're building a pro-social device — a small experiment in seeing what happens when we give serendipity, authenticity, and human connection just a little more room to grow."
  },
  {
    type: "paragraph",
    text: "Every day, we match you with someone new. Someone whose thoughts resonate with yours. Someone who sees the world through a compatible lens. No photos to judge, no profiles to perfect — just two people, ready to connect."
  },
  {
    type: "paragraph",
    text: "Technology doesn't just change what we do; it changes who we are. Our mission — should you choose to accept it — is simple:"
  },
  {
    type: "paragraph",
    text: "Stay curious, explore deeper, and help shape what it means to meet each other at our best."
  },
  {
    type: "divider"
  },
  {
    type: "closing",
    text: "This is SuperSecret."
  },
  {
    type: "closing",
    text: "Your sanctuary for authentic connections."
  },
  {
    type: "question",
    text: "Are you ready to meet someone who gets you?"
  }
];

export default function Home() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Transform scroll position to gradient opacity
  const orangeOpacity = useTransform(scrollY, [0, 1000, 2000], [1, 0.5, 0]);
  const blackOpacity = useTransform(scrollY, [0, 1000, 2000], [0, 0.5, 1]);

  // Redirect signed-in users to dashboard
  useEffect(() => {
    const checkAuth = () => {
      const authElement = document.querySelector('[data-signed-in="true"]');
      if (authElement) {
        router.push('/dashboard');
      }
    };
    
    // Check immediately and after a short delay
    checkAuth();
    const timeout = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <>
      <SignedOut>
        <div className="relative min-h-screen bg-black overflow-hidden" style={{ overscrollBehavior: 'none' }}>
          {/* Grainy texture overlay */}
          <div className="fixed inset-0 opacity-30 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Gradient backgrounds with scroll-based transition */}
          <motion.div 
            className="fixed inset-0 bg-gradient-to-b from-orange-600/60 via-orange-800/40 to-orange-900/20"
            style={{ opacity: orangeOpacity }}
          />
          <motion.div 
            className="fixed inset-0 bg-black"
            style={{ opacity: blackOpacity }}
          />

          {/* Scroll indicator */}
          <motion.div 
            style={{ opacity }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <ArrowDown className="h-6 w-6 text-white/50 animate-bounce" />
          </motion.div>

          {/* Story content */}
          <div className="relative z-10 px-6 py-32 max-w-3xl mx-auto">
            {story.map((item, index) => {
              if (item.type === "heading") {
                return (
                  <motion.h2
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 1.2,
                        delay: 0.1,
                        ease: [0.25, 0.1, 0.25, 1]
                      }
                    }}
                    viewport={{ once: false, margin: "-100px" }}
                    className="text-white text-4xl md:text-5xl font-[family-name:var(--font-merriweather)] font-normal mb-8 mt-24"
                  >
                    {item.text}
                  </motion.h2>
                );
              } else if (item.type === "paragraph") {
                return (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 1.2,
                        delay: 0.1,
                        ease: [0.25, 0.1, 0.25, 1]
                      }
                    }}
                    viewport={{ once: false, margin: "-100px" }}
                    className="text-white/90 text-xl md:text-2xl leading-relaxed font-[family-name:var(--font-merriweather)] font-light mb-8"
                  >
                    {item.text}
                  </motion.p>
                );
              } else if (item.type === "divider") {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ 
                      opacity: 0.3, 
                      scaleX: 1,
                      transition: {
                        duration: 1.2,
                        delay: 0.1,
                        ease: [0.25, 0.1, 0.25, 1]
                      }
                    }}
                    viewport={{ once: false, margin: "-100px" }}
                    className="w-32 h-px bg-white mx-auto my-24"
                  />
                );
              } else if (item.type === "closing") {
                return (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 1.2,
                        delay: 0.1,
                        ease: [0.25, 0.1, 0.25, 1]
                      }
                    }}
                    viewport={{ once: false, margin: "-100px" }}
                    className="text-white text-3xl md:text-4xl font-[family-name:var(--font-merriweather)] font-normal mb-4 text-center"
                  >
                    {item.text}
                  </motion.p>
                );
              } else if (item.type === "question") {
                return (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 1.2,
                        delay: 0.2,
                        ease: [0.25, 0.1, 0.25, 1]
                      }
                    }}
                    viewport={{ once: false, margin: "-100px" }}
                    className="text-white/80 text-2xl md:text-3xl font-[family-name:var(--font-merriweather)] font-light italic text-center mt-12"
                  >
                    {item.text}
                  </motion.p>
                );
              }
            })}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 1.2,
                  delay: 0.3,
                  ease: [0.25, 0.1, 0.25, 1]
                }
              }}
              viewport={{ once: false, margin: "-50px" }}
              className="mt-32 mb-32 text-center"
            >
              <Link
                href="/sign-in"
                className="inline-block px-12 py-5 text-lg font-medium text-black bg-white rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
              >
                Begin your journey
              </Link>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ 
                opacity: 0.5,
                transition: {
                  duration: 1.2,
                  delay: 0.5
                }
              }}
              viewport={{ once: false }}
              className="text-center text-white/30 text-sm pb-16"
            >
              <p>Already have an account?{' '}
                <Link href="/sign-in" className="underline hover:text-white/50 transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div data-signed-in="true" className="hidden" />
      </SignedIn>
    </>
  );
}