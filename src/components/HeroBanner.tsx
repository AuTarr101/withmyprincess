'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ThemeSlider from './ThemeSlider';

export default function HeroBanner() {
  const [currentMonthName, setCurrentMonthName] = useState('October');

  useEffect(() => {
    try {
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
      if (month) setCurrentMonthName(month);
    } catch {
      // Fallback
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F8F2E8] to-[#FAF5EE] dark:from-[#241A1E] dark:via-[#1E1519] dark:to-[#171014] border border-[#EDE4D8] dark:border-[#382630] p-7 sm:p-10 shadow-[0_4px_24px_rgba(110,45,59,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
      
      {/* Top Right: Light / Dark Mode Slider */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20">
        <ThemeSlider />
      </div>

      {/* Subtle Watermark emblem in bottom-right matching the reference image */}
      <div className="absolute right-3 -bottom-4 pointer-events-none select-none opacity-20 sm:opacity-25 dark:opacity-15 transition-opacity">
        <svg
          width="220"
          height="140"
          viewBox="0 0 200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-wine-800 dark:text-rose-400"
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
      <div className="relative z-10 max-w-2xl pr-16 sm:pr-20">
        {/* Heading in editorial serif font */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal tracking-tight text-wine-700 dark:text-[#F8ECF0] leading-[1.15] mb-3">
          I love you Munto.
        </h1>

        {/* Custom text */}
        <p className="text-warmText-body dark:text-[#D5BFC7] text-sm sm:text-base leading-relaxed mb-7 max-w-xl font-light">
          大きなお腹のテディベアと、永遠に完璧な小さなお姫様の思い出だけ
        </p>

        {/* Action button based on current calendar month */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-wine-600 hover:bg-wine-700 dark:bg-[#993A52] dark:hover:bg-[#B34561] text-white font-medium text-sm transition-all shadow-[0_4px_14px_rgba(126,59,77,0.22)] dark:shadow-[0_4px_18px_rgba(153,58,82,0.35)] active:scale-[0.98] cursor-default"
          >
            <span>Open {currentMonthName} Ranking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
