'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { CategorySlug, MonthData } from '@/types/database';

interface MonthlyShowcaseSliderProps {
  year: number;
  month: number;
  monthName: string;
  onClose?: () => void;
}

const SECTIONS: { slug: CategorySlug; label: string; code: string }[] = [
  { slug: 'movie', label: 'CINEMA', code: '01' },
  { slug: 'game', label: 'TELEVISION', code: '02' },
  { slug: 'food', label: 'GASTRONOMIE', code: '03' },
  { slug: 'memory', label: 'ARCHIVE', code: '04' },
  { slug: 'music', label: 'SONORITÉ', code: '05' },
];

export default function MonthlyShowcaseSlider({
  year,
  month,
  monthName,
  onClose,
}: MonthlyShowcaseSliderProps) {
  const router = useRouter();
  const { getPerspectiveMonth, theme } = useApp();
  const isDark = theme === 'dark';

  const [activeIndex, setActiveIndex] = useState(0);
  const lastWheelTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  const hisData = getPerspectiveMonth('his', year, month);
  const herData = getPerspectiveMonth('her', year, month);
  const monthId = `${year}-${String(month).padStart(2, '0')}`;
  const shortDate = `${monthName.slice(0, 3).toUpperCase()} ${year}`;

  const stepNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SECTIONS.length);
  }, []);

  const stepPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SECTIONS.length) % SECTIONS.length);
  }, []);

  // Keyboard Up / Down arrow keys + Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        stepNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        stepPrev();
      } else if (e.key === 'Escape') {
        if (onClose) {
          onClose();
        } else {
          router.push('/');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepNext, stepPrev, onClose, router]);

  // Mouse wheel / trackpad vertical scroll
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 620) return;
    if (Math.abs(e.deltaY) < 20) return;
    lastWheelTimeRef.current = now;
    if (e.deltaY > 0) {
      stepNext();
    } else {
      stepPrev();
    }
  };

  // Touch swipe up / down for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const diff = touchStartYRef.current - endY;
    touchStartYRef.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) {
      stepNext();
    } else {
      stepPrev();
    }
  };

  // Circular vertical offset (-2, -1, 0, +1, +2)
  const getCircularOffset = (index: number) => {
    const total = SECTIONS.length;
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  // Dynamic background colors blending His (left) and Hers (right) + active category theme
  const activeSlug = SECTIONS[activeIndex].slug;
  const getScenePalette = () => {
    if (activeSlug === 'movie') {
      const left = hisData.movieLog?.canvasColor || (isDark ? '#141210' : '#DFDBD2');
      const right = herData.movieLog?.canvasColor || (isDark ? '#181412' : '#E5E1D8');
      return {
        left: isDark ? '#12100E' : left,
        right: isDark ? '#161311' : right,
        base: isDark ? '#12100E' : '#E2DED5',
        ink: isDark ? '#F1ECE2' : '#1E1B18',
      };
    }
    if (activeSlug === 'game') {
      return {
        left: '#26170E',
        right: '#1E120B',
        base: '#22140C',
        ink: '#EFE6D5',
      };
    }
    if (activeSlug === 'food') {
      return {
        left: '#2A1815',
        right: '#221310',
        base: '#261613',
        ink: '#F5EFE4',
      };
    }
    if (activeSlug === 'memory') {
      return {
        left: isDark ? '#11100E' : '#E3DFD7',
        right: isDark ? '#151310' : '#EAE6DE',
        base: isDark ? '#12100E' : '#E6E2DA',
        ink: isDark ? '#F1ECE2' : '#1E1B18',
      };
    }
    // music
    const hisSongBg = hisData.musicSong?.canvasColor || (isDark ? '#1B1318' : '#EFE8E1');
    const herSongBg = herData.musicSong?.canvasColor || (isDark ? '#21151C' : '#F3EAE6');
    return {
      left: hisSongBg,
      right: herSongBg,
      base: isDark ? '#181115' : '#F1EAE4',
      ink: isDark ? '#F3E8EB' : '#2E211E',
    };
  };

  const scene = getScenePalette();

  // Render a pure, minimal, button-free card for a single side ('his' or 'her')
  const renderPureCard = (side: 'his' | 'her', data: MonthData, slug: CategorySlug) => {
    const ownerTag = side === 'his' ? 'HIS · GOOGLE' : 'HERS · NAMI';

    // 1. MOVIE — Pure Minimalist Print Card
    if (slug === 'movie') {
      const movie = data.movieLog;
      const hasMovie = Boolean(movie?.url);
      const image = movie?.stillUrl || movie?.thumbnailUrl;
      const rating = (movie?.rating ?? 9.5).toFixed(1);
      const paperBg = isDark ? '#171411' : '#ECE9E2';
      const ink = isDark ? '#F1ECE2' : '#1E1B18';
      const muted = isDark ? '#8F877C' : '#7A756F';
      const rule = isDark ? 'rgba(241,236,226,0.14)' : 'rgba(30,27,24,0.14)';

      return (
        <div
          className="w-full h-full rounded-md p-6 sm:p-8 flex flex-col justify-between transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: '0 30px 70px -20px rgba(0,0,0,0.45)',
          }}
        >
          <div>
            <div
              className="flex items-center justify-between pb-2.5 mb-4 border-b font-mono text-[10px] tracking-[0.22em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span>{ownerTag}</span>
              <span>01 · FILM PRINT · {shortDate}</span>
            </div>

            <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative">
              {hasMovie && image ? (
                <img src={image} alt={movie?.title || 'Film'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasMovie ? 'FILM ARCHIVED' : 'UNEXPOSED REEL'}
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl tracking-tight leading-[0.95] truncate">
                {hasMovie ? movie?.title || 'UNTITLED FILM' : 'NO SCREENING'}
                {hasMovie && movie?.year && (
                  <span className="font-poster font-normal text-lg ml-2 opacity-60">
                    {movie.year}
                  </span>
                )}
              </h3>
            </div>

            <div className="mt-4 space-y-1 font-poster text-xs sm:text-sm tracking-wide">
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase" style={{ color: muted }}>directed by</span>
                <span className="uppercase truncate">{hasMovie ? movie?.director || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase" style={{ color: muted }}>genre</span>
                <span className="uppercase truncate">{hasMovie ? movie?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase" style={{ color: muted }}>rated</span>
                <span className="uppercase">{hasMovie ? `${rating} / 10` : '—'}</span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 border-t flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span className="truncate italic font-serif normal-case tracking-normal text-xs">
              {hasMovie && movie?.reason ? `“${movie.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 2. GAME — Pure Minimalist 1970s Walnut & Brushed Silver Card
    if (slug === 'game') {
      const game = data.gameLog;
      const hasGame = Boolean(game?.url);
      const image = game?.thumbnailUrl || game?.url;
      const rating = (game?.rating ?? 9.5).toFixed(1);

      return (
        <div
          className="w-full h-full rounded-md p-6 sm:p-8 flex flex-col justify-between"
          style={{
            backgroundColor: '#E6DFD3',
            color: '#23170F',
            border: '6px solid #3D2212',
            boxShadow: '0 30px 70px -20px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(61,34,18,0.25)',
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-[#C7BCAE] font-mono text-[10px] tracking-[0.22em] uppercase text-[#6E563B]">
              <span>{ownerTag}</span>
              <span>02 · CH 03 TELEVISION · {shortDate}</span>
            </div>

            <div className="w-full aspect-[16/10] rounded-xl bg-[#141210] p-2 border border-[#7E7464] relative overflow-hidden">
              <div className="w-full h-full rounded-lg overflow-hidden relative bg-black">
                {hasGame && image ? (
                  <img src={image} alt={game?.title || 'Game'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                    {hasGame ? 'CH 03 ACTIVE' : 'NO SIGNAL'}
                  </div>
                )}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)',
                  }}
                />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl tracking-tight leading-[0.95] truncate">
                {hasGame ? game?.title || 'UNTITLED GAME' : 'STANDBY'}
              </h3>
            </div>

            <div className="mt-4 space-y-1 font-poster text-xs sm:text-sm tracking-wide">
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase text-[#7A6A58]">studio</span>
                <span className="uppercase truncate">{hasGame ? game?.developer || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase text-[#7A6A58]">genre</span>
                <span className="uppercase truncate">{hasGame ? game?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase text-[#7A6A58]">signal · vu</span>
                <span className="uppercase">{hasGame ? `${rating} / 10.0 dB` : '—'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#C7BCAE] flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-[#6E563B]">
            <span className="truncate italic font-serif normal-case tracking-normal text-xs">
              {hasGame && game?.reason ? `“${game.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 3. FOOD — Pure Minimalist Picture on a Porcelain Plate Card
    if (slug === 'food') {
      const food = data.foodLog;
      const hasFood = Boolean(food?.url);
      const image = food?.thumbnailUrl || food?.url;
      const rating = (food?.rating ?? 9.6).toFixed(1);

      return (
        <div
          className="w-full h-full rounded-md p-6 sm:p-8 flex flex-col justify-between"
          style={{
            backgroundColor: '#F5EFE4',
            color: '#261B17',
            border: '5px solid #3B231E',
            boxShadow: '0 30px 70px -20px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(158,120,64,0.35)',
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#D6C7B0] font-mono text-[10px] tracking-[0.22em] uppercase text-[#7A2828]">
              <span>{ownerTag}</span>
              <span>03 · PLAT DU MOIS · {shortDate}</span>
            </div>

            {/* Pure Sculpted Porcelain Plate */}
            <div className="w-full flex items-center justify-center my-3">
              <div
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center relative"
                style={{
                  background:
                    'radial-gradient(circle at 32% 26%, #FFFFFF 0%, #FCFBF9 40%, #EFE9DC 78%, #D8CEB8 100%)',
                  boxShadow:
                    '0 18px 36px -8px rgba(28, 19, 14, 0.38), inset 0 2px 4px rgba(255,255,255,0.95), inset 0 -4px 10px rgba(145,130,108,0.35)',
                }}
              >
                <div
                  className="absolute inset-3 rounded-full pointer-events-none"
                  style={{ border: '1.5px solid rgba(122, 40, 40, 0.45)' }}
                />
                <div
                  className="absolute inset-4 rounded-full pointer-events-none"
                  style={{ border: '1px solid rgba(180, 138, 78, 0.45)' }}
                />
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center bg-[#EFE9DC] relative"
                  style={{
                    width: '68%',
                    height: '68%',
                    boxShadow: 'inset 0 6px 15px rgba(45, 33, 24, 0.28)',
                    border: '1.5px solid rgba(212, 200, 180, 0.85)',
                  }}
                >
                  {hasFood && image ? (
                    <img src={image} alt={food?.title || 'Dish'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#8C7D6B]">
                      EMPTY PLATE
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl tracking-tight leading-[0.95] truncate">
                {hasFood ? food?.title || 'SIGNATURE DISH' : 'UNSERVED COURSE'}
              </h3>
            </div>

            <div className="mt-3 space-y-1 font-poster text-xs sm:text-sm tracking-wide">
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase text-[#7E6B58]">maison</span>
                <span className="uppercase truncate">{hasFood ? food?.restaurant || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase text-[#7E6B58]">cuisine</span>
                <span className="uppercase truncate">{hasFood ? food?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase text-[#7E6B58]">gastronomie</span>
                <span className="uppercase">{hasFood ? `✦ ${rating} / 10` : '—'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D6C7B0] flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-[#6E5638]">
            <span className="truncate italic font-serif normal-case tracking-normal text-xs">
              {hasFood && food?.reason ? `“${food.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 4. MEMORY — Pure Minimalist Archival Contact Print Card
    if (slug === 'memory') {
      const memory = data.memoryLog;
      const hasMemory = Boolean(memory?.url);
      const image = memory?.thumbnailUrl || memory?.url;
      const rating = (memory?.rating ?? 10.0).toFixed(1);
      const paperBg = isDark ? '#15120F' : '#ECE9E2';
      const ink = isDark ? '#F1ECE2' : '#1E1B18';
      const muted = isDark ? '#8F877C' : '#7A756F';
      const rule = isDark ? 'rgba(241,236,226,0.14)' : 'rgba(30,27,24,0.14)';

      return (
        <div
          className="w-full h-full rounded-md p-6 sm:p-8 flex flex-col justify-between transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: '0 30px 70px -20px rgba(0,0,0,0.45)',
          }}
        >
          <div>
            <div
              className="flex items-center justify-between pb-2.5 mb-4 border-b font-mono text-[10px] tracking-[0.22em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span>{ownerTag}</span>
              <span>04 · 35MM · FRAME 24A ▸</span>
            </div>

            <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative">
              {hasMemory && image ? (
                <img src={image} alt={memory?.title || 'Memory'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasMemory ? 'PRINT ARCHIVED' : 'UNEXPOSED FRAME'}
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl tracking-tight leading-[0.95] truncate">
                {hasMemory ? memory?.title || 'UNTITLED MEMORY' : 'UNEXPOSED FRAME'}
              </h3>
            </div>

            <div className="mt-4 space-y-1 font-poster text-xs sm:text-sm tracking-wide">
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase" style={{ color: muted }}>location</span>
                <span className="uppercase truncate">{hasMemory ? memory?.location || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase" style={{ color: muted }}>mood / vibe</span>
                <span className="uppercase truncate">{hasMemory ? memory?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[92px_1fr]">
                <span className="lowercase" style={{ color: muted }}>core index</span>
                <span className="uppercase">{hasMemory ? `♡ ${rating} / 10` : '—'}</span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 border-t flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span className="truncate italic font-serif normal-case tracking-normal text-xs">
              {hasMemory && memory?.reason ? `“${memory.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 5. MUSIC — Pure Minimalist Sound Print Card
    const song = data.musicSong;
    const hasSong = Boolean(song?.url);
    const image = song?.thumbnailUrl;
    const rating = (song?.rating ?? 9.5).toFixed(1);
    const paperBg = isDark ? '#1B1418' : '#F4EFEA';
    const ink = isDark ? '#F3E8EB' : '#261C1A';
    const muted = isDark ? '#9E8890' : '#7D6E6A';
    const rule = isDark ? 'rgba(243,232,235,0.14)' : 'rgba(38,28,26,0.14)';

    return (
      <div
        className="w-full h-full rounded-md p-6 sm:p-8 flex flex-col justify-between transition-colors duration-700"
        style={{
          backgroundColor: paperBg,
          color: ink,
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.45)',
        }}
      >
        <div>
          <div
            className="flex items-center justify-between pb-2.5 mb-4 border-b font-mono text-[10px] tracking-[0.22em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span>{ownerTag}</span>
            <span>05 · SONORITÉ · {shortDate}</span>
          </div>

          <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative">
            {hasSong && image ? (
              <img src={image} alt={song?.title || 'Song'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                {hasSong ? 'RECORD ARCHIVED' : 'SILENT GROOVE'}
              </div>
            )}
          </div>

          <div className="mt-5">
            <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl tracking-tight leading-[0.95] truncate">
              {hasSong ? song?.title || 'UNTITLED TRACK' : 'NO TRACK'}
            </h3>
          </div>

          <div className="mt-4 space-y-1 font-poster text-xs sm:text-sm tracking-wide">
            <div className="grid grid-cols-[92px_1fr]">
              <span className="lowercase" style={{ color: muted }}>artist</span>
              <span className="uppercase truncate">{hasSong ? song?.artist || '—' : '—'}</span>
            </div>
            <div className="grid grid-cols-[92px_1fr]">
              <span className="lowercase" style={{ color: muted }}>genre</span>
              <span className="uppercase truncate">{hasSong ? song?.genre || '—' : '—'}</span>
            </div>
            <div className="grid grid-cols-[92px_1fr]">
              <span className="lowercase" style={{ color: muted }}>rated</span>
              <span className="uppercase">{hasSong ? `${rating} / 10` : '—'}</span>
            </div>
          </div>
        </div>

        <div
          className="pt-4 border-t flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ borderColor: rule, color: muted }}
        >
          <span className="truncate italic font-serif normal-case tracking-normal text-xs">
            {hasSong && song?.reason ? `“${song.reason}”` : 'Ever Together ♡'}
          </span>
          <span className="shrink-0 ml-3">{monthId}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 w-screen h-screen overflow-hidden select-none transition-colors duration-1000"
      style={{
        backgroundColor: scene.base,
        backgroundImage: `linear-gradient(90deg, ${scene.left} 0%, ${scene.base} 50%, ${scene.right} 100%)`,
        color: scene.ink,
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top & Bottom Atmospheric Depth Fade Vignettes */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-32 sm:h-44 z-30 transition-all duration-1000"
        style={{
          background: `linear-gradient(180deg, ${scene.base} 0%, ${scene.base}cc 35%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 sm:h-44 z-30 transition-all duration-1000"
        style={{
          background: `linear-gradient(0deg, ${scene.base} 0%, ${scene.base}cc 35%, transparent 100%)`,
        }}
      />

      {/* Minimal Top-Left & Top-Right Archival Hairline Text (click top-left to exit) */}
      <div className="fixed inset-x-0 top-5 sm:top-7 px-6 sm:px-12 z-40 flex items-center justify-between font-mono text-[10px] tracking-[0.28em] uppercase opacity-55">
        <button
          type="button"
          onClick={() => (onClose ? onClose() : router.push('/'))}
          className="hover:opacity-100 transition-opacity cursor-pointer"
        >
          ← {monthName.toUpperCase()} {year}
        </button>
        <span>
          {SECTIONS[activeIndex].code} / 05 · {SECTIONS[activeIndex].label}
        </span>
      </div>

      {/* Full-Screen Vertical 3D Revolving Stage with Depth Fade */}
      <div className="relative w-full h-full flex items-center justify-center [perspective:1800px] px-4 sm:px-10 lg:px-16">
        <div className="relative w-full max-w-6xl h-full flex items-center justify-center [transform-style:preserve-3d]">
          {SECTIONS.map((section, idx) => {
            const offset = getCircularOffset(idx);
            const isCenter = offset === 0;
            const isAdjacent = Math.abs(offset) === 1;

            // Vertical depth positioning: center is crisp, upper/lower recede with scale + blur + fade
            const translateY = offset * 82; // %
            const translateZ = isCenter ? 0 : isAdjacent ? -220 : -420;
            const rotateX = offset * -18; // deg
            const scale = isCenter ? 1 : isAdjacent ? 0.84 : 0.68;
            const opacity = isCenter ? 1 : isAdjacent ? 0.24 : 0;
            const blurPx = isCenter ? 0 : isAdjacent ? 2.5 : 6;
            const zIndex = isCenter ? 25 : isAdjacent ? 15 : 5;

            return (
              <div
                key={section.slug}
                onClick={() => {
                  if (!isCenter) setActiveIndex(idx);
                }}
                className={`w-full absolute transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isCenter ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{
                  transform: `translateY(${translateY}%) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
                  opacity,
                  filter: `blur(${blurPx}px)`,
                  zIndex,
                  pointerEvents: Math.abs(offset) <= 1 ? 'auto' : 'none',
                }}
              >
                {/* Side-by-Side Pure Cards: HIS (Left) & HERS (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch">
                  <div className="h-[460px] sm:h-[540px]">
                    {renderPureCard('his', hisData, section.slug)}
                  </div>
                  <div className="h-[460px] sm:h-[540px]">
                    {renderPureCard('her', herData, section.slug)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
