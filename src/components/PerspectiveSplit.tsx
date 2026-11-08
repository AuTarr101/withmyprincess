'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Check } from 'lucide-react';

export default function PerspectiveSplit() {
  const { activePerspective, setActivePerspective } = useApp();

  return (
    <div className="space-y-3">
      {/* Container with split line down the middle */}
      <div className="scrapbook-card overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-cream-300 dark:divide-[#382630]">
        
        {/* Left Side: His */}
        <button
          type="button"
          onClick={() => setActivePerspective('his')}
          className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-500 cursor-pointer text-left select-none outline-none overflow-hidden ${
            activePerspective === 'his'
              ? 'bg-gradient-to-br from-[#E8F1FD] via-[#F5F9FF] to-[#E3EEFC] dark:from-[#0C1D3B]/90 dark:via-[#0E192D]/90 dark:to-[#0A1220]/90'
              : 'bg-white/80 hover:bg-[#F2F7FE] dark:bg-[#141218]/80 dark:hover:bg-[#101B2E]/80'
          }`}
        >
          {/* Active selection pill */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                activePerspective === 'his'
                  ? 'bg-blue-100 text-blue-900 font-bold border border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700/80'
                  : 'bg-cream-100 dark:bg-[#281D23] text-warmText-light dark:text-[#8C7A82] opacity-60'
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

          <p className="relative z-10 text-xs text-warmText-light/80 dark:text-[#A8B4C8] font-serif italic mt-1">
            Google • His rankings &amp; memories
          </p>
        </button>

        {/* Right Side: Hers (Nami) */}
        <button
          type="button"
          onClick={() => setActivePerspective('her')}
          className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-500 cursor-pointer text-left select-none outline-none overflow-hidden ${
            activePerspective === 'her'
              ? 'bg-gradient-to-bl from-[#FCE8F2] via-[#FFF5FA] to-[#FADFF0] dark:from-[#360E23]/90 dark:via-[#260D1B]/90 dark:to-[#1A0B14]/90'
              : 'bg-white/80 hover:bg-[#FDF2F7] dark:bg-[#141218]/80 dark:hover:bg-[#291220]/80'
          }`}
        >
          {/* Active selection pill */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                activePerspective === 'her'
                  ? 'bg-pink-100 text-pink-900 font-bold border border-pink-300 dark:bg-pink-950/80 dark:text-pink-200 dark:border-pink-700/80'
                  : 'bg-cream-100 dark:bg-[#281D23] text-warmText-light dark:text-[#8C7A82] opacity-60'
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

          <p className="relative z-10 text-xs text-warmText-light/80 dark:text-[#C8A4B6] font-serif italic mt-1">
            Nami • Her rankings &amp; memories
          </p>
        </button>

      </div>
    </div>
  );
}
