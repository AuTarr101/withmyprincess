'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ThemeSlider from './ThemeSlider';
import { getThailandNow } from '@/lib/mock-data';

export default function HeroBanner() {
  const [thailandTime, setThailandTime] = useState(() => getThailandNow());

  useEffect(() => {
    setThailandTime(getThailandNow());
  }, []);

  const showcaseHref = `/showcase?year=${thailandTime.year}&month=${thailandTime.month}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F8F2E8] to-[#FAF5EE] dark:from-[#241A1E] dark:via-[#1E1519] dark:to-[#171014] border border-[#EDE4D8] dark:border-[#382630] p-5 sm:p-10 shadow-[0_4px_24px_rgba(110,45,59,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
      
      {/* Top Right: Light / Dark Mode Slider */}
      <div className="absolute top-4 right-4 sm:top-7 sm:right-7 z-20">
        <ThemeSlider />
      </div>

      {/* Subtle Watermark emblem in bottom-right matching the reference image */}
      <div className="absolute right-2 -bottom-4 sm:right-3 pointer-events-none select-none opacity-15 sm:opacity-25 dark:opacity-15 transition-opacity">
        <svg
          width="220"
          height="140"
          viewBox="0 0 200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-36 h-24 sm:w-[220px] sm:h-[140px] text-wine-800 dark:text-rose-400"
        >
          <path
            d="M50 60 C50 35, 80 35, 100 60 C120 85, 150 85, 150 60 C150 35, 120 35, 100 60 C80 85, 50 85, 50 60 Z"
            stroke="currentColor"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Banner Content */}
      <div className="relative z-10 max-w-2xl">
        {/* Heading in editorial serif font with right clearance for ThemeSlider */}
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-[44px] font-normal tracking-tight text-wine-700 dark:text-[#F8ECF0] leading-[1.18] mb-3 pr-20 sm:pr-24">
          I love you Munto.
        </h1>

        {/* Custom text */}
        <p className="text-warmText-body dark:text-[#D5BFC7] text-xs sm:text-base leading-relaxed mb-6 sm:mb-7 max-w-xl font-light pr-4 sm:pr-0">
          大きなお腹のテディベアと、永遠に完璧な小さなお姫様の思い出だけ
        </p>

        {/* Action button based on current calendar month -> Opens Full Showcase Tab */}
        <div className="flex items-center gap-3">
          <Link
            href={showcaseHref}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-wine-600 hover:bg-wine-700 dark:bg-[#993A52] dark:hover:bg-[#B34561] text-white font-medium text-xs sm:text-sm transition-all shadow-[0_4px_14px_rgba(126,59,77,0.22)] dark:shadow-[0_4px_18px_rgba(153,58,82,0.35)] active:scale-[0.98] cursor-pointer"
          >
            <span>Open {thailandTime.monthName} Ranking</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
