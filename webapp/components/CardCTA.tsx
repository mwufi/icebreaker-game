'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CardCTAProps {
    title: string;
    description: string;
    href: string;
    className?: string;
    initial?: any;
    animate?: any;
    transition?: any;
}

export function CardCTA({
    title,
    description,
    href,
    className = '',
    initial = { opacity: 0, y: 20 },
    animate = { opacity: 1, y: 0 },
    transition = { duration: 0.8, delay: 0.1 }
}: CardCTAProps) {
    return (
        <motion.div
            initial={initial}
            animate={animate}
            transition={transition}
        >
            <Link href={href}>
                <div className={`group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${className}`}>
                    {/* Soft gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 via-pink-500/80 to-orange-500/80" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-yellow-500/20" />

                    {/* Content */}
                    <div className="relative p-8 md:p-12">
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <h3 className="text-xl md:text-3xl font-[family-name:var(--font-merriweather)] text-white">
                                    {title}
                                </h3>
                                <p className="text-white/90">
                                    {description}
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <ArrowRight className="h-8 w-8 text-white group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
            </Link>
        </motion.div>
    );
}
