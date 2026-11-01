'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MonthlyShowcaseSlider from '@/components/MonthlyShowcaseSlider';
import { MONTH_NAMES, getThailandNow } from '@/lib/mock-data';

function ShowcasePageContent() {
  const searchParams = useSearchParams();
  const thailandNow = getThailandNow();

  const paramYear = parseInt(searchParams.get('year') || '', 10);
  const paramMonth = parseInt(searchParams.get('month') || '', 10);

  const selectedYear = !isNaN(paramYear) && paramYear >= 2026 ? paramYear : thailandNow.year;
  const selectedMonth =
    !isNaN(paramMonth) && paramMonth >= 1 && paramMonth <= 12
      ? paramMonth
      : thailandNow.month;

  const monthName = MONTH_NAMES[selectedMonth - 1] || 'November';

  return (
    <MonthlyShowcaseSlider
      year={selectedYear}
      month={selectedMonth}
      monthName={monthName}
    />
  );
}

export default function ShowcasePage() {
  return (
    <Suspense fallback={null}>
      <ShowcasePageContent />
    </Suspense>
  );
}
