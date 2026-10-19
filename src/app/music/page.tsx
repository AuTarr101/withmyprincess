'use client';

import React from 'react';
import Link from 'next/link';
import MusicRankingLog from '@/components/MusicRankingLog';
import { ArrowLeft } from 'lucide-react';

export default function MusicRankingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Back to Home Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-cream-300 text-xs font-semibold text-wine-700 hover:bg-cream-100 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Full Dedicated Page: Music Ranking Log */}
      <MusicRankingLog />

    </div>
  );
}
