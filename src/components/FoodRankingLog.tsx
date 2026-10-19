'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MONTH_NAMES } from '@/lib/mock-data';
import { fetchFoodMetadata } from '@/lib/media-helper';
import FoodBannerWidget from './FoodBannerWidget';
import {
  ChevronLeft,
  ChevronRight,
  Utensils,
  Loader2,
} from 'lucide-react';

export default function FoodRankingLog() {
  const { getMonth, saveMonthFood, theme } = useApp();

  // Month navigation: starts at October 2026 (year 2026, month 10)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

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

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isSubmitting) return;

    const trimmed = inputUrl.trim();
    try {
      setIsSubmitting(true);
      const metadata = await fetchFoodMetadata(trimmed);
      saveMonthFood(monthId, metadata);
      setInputUrl('');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to extract food metadata:', err);
      saveMonthFood(monthId, trimmed);
      setInputUrl('');
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFood = monthData.foodLog;
  const hasFood = Boolean(currentFood?.url);
  const canvasBg = currentFood?.canvasColor || '#2B1B17';
  const defaultPageBg = theme === 'dark' ? '#140F12' : '#FDFBF7';

  return (
    <div className="max-w-3xl mx-auto py-2 px-2 space-y-6 relative">
      {/* Dynamic Main Page Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 -z-30"
        style={{
          backgroundColor: hasFood ? canvasBg : defaultPageBg,
        }}
      />

      {/* 1. Floating circular tab for month changing */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto px-6 py-3 rounded-full bg-white/95 dark:bg-[#22181E]/95 backdrop-blur-md shadow-md border border-cream-200 dark:border-[#3A2832] text-stone-800 dark:text-rose-100 transition-all">
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
      {(!hasFood || isEditing) && (
        <form
          onSubmit={handleLogFood}
          className="w-full max-w-2xl mx-auto rounded-full bg-white/95 dark:bg-[#22181E]/95 backdrop-blur-md shadow-md border border-cream-200 dark:border-[#3A2832] p-1.5 sm:p-2 flex items-center gap-2 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-wine-300 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              hasFood
                ? 'Replace dish with a new photo link, video, or restaurant URL...'
                : 'Paste dish photo URL, video link, or restaurant URL...'
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
                <span>Plating...</span>
              </>
            ) : (
              <span>{hasFood ? 'Update Dish' : 'Log Dish'}</span>
            )}
          </button>
        </form>
      )}

      {/* 3. Food Widget or Empty State */}
      <div className="pt-2">
        {hasFood && currentFood ? (
          <FoodBannerWidget
            food={currentFood}
            monthId={monthId}
            monthName={monthName}
            year={selectedYear}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
          />
        ) : (
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/70 dark:bg-[#1E151A]/75 backdrop-blur-sm border border-cream-200/80 dark:border-[#382630] p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-500">
              <Utensils className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="font-serif text-xl text-stone-600 dark:text-rose-100 font-medium">
              Table #2 is waiting for this month’s dish
            </p>
            <p className="text-xs sm:text-sm text-stone-400 mt-1.5">
              Paste a dish photo URL or restaurant link above for {monthName} {selectedYear}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
