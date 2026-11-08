'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, Heart } from 'lucide-react';

interface Keepsake {
  id: string;
  name: string;
  date: string;
  url: string;
  badge?: string;
}

// In chronological order (earliest to latest)
const KEEPSAKES: Keepsake[] = [
  {
    id: 'anniversary-edition',
    name: 'Anniversary Memory & Photo Gallery Edition',
    date: 'Jul 21 at 10:10 PM',
    url: '/archive/anniversary-edition.html',
  },
  {
    id: 'special-letter',
    name: 'Special Love Letter & Envelope Keepsake',
    date: 'Jun 17 at 2:00 PM',
    url: '/archive/special-letter.html',
  },
  {
    id: 'open-when-letters',
    name: 'Open When Letters',
    date: 'Oct 23, 2026',
    url: 'https://openwhenletters.app/l/7adfab36-a800-4194-a8d0-27bbcab31102/view/7afb9453cc86643b0df986c69eea08e86c4b449988658a112230901a358f5ab0',
    badge: 'she made this ♡',
  },
];

export default function ArchivePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1C1417] border border-cream-300 dark:border-wine-900/50 text-xs font-semibold text-wine-700 dark:text-rose-300 hover:bg-cream-100 dark:hover:bg-wine-950/50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scrapbook</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF9F5] via-[#FFF1F2] to-[#FAF5FF] dark:from-[#20151A] dark:via-[#1A1217] dark:to-[#17121F] border border-wine-200/60 dark:border-wine-900/50 p-6 sm:p-10 shadow-sm">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-wine-950 dark:text-rose-100 tracking-tight">
            Our Archived Keepsakes
          </h1>
          <p className="text-sm text-[#6E5D5B] dark:text-[#C5B3B1]">
            Handcrafted letters and special celebration pages preserved forever in chronological order.
          </p>
        </div>
      </div>

      {/* Keepsakes List in Chronological Order */}
      <div className="space-y-3">
        {KEEPSAKES.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1316] border border-cream-300 dark:border-wine-900/50 hover:border-wine-300 dark:hover:border-wine-800 transition-all shadow-2xs group"
          >
            {/* Number, Name, Badge & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
              <span className="font-mono text-xs opacity-40 shrink-0">
                0{index + 1}
              </span>
              <span className="font-serif font-medium text-base sm:text-lg text-wine-950 dark:text-rose-100 truncate">
                {item.name}
              </span>
              {item.badge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60 shrink-0">
                  <Heart className="w-3 h-3 text-rose-600 dark:text-rose-400 fill-rose-600/30" />
                  <span>{item.badge}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-[#8A7A78] dark:text-[#A89694] font-sans shrink-0 sm:ml-2">
                <Calendar className="w-3 h-3 text-rose-500/70 dark:text-rose-400/70" />
                <span>{item.date}</span>
              </span>
            </div>

            {/* Clickable Button Link */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-wine-600 hover:bg-wine-700 text-white text-xs font-semibold shadow-2xs hover:shadow transition-all shrink-0 ml-4 cursor-pointer"
            >
              <span>Open</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
