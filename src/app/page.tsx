'use client';

import React from 'react';
import Link from 'next/link';
import HeroBanner from '@/components/HeroBanner';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import PerspectiveSplit from '@/components/PerspectiveSplit';
import Footer from '@/components/Footer';
import {
  Film,
  Gamepad2,
  Utensils,
  Camera,
  Music,
} from 'lucide-react';
import { CategorySlug } from '@/types/database';

export default function HomePage() {
  const categories = [
    {
      slug: 'movie' as CategorySlug,
      title: 'Movie',
      icon: Film,
      bg: 'bg-rose-50/50 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-900/40',
      border: 'border-rose-200/80 hover:border-rose-400 dark:border-rose-900/60 dark:hover:border-rose-600',
      iconColor: 'text-rose-400 dark:text-rose-300',
      hoverTextColor: 'text-[#6A1A2B] dark:text-rose-100',
      href: '/movie',
    },
    {
      slug: 'game' as CategorySlug,
      title: 'Game',
      icon: Gamepad2,
      bg: 'bg-amber-50/50 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-900/40',
      border: 'border-amber-200/80 hover:border-amber-400 dark:border-amber-900/60 dark:hover:border-amber-600',
      iconColor: 'text-amber-500 dark:text-amber-400',
      hoverTextColor: 'text-[#783D07] dark:text-amber-100',
      href: '/game',
    },
    {
      slug: 'food' as CategorySlug,
      title: 'Food',
      icon: Utensils,
      bg: 'bg-orange-50/50 hover:bg-orange-100/70 dark:bg-orange-950/20 dark:hover:bg-orange-900/40',
      border: 'border-orange-200/80 hover:border-orange-400 dark:border-orange-900/60 dark:hover:border-orange-600',
      iconColor: 'text-orange-500 dark:text-orange-400',
      hoverTextColor: 'text-[#842704] dark:text-orange-100',
      href: '/food',
    },
    {
      slug: 'memory' as CategorySlug,
      title: 'Memory',
      icon: Camera,
      bg: 'bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40',
      border: 'border-emerald-200/80 hover:border-emerald-400 dark:border-emerald-900/60 dark:hover:border-emerald-600',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      hoverTextColor: 'text-[#184E30] dark:text-emerald-100',
      href: '/memory',
    },
    {
      slug: 'music' as CategorySlug,
      title: 'Music',
      icon: Music,
      bg: 'bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-950/20 dark:hover:bg-purple-900/40',
      border: 'border-purple-200/80 hover:border-purple-400 dark:border-purple-900/60 dark:hover:border-purple-600',
      iconColor: 'text-purple-400 dark:text-purple-300',
      hoverTextColor: 'text-[#451B63] dark:text-purple-100',
      href: '/music',
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Five Categories: Big icon in middle, text completely invisible until hover */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;

          const cardContent = (
            <>
              {/* Big icon in the middle: visible normally, fades on hover */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Icon
                  className={`w-14 h-14 sm:w-16 sm:h-16 stroke-[1.5] transition-all duration-300 opacity-90 group-hover:opacity-10 group-hover:scale-110 ${cat.iconColor}`}
                />
              </div>

              {/* Category word: invisible until hover, appears centered on top with darker contrast accent */}
              <span
                className={`relative z-10 font-serif text-lg sm:text-xl font-bold tracking-wide transition-all duration-300 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 ${cat.hoverTextColor}`}
              >
                {cat.title}
              </span>
            </>
          );

          if (cat.href) {
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className={`group relative flex items-center justify-center h-36 sm:h-44 rounded-3xl border transition-all duration-300 overflow-hidden shadow-scrapbook cursor-pointer select-none outline-none ${cat.bg} ${cat.border}`}
                title={`Open ${cat.title} Ranking Log`}
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div
              key={cat.slug}
              className={`group relative flex items-center justify-center h-36 sm:h-44 rounded-3xl border transition-all duration-300 overflow-hidden shadow-scrapbook cursor-default select-none outline-none ${cat.bg} ${cat.border}`}
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* 3. Monthly Calendar */}
      <MonthlyCalendar />

      {/* 4. Split Section: Teddy Bear (view his's) on left | Fluffy Puppy (view her's) on right */}
      <PerspectiveSplit />

      {/* 5. Footer: Rendered ONLY on Home Page */}
      <Footer />

    </div>
  );
}
