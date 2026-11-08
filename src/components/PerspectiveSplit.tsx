'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Check } from 'lucide-react';

export default function PerspectiveSplit() {
  const { activePerspective, setActivePerspective } = useApp();

  return (
    <div className="space-y-3">
      {/* Container with split line down the middle */}
      <div className="scrapbook-card overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/50 dark:divide-white/10">
        
        {/* Left Side: His */}
        <button
          type="button"
          onClick={() => setActivePerspective('his')}
          className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-500 cursor-pointer text-left select-none outline-none overflow-hidden ${
            activePerspective === 'his'
              ? 'bg-gradient-to-br from-blue-500/[0.08] via-white/25 to-blue-400/[0.05] dark:from-blue-500/[0.12] dark:via-white/[0.02] dark:to-blue-900/[0.08]'
              : 'bg-transparent hover:bg-white/25 dark:hover:bg-white/[0.03]'
          }`}
        >
          {/* Active selection pill */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 backdrop-blur-md ${
                activePerspective === 'his'
                  ? 'bg-blue-100/80 text-blue-900 font-bold border border-blue-300/70 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-700/60'
                  : 'bg-white/40 dark:bg-white/10 text-warmText-light dark:text-[#9A8A92] opacity-70'
              }`}
            >
              {activePerspective === 'his' && <Check className="w-3 h-3 text-blue-700 dark:text-blue-400" />}
              <span>His Space</span>
            </span>
          </div>

          {/* His Logo Image */}
          <div className="relative flex items-center justify-center my-4 pointer-events-none z-10">
            <img
              src="/his.png"
              alt="His logo"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
            />
          </div>

          <p className="relative z-10 text-xs text-warmText-light/90 dark:text-[#B4C0D4] font-serif italic mt-1">
            Google • His rankings &amp; memories
          </p>
        </button>

        {/* Right Side: Hers (Nami) */}
        <button
          type="button"
          onClick={() => setActivePerspective('her')}
          className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-500 cursor-pointer text-left select-none outline-none overflow-hidden ${
            activePerspective === 'her'
              ? 'bg-gradient-to-bl from-pink-500/[0.07] via-white/25 to-rose-400/[0.04] dark:from-pink-500/[0.10] dark:via-white/[0.02] dark:to-rose-900/[0.07]'
              : 'bg-transparent hover:bg-white/25 dark:hover:bg-white/[0.03]'
          }`}
        >
          {/* Active selection pill */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 backdrop-blur-md ${
                activePerspective === 'her'
                  ? 'bg-pink-100/80 text-pink-900 font-bold border border-pink-300/70 dark:bg-pink-950/70 dark:text-pink-200 dark:border-pink-700/60'
                  : 'bg-white/40 dark:bg-white/10 text-warmText-light dark:text-[#9A8A92] opacity-70'
              }`}
            >
              {activePerspective === 'her' && <Check className="w-3 h-3 text-pink-700 dark:text-pink-400" />}
              <span>Her Space</span>
            </span>
          </div>

          {/* Her Logo Image (munto.png) */}
          <div className="relative flex items-center justify-center my-4 pointer-events-none z-10">
            <img
              src="/munto.png"
              alt="Nami logo"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
            />
          </div>

          <p className="relative z-10 text-xs text-warmText-light/90 dark:text-[#CEB2C0] font-serif italic mt-1">
            Nami • Her rankings &amp; memories
          </p>
        </button>

      </div>
    </div>
  );
}
