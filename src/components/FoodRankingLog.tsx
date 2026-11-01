'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MONTH_NAMES, getThailandNow } from '@/lib/mock-data';
import { fetchFoodMetadata } from '@/lib/media-helper';
import FoodBannerWidget from './FoodBannerWidget';
import PorcelainPlateFrame from './PorcelainPlateFrame';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function FoodRankingLog() {
  const { getMonth, saveMonthFood, theme } = useApp();

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
  const bistroTableBg = theme === 'dark' ? '#19110E' : '#261814';

  return (
    <div className="max-w-3xl mx-auto py-2 px-2 space-y-6 relative">
      {/* Rich Mahogany Bistro Tablecloth Ambient Page Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 -z-30"
        style={{
          backgroundColor: bistroTableBg,
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(122, 40, 40, 0.16) 0%, rgba(20, 12, 9, 0.45) 100%)',
        }}
      />

      {/* 1. Vintage Bistro Menu Month Selector Pill */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto px-6 py-3 rounded-full bg-[#F5EFE4] shadow-lg border-2 border-[#8C6C3E]/60 text-[#261B17] transition-all">
        <button
          onClick={handlePrevMonth}
          disabled={isAtStart}
          className="p-1.5 rounded-full hover:bg-[#E5DAC6] disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-[#5C4328] cursor-pointer disabled:cursor-not-allowed"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center select-none">
          <span className="text-[9px] font-mono uppercase tracking-[0.26em] text-[#7A2828]">
            CARTE DU MOIS
          </span>
          <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#261B17]">
            {monthName} {selectedYear}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-full hover:bg-[#E5DAC6] transition-colors text-[#5C4328] cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Floating Dish Plating Input Bar (hidden when locked for immersion) */}
      {(!hasFood || isEditing) && (
        <form
          onSubmit={handleLogFood}
          className="w-full max-w-2xl mx-auto rounded-full bg-[#F5EFE4] shadow-lg border-2 border-[#8C6C3E]/60 p-1.5 sm:p-2 flex items-center gap-2 transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-[#7A2828]/50 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              hasFood
                ? 'Serve a new dish photo URL, video link, or restaurant URL onto the plate...'
                : 'Paste dish photo URL, video link, or restaurant URL to plate...'
            }
            disabled={isSubmitting}
            className="flex-1 bg-transparent px-4 sm:px-6 py-2.5 text-sm sm:text-base text-[#261B17] placeholder-[#8C7A68] outline-none rounded-full disabled:opacity-50 font-serif"
            required
          />
          <button
            type="submit"
            disabled={!inputUrl.trim() || isSubmitting}
            className="px-6 sm:px-7 py-2.5 bg-[#7A2828] hover:bg-[#5E1D1D] active:scale-95 text-[#FAF6EE] rounded-full font-mono uppercase tracking-wider text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm whitespace-nowrap cursor-pointer flex items-center gap-2 border border-[#9E7840]/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Plating...</span>
              </>
            ) : (
              <span>{hasFood ? 'Re-Plate Dish' : 'Serve on Plate'}</span>
            )}
          </button>
        </form>
      )}

      {/* 3. Plated Food Widget or Empty Porcelain Plate Table Setting */}
      <div className="pt-1">
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
          <div
            className="w-full max-w-2xl sm:max-w-3xl mx-auto rounded-3xl p-7 sm:p-10 text-center shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: '#F5EFE4',
              border: '6px solid #3B231E',
              boxShadow:
                '0 30px 70px -15px rgba(20, 12, 9, 0.65), inset 0 0 0 2px rgba(158, 120, 64, 0.45)',
            }}
          >
            {/* Inner Bistro Menu Double Frame Border */}
            <div
              className="absolute inset-3 sm:inset-4 rounded-2xl pointer-events-none"
              style={{
                border: '1px solid rgba(110, 34, 38, 0.25)',
                boxShadow: 'inset 0 0 0 3px rgba(245, 239, 228, 1), inset 0 0 0 4px rgba(158, 120, 64, 0.3)',
              }}
            />

            <div className="relative z-10 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#7A2828]">
                ✦ MAISON DE DEUX • TABLE N° 02 ✦
              </p>

              <PorcelainPlateFrame
                emptyState
                restaurant="MAISON DE DEUX"
                monthLabel={`${monthName.toUpperCase()} ${selectedYear} • TABLE N° 02`}
              />

              <div className="pt-2 space-y-1">
                <p className="font-serif text-xl sm:text-2xl text-[#261B17] font-bold">
                  An Empty Porcelain Plate Awaits
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-[#6E5638]">
                  Paste a dish photo URL or restaurant link above to serve {monthName} {selectedYear}’s featured meal.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
