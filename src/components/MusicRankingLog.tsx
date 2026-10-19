'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MONTH_NAMES } from '@/lib/mock-data';
import { fetchSongMetadata } from '@/lib/media-helper';
import SongBannerWidget from './SongBannerWidget';
import {
  ChevronLeft,
  ChevronRight,
  Music,
  Loader2,
} from 'lucide-react';

export default function MusicRankingLog() {
  const { getMonth, saveMonthSong } = useApp();

  // Month navigation: starts at October 2026 (year 2026, month 10)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  // Form input state - only the link
  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit / Done mode state (default locked: false)
  const [isEditing, setIsEditing] = useState(false);

  const monthId = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthData = getMonth(selectedYear, selectedMonth);
  const monthName = MONTH_NAMES[selectedMonth - 1] || 'Month';

  const isAtStart = selectedYear === 2026 && selectedMonth <= 10;

  // Manual month navigation
  const handlePrevMonth = () => {
    if (isAtStart) return; // Cannot go before Oct 2026
    setIsEditing(false); // Reset edit mode on month switch
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setIsEditing(false); // Reset edit mode on month switch
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleLogSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isSubmitting) return;

    const trimmed = inputUrl.trim();
    try {
      setIsSubmitting(true);
      const metadata = await fetchSongMetadata(trimmed);
      saveMonthSong(monthId, metadata);
      setInputUrl('');
      setIsEditing(false); // Lock it upon successful log
    } catch (err) {
      console.error('Failed to extract song metadata:', err);
      saveMonthSong(monthId, trimmed);
      setInputUrl('');
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSong = monthData.musicSong;
  const hasSong = Boolean(currentSong?.url);
  const canvasBg = currentSong?.canvasColor || '#231826';

  return (
    <div className="max-w-3xl mx-auto py-2 px-2 space-y-6 relative">
      {/* Dynamic Main Page Background that changes solid color according to the song */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 -z-30"
        style={{
          backgroundColor: hasSong ? canvasBg : '#FDFBF7',
        }}
      />

      {/* 1. Floating long circular tab for month changing */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto px-6 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-cream-200 text-stone-800 transition-all">
        <button
          onClick={handlePrevMonth}
          disabled={isAtStart}
          className="p-1.5 rounded-full hover:bg-cream-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-stone-600 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-serif text-lg sm:text-xl font-medium tracking-wide text-wine-900 select-none">
          {monthName} {selectedYear}
        </span>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-full hover:bg-cream-100 transition-colors text-stone-600 cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Floating bar with input tube and log button:
             Invisible when a song is logged for full immersion, visible during editing or when no song is logged */}
      {(!hasSong || isEditing) && (
        <form
          onSubmit={handleLogSong}
          className="w-full max-w-2xl mx-auto rounded-full bg-white/95 backdrop-blur-md shadow-md border border-cream-200 p-1.5 sm:p-2 flex items-center gap-2 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-wine-300 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              hasSong
                ? 'Replace song with a new Spotify or YouTube link...'
                : 'Paste Spotify or YouTube song link...'
            }
            disabled={isSubmitting}
            className="flex-1 bg-transparent px-4 sm:px-6 py-2.5 text-sm sm:text-base text-stone-800 placeholder-stone-400 outline-none rounded-full disabled:opacity-50"
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
                <span>Logging...</span>
              </>
            ) : (
              <span>{hasSong ? 'Update Song' : 'Log Song'}</span>
            )}
          </button>
        </form>
      )}

      {/* 3. Song space: Big Song Banner Widget or Empty State */}
      <div className="pt-2">
        {hasSong && currentSong ? (
          <SongBannerWidget
            song={currentSong}
            monthId={monthId}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
          />
        ) : (
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/70 backdrop-blur-sm border border-cream-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center text-stone-400">
              <Music className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="font-serif text-xl text-stone-600 font-medium">
              You have not logged a song
            </p>
            <p className="text-xs sm:text-sm text-stone-400 mt-1.5">
              Paste a link above to log your song for {monthName} {selectedYear}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
