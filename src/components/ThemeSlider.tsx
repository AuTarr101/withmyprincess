'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Sun, Moon } from 'lucide-react';

interface ThemeSliderProps {
  className?: string;
}

export default function ThemeSlider({ className = '' }: ThemeSliderProps) {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative flex items-center w-[68px] h-[34px] sm:w-[74px] sm:h-[36px] rounded-full p-1 cursor-pointer transition-all duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-wine-500/50 ${
        isDark
          ? 'bg-[#291B22] border border-[#482F3B] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]'
          : 'bg-[#EDE4D8] border border-[#DDD0C2] shadow-[inset_0_2px_4px_rgba(110,45,59,0.08)]'
      } ${className}`}
    >
      {/* Background stationary icons for context */}
      <div className="absolute inset-0 px-2 flex items-center justify-between pointer-events-none">
        <Sun
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
            isDark ? 'text-[#644D58] opacity-50' : 'text-amber-600/70 opacity-40'
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
            isDark ? 'text-rose-300/40 opacity-40' : 'text-[#9A8682] opacity-50'
          }`}
        />
      </div>

      {/* Sliding Thumb */}
      <div
        className={`relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-md ${
          isDark
            ? 'translate-x-[34px] sm:translate-x-[38px] bg-[#171014] border border-[#523744] text-rose-300 shadow-[0_2px_10px_rgba(0,0,0,0.6)]'
            : 'translate-x-0 bg-white border border-[#E8DDD0] text-amber-500 shadow-[0_2px_8px_rgba(110,45,59,0.18)]'
        } group-hover:scale-105 active:scale-95`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-rose-300/25 stroke-[2] animate-in zoom-in-75 duration-200" />
        ) : (
          <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 stroke-[2] animate-in zoom-in-75 duration-200" />
        )}
      </div>
    </button>
  );
}
