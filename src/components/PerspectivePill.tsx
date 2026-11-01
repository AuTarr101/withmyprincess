'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import TeddyBearIcon from './icons/TeddyBearIcon';
import FluffyPuppyIcon from './icons/FluffyPuppyIcon';

export default function PerspectivePill() {
  const { activePerspective, setActivePerspective, isSupabaseConnected } = useApp();

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/95 dark:bg-[#22181E]/95 border border-cream-300 dark:border-[#3A2832] shadow-2xs backdrop-blur-md">
      <button
        type="button"
        onClick={() => setActivePerspective('his')}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          activePerspective === 'his'
            ? 'bg-amber-100 text-amber-900 border border-amber-300/80 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800/80 shadow-2xs'
            : 'text-stone-500 dark:text-[#9A8790] hover:text-stone-800 dark:hover:text-rose-100'
        }`}
        title="View & edit Google's (His) picks"
      >
        <TeddyBearIcon className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
        <span>His Space</span>
      </button>

      <button
        type="button"
        onClick={() => setActivePerspective('her')}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          activePerspective === 'her'
            ? 'bg-rose-100 text-rose-900 border border-rose-300/80 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800/80 shadow-2xs'
            : 'text-stone-500 dark:text-[#9A8790] hover:text-stone-800 dark:hover:text-rose-100'
        }`}
        title="View & edit Nami's (Her) picks"
      >
        <FluffyPuppyIcon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        <span>Her Space</span>
      </button>

      {isSupabaseConnected && (
        <span
          className="w-2 h-2 rounded-full bg-emerald-500 mx-1.5"
          title="Synced with Supabase Cloud"
        />
      )}
    </div>
  );
}
