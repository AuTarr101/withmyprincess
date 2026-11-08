'use client';

import React from 'react';
import { useApp } from '@/lib/store';

export default function PerspectivePill() {
  const { activePerspective, setActivePerspective, isSupabaseConnected } = useApp();

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/95 dark:bg-[#22181E]/95 border border-cream-300 dark:border-[#3A2832] shadow-2xs backdrop-blur-md">
      <button
        type="button"
        onClick={() => setActivePerspective('his')}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          activePerspective === 'his'
            ? 'bg-blue-100 text-blue-900 border border-blue-300/80 dark:bg-blue-950/85 dark:text-blue-200 dark:border-blue-700/80 shadow-2xs'
            : 'text-stone-500 dark:text-[#9A8790] hover:text-stone-800 dark:hover:text-blue-200'
        }`}
        title="View & edit Google's (His) picks"
      >
        <img src="/his.png" alt="His" className="w-5 h-5 object-contain" />
        <span>His Space</span>
      </button>

      <button
        type="button"
        onClick={() => setActivePerspective('her')}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          activePerspective === 'her'
            ? 'bg-pink-100 text-pink-900 border border-pink-300/80 dark:bg-pink-950/85 dark:text-pink-200 dark:border-pink-700/80 shadow-2xs'
            : 'text-stone-500 dark:text-[#9A8790] hover:text-stone-800 dark:hover:text-pink-200'
        }`}
        title="View & edit Nami's (Her) picks"
      >
        <img src="/munto.png" alt="Nami" className="w-5 h-5 object-contain" />
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
