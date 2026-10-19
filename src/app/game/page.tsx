'use client';

import React from 'react';
import Link from 'next/link';
import GameRankingLog from '@/components/GameRankingLog';
import { ArrowLeft } from 'lucide-react';

export default function GameRankingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back to Home Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#22181E] border border-cream-300 dark:border-[#3A2832] text-xs font-semibold text-wine-700 dark:text-rose-200 hover:bg-cream-100 dark:hover:bg-[#2E2028] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Full Dedicated Page: Game Ranking Log */}
      <GameRankingLog />
    </div>
  );
}
