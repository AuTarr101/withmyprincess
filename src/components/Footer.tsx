'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Count up from June 1, 2026 at 02:13:19 AM
    const startDate = new Date(2026, 5, 1, 2, 13, 19).getTime();

    const updateClock = () => {
      const now = Date.now();
      const diff = Math.max(0, now - startDate);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setElapsed({ days, hours, minutes, seconds });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-16 border-t border-cream-300 dark:border-[#33222A] bg-cream-50/60 dark:bg-[#160F13]/80 py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        
        {/* Heart Icon */}
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-wine-50 dark:bg-wine-950/60 text-wine-600 dark:text-rose-400">
          <Heart className="w-4 h-4 fill-wine-500/30 dark:fill-rose-400/30 text-wine-600 dark:text-rose-400" />
        </div>

        {/* Space Name */}
        <h3 className="font-serif text-lg font-bold text-wine-800 dark:text-rose-200 tracking-tight">
          Google & Nami ♡
        </h3>

        {/* Counting Clock: count up from June 2026 2:13:19 am */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-4 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#1F161B] border border-cream-200/80 dark:border-[#382630] shadow-2xs dark:shadow-md">
          <div className="text-center min-w-[36px]">
            <span className="font-serif text-lg sm:text-2xl font-bold text-wine-700 dark:text-rose-200 block leading-none">
              {elapsed.days}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#8C7A82]">
              Days
            </span>
          </div>

          <span className="font-serif text-sm font-bold text-wine-300 dark:text-rose-900">:</span>

          <div className="text-center min-w-[32px]">
            <span className="font-serif text-lg sm:text-2xl font-bold text-wine-700 dark:text-rose-200 block leading-none">
              {String(elapsed.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#8C7A82]">
              Hours
            </span>
          </div>

          <span className="font-serif text-sm font-bold text-wine-300 dark:text-rose-900">:</span>

          <div className="text-center min-w-[32px]">
            <span className="font-serif text-lg sm:text-2xl font-bold text-wine-700 dark:text-rose-200 block leading-none">
              {String(elapsed.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#8C7A82]">
              Mins
            </span>
          </div>

          <span className="font-serif text-sm font-bold text-wine-300 dark:text-rose-900">:</span>

          <div className="text-center min-w-[32px]">
            <span className="font-serif text-lg sm:text-2xl font-bold text-wine-700 dark:text-rose-200 block leading-none">
              {String(elapsed.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#8C7A82]">
              Secs
            </span>
          </div>
        </div>

        {/* Clickable link: view archieve */}
        <div>
          <Link
            href="/archive"
            className="text-xs text-warmText-light dark:text-[#9A8790] hover:text-wine-700 dark:hover:text-rose-200 transition-colors underline underline-offset-4 decoration-cream-300 dark:decoration-[#442E39] hover:decoration-wine-500 font-medium"
          >
            view archieve
          </Link>
        </div>

        <p className="text-xs text-warmText-light/80 dark:text-[#8C7A82] font-light">
          大きなお腹のテディベアと、永遠に完璧な小さなお姫様の思い出だけ
        </p>

        <p className="text-[11px] text-warmText-light/50 dark:text-[#6E5D65]">
          Ever, Together ♡
        </p>
      </div>
    </footer>
  );
}
