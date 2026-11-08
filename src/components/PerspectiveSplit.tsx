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
          className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-300 cursor-pointer text-left select-none outline-none ${
            activePerspective === 'his'
              ? 'bg-gradient-to-br from-[#FAF3EA] via-white to-[#FAF0E6] dark:from-[#2B1F19] dark:via-[#221815] dark:to-[#1E1512]'
              : 'bg-white hover:bg-[#FAF6F0] dark:bg-[#1A1216] dark:hover:bg-[#241A20]'
          }`}
        >
          {/* Active selection pill */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5">
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                activePerspective === 'his'
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800/80'
                  : 'bg-cream-100 dark:bg-[#281D23] text-warmText-light dark:text-[#8C7A82] opacity-60'
              }`}
            >
              {activePerspective === 'his' && <Check className="w-3 h-3 text-amber-800 dark:text-amber-400" />}
              <span>His Space</span>
            </span>
          </div>

          {/* His Logo Image */}
          <div className="relative flex items-center justify-center my-4 pointer-events-none">
            <img
              src="/his.png"
              alt="His logo"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
            />
          </div>

          <p className="text-xs text-warmText-light/80 dark:text-[#A8969E] font-serif italic mt-1">
            Google • His rankings &amp; memories
          </p>
        </button>

        {/* Right Side: Hers (Nami) */}
        <button
          type="button"
          onClick={() => setActivePerspective('her')}
          className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-300 cursor-pointer text-left select-none outline-none ${
            activePerspective === 'her'
              ? 'bg-gradient-to-br from-[#FDF0F3] via-white to-[#FBF0F4] dark:from-[#2E1823] dark:via-[#23131B] dark:to-[#1D0F16]'
              : 'bg-white hover:bg-[#FAF6F0] dark:bg-[#1A1216] dark:hover:bg-[#241A20]'
          }`}
        >
          {/* Active selection pill */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5">
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                activePerspective === 'her'
                  ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800/80'
                  : 'bg-cream-100 dark:bg-[#281D23] text-warmText-light dark:text-[#8C7A82] opacity-60'
              }`}
            >
              {activePerspective === 'her' && <Check className="w-3 h-3 text-rose-800 dark:text-rose-400" />}
              <span>Her Space</span>
            </span>
          </div>

          {/* Her Logo Image (munto.png) */}
          <div className="relative flex items-center justify-center my-4 pointer-events-none">
            <img
              src="/munto.png"
              alt="Nami logo"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
            />
          </div>

          <p className="text-xs text-warmText-light/80 dark:text-[#A8969E] font-serif italic mt-1">
            Nami • Her rankings &amp; memories
          </p>
        </button>

      </div>
    </div>
  );
}
