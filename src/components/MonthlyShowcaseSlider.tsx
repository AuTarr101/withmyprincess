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

const CYLINDER_RADIUS = 560; // px radius for smooth 3D carousel cylinder

export default function MonthlyShowcaseSlider({
  year,
  month,
  monthName,
  onClose,
}: MonthlyShowcaseSliderProps) {
  const router = useRouter();
  const { getPerspectiveMonth, theme } = useApp();
  const isDark = theme === 'dark';

  // Continuous wheel angle in degrees (steps by -72 / +72)
  const [wheelRotation, setWheelRotation] = useState(0);
  const [dragOffsetAngle, setDragOffsetAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mobilePerspective, setMobilePerspective] = useState<'his' | 'her'>('his');

  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const wheelAccumulatorRef = useRef(0);
  const wheelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pointer drag tracking (mouse & touch)
  const pointerStartYRef = useRef<number | null>(null);
  const pointerStartXRef = useRef<number | null>(null);
  const pointerDeltaYRef = useRef<number>(0);
  const pointerDeltaXRef = useRef<number>(0);
  const isPointerDownRef = useRef(false);

  const hisData = getPerspectiveMonth('his', year, month);
  const herData = getPerspectiveMonth('her', year, month);
  const monthId = `${year}-${String(month).padStart(2, '0')}`;
  const shortDate = `${monthName.slice(0, 3).toUpperCase()} ${year}`;

  // Normalized active index (0..4)
  const effectiveRotation = wheelRotation + dragOffsetAngle;
  const activeIndex =
    ((Math.round(-effectiveRotation / 72) % SECTIONS.length) + SECTIONS.length) %
    SECTIONS.length;

  const stepNext = useCallback(() => {
    setWheelRotation((prev) => prev - 72);
  }, []);

  const stepPrev = useCallback(() => {
    setWheelRotation((prev) => prev + 72);
  }, []);

  const goToSection = useCallback((targetIdx: number) => {
    setWheelRotation((prev) => {
      const currentIdx = ((Math.round(-prev / 72) % 5) + 5) % 5;
      let diff = targetIdx - currentIdx;
      if (diff > 2) diff -= 5;
      if (diff < -2) diff += 5;
      return prev - diff * 72;
    });
  }, []);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  }, [onClose, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        stepNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        stepPrev();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setMobilePerspective('his');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setMobilePerspective('her');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepNext, stepPrev, handleClose]);

  // Native non-passive Wheel listener (stops browser bounce / gestures and inertia runaway)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimatingRef.current) return;

      wheelAccumulatorRef.current += e.deltaY;

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 160);

      const THRESHOLD = 35;
      if (Math.abs(wheelAccumulatorRef.current) >= THRESHOLD) {
        if (wheelAccumulatorRef.current > 0) {
          stepNext();
        } else {
          stepPrev();
        }
        wheelAccumulatorRef.current = 0;
        isAnimatingRef.current = true;
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 500);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [stepNext, stepPrev]);

  // Pointer drag events for interactive swiping (touch & mouse)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    pointerStartYRef.current = e.clientY;
    pointerStartXRef.current = e.clientX;
    pointerDeltaYRef.current = 0;
    pointerDeltaXRef.current = 0;
    isPointerDownRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || pointerStartYRef.current === null || pointerStartXRef.current === null)
      return;
    const dy = e.clientY - pointerStartYRef.current;
    const dx = e.clientX - pointerStartXRef.current;
    pointerDeltaYRef.current = dy;
    pointerDeltaXRef.current = dx;

    if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
      if (!isDragging) setIsDragging(true);
      const angle = (dy / CYLINDER_RADIUS) * (180 / Math.PI);
      setDragOffsetAngle(angle);
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const dy = pointerDeltaYRef.current;
    const dx = pointerDeltaXRef.current;

    setIsDragging(false);
    setDragOffsetAngle(0);

    // Horizontal swipe on mobile
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) {
        setMobilePerspective('her');
      } else {
        setMobilePerspective('his');
      }
      return;
    }

    // Vertical swipe
    if (Math.abs(dy) > 45) {
      if (dy < 0) {
        stepNext();
      } else {
        stepPrev();
      }
    }
  };

  // Dynamic scene background palette
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

    // 1. MOVIE
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
          className="w-full h-full rounded-md p-6 sm:p-8 lg:p-9 flex flex-col justify-between transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 30px 80px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 30px 80px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div>
            <div
              className="flex items-center justify-between pb-3 mb-4 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span>{ownerTag}</span>
              <span>01 · FILM PRINT · {shortDate}</span>
            </div>

            <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasMovie && image ? (
                <img src={image} alt={movie?.title || 'Film'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasMovie ? 'FILM ARCHIVED' : 'UNEXPOSED REEL'}
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl lg:text-[40px] tracking-tight leading-[0.95] truncate">
                {hasMovie ? movie?.title || 'UNTITLED FILM' : 'NO SCREENING'}
                {hasMovie && movie?.year && (
                  <span className="font-poster font-normal text-lg sm:text-xl ml-2 opacity-60">
                    {movie.year}
                  </span>
                )}
              </h3>
            </div>

            <div className="mt-4 sm:mt-5 space-y-1.5 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>directed by</span>
                <span className="uppercase truncate">{hasMovie ? movie?.director || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>genre</span>
                <span className="uppercase truncate">{hasMovie ? movie?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>rated</span>
                <span className="uppercase">{hasMovie ? `${rating} / 10` : '—'}</span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span className="truncate italic font-serif normal-case tracking-normal text-xs sm:text-sm">
              {hasMovie && movie?.reason ? `“${movie.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 2. GAME
    if (slug === 'game') {
      const game = data.gameLog;
      const hasGame = Boolean(game?.url);
      const image = game?.stillUrl || game?.thumbnailUrl || game?.url;
      const rating = (game?.rating ?? 9.5).toFixed(1);
      const paperBg = isDark ? '#171411' : '#ECE9E2';
      const ink = isDark ? '#F1ECE2' : '#1E1B18';
      const muted = isDark ? '#8F877C' : '#7A756F';
      const rule = isDark ? 'rgba(241,236,226,0.14)' : 'rgba(30,27,24,0.14)';

      return (
        <div
          className="w-full h-full rounded-md p-6 sm:p-8 lg:p-9 flex flex-col justify-between transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 30px 80px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 30px 80px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div>
            <div
              className="flex items-center justify-between pb-3 mb-4 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span>{ownerTag}</span>
              <span>02 · GAME PRINT · {shortDate}</span>
            </div>

            <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasGame && image ? (
                <img src={image} alt={game?.title || 'Game'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasGame ? 'GAME ARCHIVED' : 'NO CARTRIDGE'}
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl lg:text-[40px] tracking-tight leading-[0.95] truncate">
                {hasGame ? game?.title || 'UNTITLED GAME' : 'STANDBY'}
              </h3>
            </div>

            <div className="mt-4 sm:mt-5 space-y-1.5 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>studio</span>
                <span className="uppercase truncate">{hasGame ? game?.developer || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>genre</span>
                <span className="uppercase truncate">{hasGame ? game?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>rated</span>
                <span className="uppercase">{hasGame ? `${rating} / 10` : '—'}</span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span className="truncate italic font-serif normal-case tracking-normal text-xs sm:text-sm">
              {hasGame && game?.reason ? `“${game.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 3. FOOD
    if (slug === 'food') {
      const food = data.foodLog;
      const hasFood = Boolean(food?.url);
      const image = food?.stillUrl || food?.thumbnailUrl || food?.url;
      const rating = (food?.rating ?? 9.6).toFixed(1);
      const paperBg = isDark ? '#171411' : '#ECE9E2';
      const ink = isDark ? '#F1ECE2' : '#1E1B18';
      const muted = isDark ? '#8F877C' : '#7A756F';
      const rule = isDark ? 'rgba(241,236,226,0.14)' : 'rgba(30,27,24,0.14)';

      return (
        <div
          className="w-full h-full rounded-md p-6 sm:p-8 lg:p-9 flex flex-col justify-between transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 30px 80px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 30px 80px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div>
            <div
              className="flex items-center justify-between pb-3 mb-4 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span>{ownerTag}</span>
              <span>03 · PLAT DU MOIS · {shortDate}</span>
            </div>

            <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasFood && image ? (
                <img src={image} alt={food?.title || 'Dish'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasFood ? 'DISH PLATED' : 'UNSERVED COURSE'}
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl lg:text-[40px] tracking-tight leading-[0.95] truncate">
                {hasFood ? food?.title || 'SIGNATURE DISH' : 'UNSERVED COURSE'}
              </h3>
            </div>

            <div className="mt-4 sm:mt-5 space-y-1.5 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>maison</span>
                <span className="uppercase truncate">{hasFood ? food?.restaurant || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>cuisine</span>
                <span className="uppercase truncate">{hasFood ? food?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>rated</span>
                <span className="uppercase">{hasFood ? `${rating} / 10` : '—'}</span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span className="truncate italic font-serif normal-case tracking-normal text-xs sm:text-sm">
              {hasFood && food?.reason ? `“${food.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 4. MEMORY
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
          className="w-full h-full rounded-md p-6 sm:p-8 lg:p-9 flex flex-col justify-between transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 30px 80px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 30px 80px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div>
            <div
              className="flex items-center justify-between pb-3 mb-4 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span>{ownerTag}</span>
              <span>04 · ARCHIVAL PRINT · {shortDate}</span>
            </div>

            <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasMemory && image ? (
                <img src={image} alt={memory?.title || 'Memory'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasMemory ? 'PRINT ARCHIVED' : 'UNEXPOSED FRAME'}
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6">
              <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl lg:text-[40px] tracking-tight leading-[0.95] truncate">
                {hasMemory ? memory?.title || 'UNTITLED MEMORY' : 'UNEXPOSED FRAME'}
              </h3>
            </div>

            <div className="mt-4 sm:mt-5 space-y-1.5 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>location</span>
                <span className="uppercase truncate">{hasMemory ? memory?.location || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>mood / vibe</span>
                <span className="uppercase truncate">{hasMemory ? memory?.genre || '—' : '—'}</span>
              </div>
              <div className="grid grid-cols-[96px_1fr]">
                <span className="lowercase" style={{ color: muted }}>core index</span>
                <span className="uppercase">{hasMemory ? `${rating} / 10` : '—'}</span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span className="truncate italic font-serif normal-case tracking-normal text-xs sm:text-sm">
              {hasMemory && memory?.reason ? `“${memory.reason}”` : 'Ever Together ♡'}
            </span>
            <span className="shrink-0 ml-3">{monthId}</span>
          </div>
        </div>
      );
    }

    // 5. MUSIC
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
        className="w-full h-full rounded-md p-6 sm:p-8 lg:p-9 flex flex-col justify-between transition-colors duration-700"
        style={{
          backgroundColor: paperBg,
          color: ink,
          boxShadow: isDark
            ? '0 30px 80px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
            : '0 30px 80px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <div
            className="flex items-center justify-between pb-3 mb-4 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span>{ownerTag}</span>
            <span>05 · SONORITÉ · {shortDate}</span>
          </div>

          <div className="w-full aspect-[16/10] bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
            {hasSong && image ? (
              <img src={image} alt={song?.title || 'Song'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                {hasSong ? 'RECORD ARCHIVED' : 'SILENT GROOVE'}
              </div>
            )}
          </div>

          <div className="mt-5 sm:mt-6">
            <h3 className="font-poster font-bold uppercase text-3xl sm:text-4xl lg:text-[40px] tracking-tight leading-[0.95] truncate">
              {hasSong ? song?.title || 'UNTITLED TRACK' : 'NO TRACK'}
            </h3>
          </div>

          <div className="mt-4 sm:mt-5 space-y-1.5 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
            <div className="grid grid-cols-[96px_1fr]">
              <span className="lowercase" style={{ color: muted }}>artist</span>
              <span className="uppercase truncate">{hasSong ? song?.artist || '—' : '—'}</span>
            </div>
            <div className="grid grid-cols-[96px_1fr]">
              <span className="lowercase" style={{ color: muted }}>genre</span>
              <span className="uppercase truncate">{hasSong ? song?.genre || '—' : '—'}</span>
            </div>
            <div className="grid grid-cols-[96px_1fr]">
              <span className="lowercase" style={{ color: muted }}>rated</span>
              <span className="uppercase">{hasSong ? `${rating} / 10` : '—'}</span>
            </div>
          </div>
        </div>

        <div
          className="pt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
          style={{ borderColor: rule, color: muted }}
        >
          <span className="truncate italic font-serif normal-case tracking-normal text-xs sm:text-sm">
            {hasSong && song?.reason ? `“${song.reason}”` : 'Ever Together ♡'}
          </span>
          <span className="shrink-0 ml-3">{monthId}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-screen h-screen overflow-hidden select-none touch-none transition-colors duration-1000"
      style={{
        backgroundColor: scene.base,
        backgroundImage: `linear-gradient(90deg, ${scene.left} 0%, ${scene.base} 50%, ${scene.right} 100%)`,
        color: scene.ink,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Top & Bottom Cinematic Depth Vignettes */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-36 sm:h-48 lg:h-56 z-30 transition-all duration-1000"
        style={{
          background: `linear-gradient(180deg, ${scene.base} 0%, ${scene.base}f2 35%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 h-36 sm:h-48 lg:h-56 z-30 transition-all duration-1000"
        style={{
          background: `linear-gradient(0deg, ${scene.base} 0%, ${scene.base}f2 35%, transparent 100%)`,
        }}
      />

      {/* Top Navigation Bar */}
      <div className="fixed inset-x-0 top-5 sm:top-7 px-6 sm:px-12 z-40 flex items-center justify-between font-mono text-[11px] sm:text-xs tracking-[0.28em] uppercase">
        <button
          type="button"
          onClick={handleClose}
          className="hover:opacity-100 opacity-60 transition-opacity cursor-pointer flex items-center gap-2"
          title="Return to calendar"
        >
          <span>←</span>
          <span>{monthName.toUpperCase()} {year}</span>
        </button>

        {/* Mobile Perspective Toggle (HIS / HERS) */}
        <div className="md:hidden flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase bg-black/25 dark:bg-white/10 backdrop-blur-md rounded-full p-1 border border-black/10 dark:border-white/15">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobilePerspective('his');
            }}
            className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
              mobilePerspective === 'his'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'opacity-60 text-current'
            }`}
          >
            HIS
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobilePerspective('her');
            }}
            className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
              mobilePerspective === 'her'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'opacity-60 text-current'
            }`}
          >
            HERS
          </button>
        </div>

        {/* Active Category Code & Label + Close '✕' */}
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="opacity-60 hidden sm:inline">
            {SECTIONS[activeIndex].code} / 05 · {SECTIONS[activeIndex].label}
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="hover:opacity-100 opacity-60 transition-opacity cursor-pointer font-sans text-base leading-none"
            title="Close showcase (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Right Edge Category Dash Nav (click to navigate directly) */}
      <div className="fixed right-4 sm:right-7 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-2.5">
        {SECTIONS.map((sec, i) => {
          const isSelected = i === activeIndex;
          return (
            <button
              key={sec.slug}
              type="button"
              onClick={() => goToSection(i)}
              className="group flex items-center gap-2 p-1.5 cursor-pointer transition-all"
              title={`${sec.code} · ${sec.label}`}
            >
              <span
                className={`transition-all duration-300 rounded-full ${
                  isSelected
                    ? 'w-6 h-1 bg-current opacity-90'
                    : 'w-2 h-1 bg-current opacity-25 group-hover:opacity-60'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Full-Screen Vertical 3D Revolving Stage */}
      <div className="relative w-full h-full flex items-center justify-center [perspective:1700px] px-4 sm:px-8 lg:px-14">
        {/* Revolving 3D Cylinder Container */}
        <div
          className="relative w-full max-w-[1360px] h-[640px] sm:h-[700px] lg:h-[750px] xl:h-[780px] max-h-[82vh] flex items-center justify-center"
          style={{
            transform: `translateZ(-${CYLINDER_RADIUS}px) rotateX(${effectiveRotation}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 650ms cubic-bezier(0.2, 0.9, 0.28, 1)',
          }}
        >
          {SECTIONS.map((section, idx) => {
            // Relative angle of face idx with respect to the front center camera
            const rawAngle = idx * 72 + effectiveRotation;
            const normalizedAngle = ((((rawAngle % 360) + 540) % 360) - 180);
            const absAngle = Math.abs(normalizedAngle);

            const isCenter = absAngle < 36;
            const isAdjacent = absAngle >= 36 && absAngle < 108;

            const opacity = isCenter ? 1 : isAdjacent ? 0.3 : 0;
            const blurPx = isCenter ? 0 : isAdjacent ? 2 : 6;

            return (
              <div
                key={section.slug}
                onClick={() => {
                  if (!isCenter && isAdjacent) {
                    if (normalizedAngle > 0) stepNext();
                    else stepPrev();
                  }
                }}
                className={`w-full h-full absolute inset-0 [transform-style:preserve-3d] ${
                  isCenter ? 'cursor-default' : isAdjacent ? 'cursor-pointer' : 'pointer-events-none'
                }`}
                style={{
                  transform: `rotateX(${idx * 72}deg) translateZ(${CYLINDER_RADIUS}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  opacity,
                  filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
                  transition: isDragging
                    ? 'opacity 150ms ease, filter 150ms ease'
                    : 'opacity 550ms ease, filter 550ms ease',
                  pointerEvents: isCenter ? 'auto' : isAdjacent ? 'auto' : 'none',
                }}
              >
                {/* Side-by-Side Pure Minimalist Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-stretch w-full h-full">
                  <div className={`w-full h-full ${mobilePerspective === 'his' ? 'block' : 'hidden md:block'}`}>
                    {renderPureCard('his', hisData, section.slug)}
                  </div>
                  <div className={`w-full h-full ${mobilePerspective === 'her' ? 'block' : 'hidden md:block'}`}>
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
