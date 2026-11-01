'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MONTH_NAMES, getThailandNow } from '@/lib/mock-data';
import { fetchMovieMetadata } from '@/lib/media-helper';
import MovieBannerWidget from './MovieBannerWidget';
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Loader2,
} from 'lucide-react';

export default function MovieRankingLog() {
  const { getMonth, saveMonthMovie, theme } = useApp();

  // Month navigation: defaults to current Thailand time (Asia/Bangkok)
  const [selectedYear, setSelectedYear] = useState<number>(() => getThailandNow().year);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => getThailandNow().month);

  // Form input state
  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit / Done mode state (default locked: false)
  const [isEditing, setIsEditing] = useState(false);

  // "Dim the Lights" theatre screening mode
  const [isDimmed, setIsDimmed] = useState(false);

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

  const handleLogMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isSubmitting) return;

    const trimmed = inputUrl.trim();
    try {
      setIsSubmitting(true);
      const metadata = await fetchMovieMetadata(trimmed);
      saveMonthMovie(monthId, metadata);
      setInputUrl('');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to extract movie metadata:', err);
      saveMonthMovie(monthId, trimmed);
      setInputUrl('');
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMovie = monthData.movieLog;
  const hasMovie = Boolean(currentMovie?.url);
  const canvasBg = currentMovie?.canvasColor || '#1E162B';
  const defaultPageBg = theme === 'dark' ? '#140F12' : '#FDFBF7';

  return (
    <div className="max-w-3xl mx-auto py-2 px-2 space-y-6 relative">
      {/* Dynamic Main Page Background (shifts to cinema-black when Dim Lights mode is active) */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-700 -z-30"
        style={{
          backgroundColor: isDimmed
            ? '#040306'
            : hasMovie
            ? canvasBg
            : defaultPageBg,
        }}
      />

      {/* 1. Floating circular tab for month changing */}
      <div
        className={`flex items-center justify-between w-full max-w-md mx-auto px-6 py-3 rounded-full bg-white/95 dark:bg-[#22181E]/95 backdrop-blur-md shadow-md border border-cream-200 dark:border-[#3A2832] text-stone-800 dark:text-rose-100 transition-all duration-500 ${
          isDimmed ? 'opacity-35 hover:opacity-100' : 'opacity-100'
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

      {/* 2. Floating bar with input tube and log button:
             Invisible when a movie is logged for full immersion, visible during editing or when no movie is logged */}
      {(!hasMovie || isEditing) && (
        <form
          onSubmit={handleLogMovie}
          className="w-full max-w-2xl mx-auto rounded-full bg-white/95 dark:bg-[#22181E]/95 backdrop-blur-md shadow-md border border-cream-200 dark:border-[#3A2832] p-1.5 sm:p-2 flex items-center gap-2 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-wine-300 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              hasMovie
                ? 'Replace movie with a new YouTube trailer, Letterboxd, or IMDb link...'
                : 'Paste YouTube trailer, Letterboxd, or IMDb link...'
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
                <span>Logging...</span>
              </>
            ) : (
              <span>{hasMovie ? 'Update Film' : 'Log Movie'}</span>
            )}
          </button>
        </form>
      )}

      {/* 3. Movie space: MovieBannerWidget or Empty State */}
      <div className="pt-2">
        {hasMovie && currentMovie ? (
          <MovieBannerWidget
            movie={currentMovie}
            monthId={monthId}
            monthName={monthName}
            year={selectedYear}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            isDimmed={isDimmed}
            onToggleDim={() => setIsDimmed(!isDimmed)}
          />
        ) : (
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/70 dark:bg-[#1E151A]/75 backdrop-blur-sm border border-cream-200/80 dark:border-[#382630] p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-400">
              <Film className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="font-serif text-xl text-stone-600 dark:text-rose-100 font-medium">
              No movie logged for this month yet
            </p>
            <p className="text-xs sm:text-sm text-stone-400 dark:text-stone-400 mt-1.5">
              Paste a YouTube trailer, Letterboxd, or IMDb link above to set your screening for {monthName} {selectedYear}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
