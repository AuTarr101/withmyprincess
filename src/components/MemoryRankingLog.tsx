'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MONTH_NAMES, getThailandNow } from '@/lib/mock-data';
import { fetchMemoryMetadata } from '@/lib/media-helper';
import MemoryBannerWidget from './MemoryBannerWidget';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Loader2,
} from 'lucide-react';

export default function MemoryRankingLog() {
  const { getMonth, saveMonthMemory, theme } = useApp();

  // Month navigation: defaults to current Thailand time (Asia/Bangkok)
  const [selectedYear, setSelectedYear] = useState<number>(() => getThailandNow().year);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => getThailandNow().month);

  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // "Darkroom" midnight archival print toggle (mirrors Movie's Dim Lights mode)
  const [isDarkroom, setIsDarkroom] = useState(false);

  const monthId = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthData = getMonth(selectedYear, selectedMonth);
  const monthName = MONTH_NAMES[selectedMonth - 1] || 'Month';

  const isAtStart = selectedYear === 2026 && selectedMonth <= 10;

  const handlePrevMonth = () => {
    if (isAtStart) return;
    setIsEditing(false);
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setIsEditing(false);
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleLogMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isSubmitting) return;

    const trimmed = inputUrl.trim();
    try {
      setIsSubmitting(true);
      const metadata = await fetchMemoryMetadata(trimmed);
      saveMonthMemory(monthId, metadata);
      setInputUrl('');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to extract memory metadata:', err);
      saveMonthMemory(monthId, trimmed);
      setInputUrl('');
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMemory = monthData.memoryLog;
  const hasMemory = Boolean(currentMemory?.url);
  const defaultPageBg = theme === 'dark' ? '#140F12' : '#FDFBF7';

  return (
    <div className="max-w-3xl mx-auto py-2 px-2 space-y-6 relative">
      {/* Dynamic Main Page Background (shifts to darkroom-black when Darkroom mode is active) */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-700 -z-30"
        style={{
          backgroundColor: isDarkroom ? '#080706' : defaultPageBg,
        }}
      />

      {/* 1. Floating circular tab for month changing */}
      <div
        className={`flex items-center justify-between w-full max-w-md mx-auto px-6 py-3 rounded-full bg-white/95 dark:bg-[#22181E]/95 backdrop-blur-md shadow-md border border-cream-200 dark:border-[#3A2832] text-stone-800 dark:text-rose-100 transition-all duration-500 ${
          isDarkroom ? 'opacity-35 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <button
          onClick={handlePrevMonth}
          disabled={isAtStart}
          className="p-1.5 rounded-full hover:bg-cream-100 dark:hover:bg-[#32222B] disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-stone-600 dark:text-rose-200 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-serif text-lg sm:text-xl font-medium tracking-wide text-wine-900 dark:text-rose-100 select-none">
          {monthName} {selectedYear}
        </span>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-full hover:bg-cream-100 dark:hover:bg-[#32222B] transition-colors text-stone-600 dark:text-rose-200 cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Floating input bar (hidden when locked for immersion) */}
      {(!hasMemory || isEditing) && (
        <form
          onSubmit={handleLogMemory}
          className="w-full max-w-2xl mx-auto rounded-full bg-white/95 dark:bg-[#22181E]/95 backdrop-blur-md shadow-md border border-cream-200 dark:border-[#3A2832] p-1.5 sm:p-2 flex items-center gap-2 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-wine-300 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              hasMemory
                ? 'Replace print with a new photo link or video URL...'
                : 'Paste photo URL or video link to archive your memory print...'
            }
            disabled={isSubmitting}
            className="flex-1 bg-transparent px-4 sm:px-6 py-2.5 text-sm sm:text-base text-stone-800 dark:text-rose-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none rounded-full disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={!inputUrl.trim() || isSubmitting}
            className="px-6 sm:px-7 py-2.5 bg-wine-700 hover:bg-wine-800 active:scale-95 text-white rounded-full font-medium text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Developing...</span>
              </>
            ) : (
              <span>{hasMemory ? 'Update Print' : 'Archive Print'}</span>
            )}
          </button>
        </form>
      )}

      {/* 3. Memory Print Widget or Minimal Empty State */}
      <div className="pt-2">
        {hasMemory && currentMemory ? (
          <MemoryBannerWidget
            memory={currentMemory}
            monthId={monthId}
            monthName={monthName}
            year={selectedYear}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            isDarkroom={isDarkroom}
            onToggleDarkroom={() => setIsDarkroom(!isDarkroom)}
          />
        ) : (
          <div className="w-full max-w-xl mx-auto rounded-md bg-[#ECE9E2] dark:bg-[#15120F] text-[#1E1B18] dark:text-[#F1ECE2] p-8 sm:p-10 text-center shadow-xl border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-black/10 dark:border-white/10 font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">
              <span>ARCHIVE N° {monthId}</span>
              <span>35MM · UNEXPOSED FRAME</span>
              <span>I &amp; II</span>
            </div>

            <div className="w-full aspect-[4/3] border border-dashed border-black/20 dark:border-white/20 flex flex-col items-center justify-center p-6 mb-6">
              <Camera className="w-8 h-8 stroke-[1.25] opacity-45 mb-3" />
              <p className="font-poster uppercase text-2xl sm:text-3xl tracking-tight font-bold">
                Unexposed Frame
              </p>
              <p className="text-xs sm:text-sm opacity-60 mt-1 max-w-xs">
                Paste a photo link or video URL above to develop your print for {monthName} {selectedYear}
              </p>
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase opacity-50">
              <span>EVER TOGETHER ♡</span>
              <span>{monthName.slice(0, 3)} {selectedYear}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
