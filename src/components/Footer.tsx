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
    // Count up from June 21, 2026 at 02:13:19 AM Thailand Time (ICT / UTC+7)
    const startDate = new Date('2026-06-21T02:13:19+07:00').getTime();

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
    <footer className="mt-12 pb-4">
      <div className="shower-glass overflow-hidden px-6 py-9 sm:px-10 sm:py-11 text-center space-y-4">
        <div className="relative z-10 space-y-4">
          {/* Heart Icon */}
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/55 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/15 text-wine-600 dark:text-rose-300 shadow-2xs">
            <Heart className="w-4 h-4 fill-wine-500/30 dark:fill-rose-400/30 text-wine-600 dark:text-rose-300" />
          </div>

          {/* Space Name */}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-wine-800 dark:text-rose-100 tracking-tight">
            Google &amp; Nami ♡
          </h3>

          {/* Counting Clock: Frosted Shower-Glass Pill */}
          <div className="inline-flex items-center justify-center gap-3 sm:gap-4 px-6 py-3 rounded-2xl bg-white/25 dark:bg-white/[0.03] backdrop-blur-xl border border-white/55 dark:border-white/12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_16px_rgba(60,30,45,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_6px_20px_rgba(0,0,0,0.3)]">
            <div className="text-center min-w-[36px]">
              <span className="font-serif text-lg sm:text-2xl font-bold text-wine-800 dark:text-rose-100 block leading-none">
                {elapsed.days}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#A8969E]">
                Days
              </span>
            </div>

            <span className="font-serif text-sm font-bold text-wine-400/70 dark:text-rose-300/40">:</span>

            <div className="text-center min-w-[32px]">
              <span className="font-serif text-lg sm:text-2xl font-bold text-wine-800 dark:text-rose-100 block leading-none">
                {String(elapsed.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#A8969E]">
                Hours
              </span>
            </div>

            <span className="font-serif text-sm font-bold text-wine-400/70 dark:text-rose-300/40">:</span>

            <div className="text-center min-w-[32px]">
              <span className="font-serif text-lg sm:text-2xl font-bold text-wine-800 dark:text-rose-100 block leading-none">
                {String(elapsed.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#A8969E]">
                Mins
              </span>
            </div>

            <span className="font-serif text-sm font-bold text-wine-400/70 dark:text-rose-300/40">:</span>

            <div className="text-center min-w-[32px]">
              <span className="font-serif text-lg sm:text-2xl font-bold text-wine-800 dark:text-rose-100 block leading-none">
                {String(elapsed.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-warmText-light dark:text-[#A8969E]">
                Secs
              </span>
            </div>
          </div>

          {/* Clickable link: view archieve */}
          <div>
            <Link
              href="/archive"
              className="text-xs text-warmText-body dark:text-[#C5B2BA] hover:text-wine-700 dark:hover:text-rose-200 transition-colors underline underline-offset-4 decoration-wine-300/60 dark:decoration-white/25 hover:decoration-wine-500 font-medium"
            >
              view archieve
            </Link>
          </div>

          <p className="text-xs text-warmText-light/90 dark:text-[#A8969E] font-light">
            大きなお腹のテディベアと、永遠に完璧な小さなお姫様の思い出だけ
          </p>

          <p className="text-[11px] text-warmText-light/65 dark:text-[#827078]">
            Ever, Together ♡
          </p>
        </div>
      </div>
    </footer>
  );
}
