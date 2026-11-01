'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { MONTH_NAMES, getThailandNow } from '@/lib/mock-data';
import MonthlyShowcaseSlider from './MonthlyShowcaseSlider';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function MonthlyCalendar() {
  const { months, activePerspective, setActivePerspective } = useApp();
  const thailandNow = getThailandNow();
  const [selectedYear, setSelectedYear] = useState<number>(() => thailandNow.year);
  const [activeShowcaseMonth, setActiveShowcaseMonth] = useState<number | null>(null);

  // Check which months have data
  const getMonthData = (monthNumber: number) => {
    const id = `${selectedYear}-${String(monthNumber).padStart(2, '0')}`;
    return months.find((m) => m.id === id);
  };

  // If year is 2026, calendar starts at October (months 10, 11, 12)
  // For subsequent years (e.g. 2027+), it shows all 12 months
  const monthsToShow =
    selectedYear === 2026
      ? [
          { number: 10, name: 'October' },
          { number: 11, name: 'November' },
          { number: 12, name: 'December' },
        ]
      : MONTH_NAMES.map((name, idx) => ({
          number: idx + 1,
          name,
        }));

  const handleMonthClick = (monthNum: number) => {
    setActiveShowcaseMonth((prev) => (prev === monthNum ? null : monthNum));
  };

  return (
    <div className="scrapbook-card p-6 sm:p-8 space-y-6">
      {/* Calendar Header with His/Hers Switcher & Year Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 dark:border-[#382630] pb-5">
        <div>
          <div className="flex items-center gap-2 text-wine-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Monthly Archives Calendar</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-wine-800 dark:text-rose-200">
            Monthly Calendar
          </h2>
          <p className="text-xs text-warmText-light dark:text-[#A7929A] mt-0.5">
            Click any month to open the revolving 5-section showcase for His &amp; Hers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Quick His / Hers Switcher on Calendar Header */}
          <div className="inline-flex items-center p-1 rounded-full bg-cream-100 dark:bg-[#281C22] border border-cream-300 dark:border-[#442E39]">
            <button
              type="button"
              onClick={() => setActivePerspective('his')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePerspective === 'his'
                  ? 'bg-wine-700 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-rose-200/70 hover:text-wine-800 dark:hover:text-rose-100'
              }`}
            >
              <span>🧸</span>
              <span>His</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePerspective('her')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePerspective === 'her'
                  ? 'bg-wine-700 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-rose-200/70 hover:text-wine-800 dark:hover:text-rose-100'
              }`}
            >
              <span>🐶</span>
              <span>Hers</span>
            </button>
          </div>

          {/* Year Selector: Arrows going back and forth with year in the middle */}
          <div className="flex items-center gap-2 bg-cream-100 dark:bg-[#281C22] p-1.5 rounded-full border border-cream-300 dark:border-[#442E39]">
            <button
              onClick={() => {
                setSelectedYear((prev) => Math.max(2026, prev - 1));
                setActiveShowcaseMonth(null);
              }}
              disabled={selectedYear <= 2026}
              className={`p-1.5 rounded-full transition-colors ${
                selectedYear <= 2026
                  ? 'text-warmText-light/40 dark:text-warmText-light/30 cursor-not-allowed'
                  : 'text-warmText-body dark:text-rose-200 hover:bg-white dark:hover:bg-[#382730] hover:text-wine-700 shadow-2xs cursor-pointer'
              }`}
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-serif font-bold text-sm sm:text-base text-wine-800 dark:text-rose-200 px-3 min-w-[54px] text-center">
              {selectedYear}
            </span>

            <button
              onClick={() => {
                setSelectedYear((prev) => prev + 1);
                setActiveShowcaseMonth(null);
              }}
              className="p-1.5 rounded-full text-warmText-body dark:text-rose-200 hover:bg-white dark:hover:bg-[#382730] hover:text-wine-700 transition-colors shadow-2xs cursor-pointer"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Months (starts at October for 2026) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {monthsToShow.map(({ number: monthNum, name }) => {
          const monthData = getMonthData(monthNum);
          const isCurrent =
            selectedYear === thailandNow.year && monthNum === thailandNow.month;
          const isPast =
            selectedYear < thailandNow.year ||
            (selectedYear === thailandNow.year && monthNum < thailandNow.month);
          const isSelected = activeShowcaseMonth === monthNum;

          const loggedCount = monthData
            ? [
                monthData.movieLog?.url,
                monthData.gameLog?.url,
                monthData.foodLog?.url,
                monthData.memoryLog?.url,
                monthData.musicSong?.url,
              ].filter(Boolean).length
            : 0;

          const hasPicks = Boolean(
            loggedCount > 0 ||
              (monthData &&
                Object.values(monthData.categories).some(
                  (cat) => cat.google?.title || cat.nami?.title
                ))
          );

          return (
            <button
              key={monthNum}
              type="button"
              onClick={() => handleMonthClick(monthNum)}
              className={`group relative p-4 rounded-2xl border text-left flex flex-col justify-between min-h-[116px] transition-all select-none cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-wine-100/90 via-white to-rose-100/80 border-wine-500 shadow-md ring-2 ring-wine-500/50 dark:from-[#3A1E2C] dark:via-[#281620] dark:to-[#1E1118] dark:border-rose-500 dark:ring-rose-500/50 -translate-y-0.5'
                  : isCurrent
                  ? 'bg-gradient-to-br from-wine-50/80 via-white to-rose-50/60 border-wine-300 shadow-sm ring-1 ring-wine-400/40 hover:border-wine-500 hover:-translate-y-0.5 dark:from-[#2E1823] dark:via-[#22141C] dark:to-[#1B1016] dark:border-rose-800/80 dark:ring-rose-700/50'
                  : hasPicks
                  ? 'bg-white dark:bg-[#1E151A] border-cream-300 dark:border-[#382630] hover:border-wine-300 dark:hover:border-rose-700 hover:-translate-y-0.5 hover:shadow-sm'
                  : 'bg-cream-100/40 dark:bg-[#181115]/50 border-cream-200/80 dark:border-[#2D1E25] text-warmText-light dark:text-[#8C7A82] hover:border-cream-300 dark:hover:border-[#3D2932] hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-warmText-light/80 dark:text-[#8C7A82]">
                    {String(monthNum).padStart(2, '0')} •{' '}
                    {activePerspective === 'his' ? '🧸 HIS' : '🐶 HERS'}
                  </span>
                  {isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-wine-600 dark:bg-rose-400 animate-pulse" />
                  ) : hasPicks || isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-cream-400 dark:text-[#523A45]" />
                  )}
                </div>

                <h3
                  className={`font-serif text-lg font-bold leading-tight ${
                    isSelected || isCurrent
                      ? 'text-wine-800 dark:text-rose-200'
                      : hasPicks || isPast
                      ? 'text-warmText-heading dark:text-[#F3E8EB]'
                      : 'text-warmText-light dark:text-[#8C7A82]'
                  }`}
                >
                  {name} {selectedYear}
                </h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-cream-200/60 dark:border-[#33222B] flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${
                    isSelected
                      ? 'text-wine-700 dark:text-rose-300 font-semibold'
                      : isCurrent
                      ? 'text-wine-600 dark:text-rose-400 font-semibold'
                      : hasPicks
                      ? 'text-sage-700 dark:text-emerald-400'
                      : 'text-warmText-light/70 dark:text-[#7A6A72]'
                  }`}
                >
                  {isSelected
                    ? 'Showing Showcase ▾'
                    : isCurrent
                    ? 'Current Month'
                    : hasPicks
                    ? `${loggedCount}/5 Logged`
                    : isPast
                    ? 'Past Month'
                    : 'Upcoming'}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-wine-600 dark:text-rose-300 opacity-75 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3 h-3" />
                  <span>{isSelected ? 'Hide' : 'Showcase'}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Smooth Revolving 5-Section Showcase Slider when a Month is Clicked */}
      {activeShowcaseMonth !== null && (
        <MonthlyShowcaseSlider
          year={selectedYear}
          month={activeShowcaseMonth}
          monthName={MONTH_NAMES[activeShowcaseMonth - 1] || 'Month'}
          onClose={() => setActiveShowcaseMonth(null)}
        />
      )}
    </div>
  );
}
