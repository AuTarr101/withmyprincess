'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MONTH_NAMES, getThailandNow } from '@/lib/mock-data';
import { fetchGameMetadata } from '@/lib/media-helper';
import GameBannerWidget from './GameBannerWidget';
import RetroTvFrame from './RetroTvFrame';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function GameRankingLog() {
  const { getMonth, saveMonthGame, theme } = useApp();

  // Month navigation: defaults to current Thailand time (Asia/Bangkok)
  const [selectedYear, setSelectedYear] = useState<number>(() => getThailandNow().year);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => getThailandNow().month);

  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleLogGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isSubmitting) return;

    const trimmed = inputUrl.trim();
    try {
      setIsSubmitting(true);
      const metadata = await fetchGameMetadata(trimmed);
      saveMonthGame(monthId, metadata);
      setInputUrl('');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to extract game metadata:', err);
      saveMonthGame(monthId, trimmed);
      setInputUrl('');
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentGame = monthData.gameLog;
  const hasGame = Boolean(currentGame?.url);
  // Warm vintage living-room backdrop that complements the walnut wood CRT TV
  const pageBg = theme === 'dark' ? '#17120E' : '#F3EDE2';

  return (
    <div className="max-w-3xl mx-auto py-2 px-2 space-y-6 relative">
      {/* Dynamic Main Page Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 -z-30"
        style={{
          backgroundColor: pageBg,
        }}
      />

      {/* 1. Floating circular tab for month changing (Walnut & Cream TV style) */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto px-6 py-3 rounded-full bg-[#EDE6DA] dark:bg-[#231D19] shadow-md border-2 border-[#784720] text-[#1D1A18] dark:text-[#EDE6DA] transition-all">
        <button
          onClick={handlePrevMonth}
          disabled={isAtStart}
          className="p-1.5 rounded-full hover:bg-[#D8CFC2] dark:hover:bg-[#332A24] disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-[#4B280E] dark:text-[#E5BC38] cursor-pointer disabled:cursor-not-allowed"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#3A220F] dark:text-[#F5EFE6] select-none">
          {monthName} {selectedYear}
        </span>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-full hover:bg-[#D8CFC2] dark:hover:bg-[#332A24] transition-colors text-[#4B280E] dark:text-[#E5BC38] cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Floating input bar (hidden when locked for immersion) */}
      {(!hasGame || isEditing) && (
        <form
          onSubmit={handleLogGame}
          className="w-full max-w-2xl mx-auto rounded-full bg-[#EDE6DA] dark:bg-[#231D19] shadow-md border-2 border-[#784720] p-1.5 sm:p-2 flex items-center gap-2 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-[#D9AD4E] animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              hasGame
                ? 'Replace game with a new YouTube gameplay, Steam, or cover link...'
                : 'Paste YouTube gameplay trailer, Steam, or cover link...'
            }
            disabled={isSubmitting}
            className="flex-1 bg-transparent px-4 sm:px-6 py-2.5 text-sm sm:text-base text-[#1D1A18] dark:text-[#EDE6DA] placeholder-[#7A6F63] dark:placeholder-[#8C8175] outline-none rounded-full disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={!inputUrl.trim() || isSubmitting}
            className="px-6 sm:px-7 py-2.5 rounded-full font-mono font-bold uppercase tracking-wider text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-2 border border-[#3B2B10] text-[#1D1A18] active:scale-95"
            style={{
              background: 'linear-gradient(180deg, #E5BC38 0%, #C29438 100%)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tuning...</span>
              </>
            ) : (
              <span>{hasGame ? 'Tune Channel' : 'Tune Game'}</span>
            )}
          </button>
        </form>
      )}

      {/* 3. Game TV Widget or Empty State */}
      <div className="pt-2">
        {hasGame && currentGame ? (
          <GameBannerWidget
            game={currentGame}
            monthId={monthId}
            monthName={monthName}
            year={selectedYear}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
          />
        ) : (
          <div
            className="w-full max-w-2xl mx-auto rounded-[32px] p-3 sm:p-4 border-2 border-[#4E2C12] shadow-2xl"
            style={{
              background:
                'linear-gradient(180deg, #A56A38 0%, #865024 18%, #73421B 52%, #5F3514 85%, #4B280E 100%)',
            }}
          >
            <div className="rounded-[24px] p-1.5 sm:p-2 bg-gradient-to-b from-[#E5DDD0] via-[#CFC5B6] to-[#9E9385] border border-[#2C241E]">
              <div className="rounded-[18px] bg-[#1B1816] p-6 sm:p-10 text-center border border-black text-[#EDE6DA]">
                <RetroTvFrame
                  defaultTestPattern
                  channelLabel={`CH 03 • ${monthName.slice(0, 3).toUpperCase()} ${selectedYear}`}
                />
                <p className="font-serif text-xl text-[#F5EFE6] font-medium mt-2">
                  No game tuned in for this month
                </p>
                <p className="text-xs sm:text-sm text-[#B7AEA0] mt-1">
                  Paste a gameplay trailer or Steam link above to tune the TV for {monthName} {selectedYear}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
