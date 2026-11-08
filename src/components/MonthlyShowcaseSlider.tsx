'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

const NUM_SECTIONS = SECTIONS.length;

export default function MonthlyShowcaseSlider({
  year,
  month,
  monthName,
  onClose,
}: MonthlyShowcaseSliderProps) {
  const router = useRouter();
  const { getPerspectiveMonth, theme } = useApp();
  const isDark = theme === 'dark';

  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobilePerspective, setMobilePerspective] = useState<'his' | 'her'>('his');

  // Physics state stored in refs so rAF mutates DOM directly at 120fps without React re-renders
  const targetPosRef = useRef(0);
  const currentPosRef = useRef(0);
  const velocityRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Wheel gesture state
  const lastWheelStepTimeRef = useRef(0);
  const wheelAccumRef = useRef(0);
  const wheelResetTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Apply 3D drum transforms directly to the 5 section DOM nodes (zero React overhead per frame)
  const applyDrumTransforms = useCallback((pos: number) => {
    const newActiveIdx =
      ((Math.round(pos) % NUM_SECTIONS) + NUM_SECTIONS) % NUM_SECTIONS;
    if (newActiveIdx !== activeIndexRef.current) {
      activeIndexRef.current = newActiveIdx;
      setActiveIndex(newActiveIdx);
    }

    for (let idx = 0; idx < NUM_SECTIONS; idx++) {
      const el = sectionRefs.current[idx];
      if (!el) continue;

      const rawDiff = idx - pos;
      const offset =
        ((((rawDiff % NUM_SECTIONS) + NUM_SECTIONS + NUM_SECTIONS / 2) % NUM_SECTIONS) -
          NUM_SECTIONS / 2);
      const absOffset = Math.abs(offset);

      const isVisible = absOffset < 1.65;
      const isCenter = absOffset < 0.35;
      const isClickableNeighbor = absOffset >= 0.35 && absOffset < 1.35;

      // Smooth cylindrical arc geometry
      const angleRad = (offset * 36 * Math.PI) / 180;
      const translateYPercent = Math.sin(angleRad) * 76;
      const translateZPx = (Math.cos(angleRad) - 1) * 240;
      const scale = Math.max(0.76, 1 - absOffset * 0.13);
      const rotateXDeg = -offset * 20;

      // Smooth cosine-eased opacity curve
      let opacity = 0;
      if (isVisible) {
        if (absOffset <= 0.05) {
          opacity = 1;
        } else {
          const t = Math.min(1, (absOffset - 0.05) / 1.5);
          opacity = Math.max(0, Math.pow(1 - t, 1.45) * 0.65 + (absOffset < 0.5 ? (1 - absOffset * 2) * 0.35 : 0));
        }
      }

      const zIndex = Math.round(100 - absOffset * 40);

      el.style.transform = `perspective(1600px) translate3d(0, ${translateYPercent.toFixed(
        3
      )}%, ${translateZPx.toFixed(1)}px) scale(${scale.toFixed(4)}) rotateX(${rotateXDeg.toFixed(
        2
      )}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = String(zIndex);
      el.style.visibility = isVisible ? 'visible' : 'hidden';
      el.style.pointerEvents = isCenter || isClickableNeighbor ? 'auto' : 'none';
      el.style.cursor = isCenter ? 'default' : isClickableNeighbor ? 'pointer' : 'default';
    }
  }, []);

  // Critically-damped spring physics loop running at native refresh rate (60/120/144Hz)
  const startSpringLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;
    lastFrameTimeRef.current = null;

    const tick = (now: number) => {
      const prevTime = lastFrameTimeRef.current ?? now;
      lastFrameTimeRef.current = now;
      // Clamp dt between 1ms and 32ms to stay stable across tab switches
      const dt = Math.min(0.032, Math.max(0.001, (now - prevTime) / 1000));

      const destination = targetPosRef.current + dragOffsetRef.current;

      if (isDraggingRef.current) {
        // Responsive spring tracking while finger/mouse is dragging
        const diff = destination - currentPosRef.current;
        currentPosRef.current += diff * Math.min(1, dt * 28);
        velocityRef.current = 0;
        applyDrumTransforms(currentPosRef.current);
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      // Critically-damped spring: F = omega^2 * x - 2 * zeta * omega * v
      const omega = 13.5; // Natural frequency for a lush, fluid glide
      const zeta = 0.96; // Nearly critically damped (zero bounce, silky S-curve)
      const displacement = destination - currentPosRef.current;
      const springForce = omega * omega * displacement;
      const dampingForce = 2 * zeta * omega * velocityRef.current;
      const acceleration = springForce - dampingForce;

      velocityRef.current += acceleration * dt;
      currentPosRef.current += velocityRef.current * dt;

      if (Math.abs(displacement) < 0.0006 && Math.abs(velocityRef.current) < 0.004) {
        currentPosRef.current = destination;
        velocityRef.current = 0;
        applyDrumTransforms(destination);
        rafIdRef.current = null;
        lastFrameTimeRef.current = null;
        return;
      }

      applyDrumTransforms(currentPosRef.current);
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [applyDrumTransforms]);

  // Mount portal, initialize transforms, & lock background page scroll
  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mounted) {
      applyDrumTransforms(currentPosRef.current);
    }
  }, [mounted, applyDrumTransforms]);

  const stepNext = useCallback(() => {
    targetPosRef.current = Math.round(targetPosRef.current) + 1;
    startSpringLoop();
  }, [startSpringLoop]);

  const stepPrev = useCallback(() => {
    targetPosRef.current = Math.round(targetPosRef.current) - 1;
    startSpringLoop();
  }, [startSpringLoop]);

  const goToSection = useCallback(
    (targetIdx: number) => {
      const currentRounded = Math.round(targetPosRef.current);
      const currentMod = ((currentRounded % NUM_SECTIONS) + NUM_SECTIONS) % NUM_SECTIONS;
      let diff = targetIdx - currentMod;
      if (diff > NUM_SECTIONS / 2) diff -= NUM_SECTIONS;
      if (diff < -NUM_SECTIONS / 2) diff += NUM_SECTIONS;
      targetPosRef.current = currentRounded + diff;
      startSpringLoop();
    },
    [startSpringLoop]
  );

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

  // Smooth Wheel / Trackpad listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();

      // Reset accumulator if user paused scrolling
      if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = setTimeout(() => {
        wheelAccumRef.current = 0;
      }, 140);

      // Cooldown prevents trackpad inertia from skipping multiple cards at once
      if (now - lastWheelStepTimeRef.current < 260) return;

      wheelAccumRef.current += e.deltaY;

      const THRESHOLD = 24;
      if (Math.abs(wheelAccumRef.current) >= THRESHOLD) {
        if (wheelAccumRef.current > 0) {
          stepNext();
        } else {
          stepPrev();
        }
        wheelAccumRef.current = 0;
        lastWheelStepTimeRef.current = now;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
    };
  }, [mounted, stepNext, stepPrev]);

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
    if (
      !isPointerDownRef.current ||
      pointerStartYRef.current === null ||
      pointerStartXRef.current === null
    )
      return;

    const dy = e.clientY - pointerStartYRef.current;
    const dx = e.clientX - pointerStartXRef.current;
    pointerDeltaYRef.current = dy;
    pointerDeltaXRef.current = dx;

    if (Math.abs(dy) > 6 && Math.abs(dy) >= Math.abs(dx)) {
      isDraggingRef.current = true;
      dragOffsetRef.current = -dy / 360;
      startSpringLoop();
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const dy = pointerDeltaYRef.current;
    const dx = pointerDeltaXRef.current;

    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    // Horizontal swipe on mobile
    if (!wasDragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
      dragOffsetRef.current = 0;
      if (dx < 0) {
        setMobilePerspective('her');
      } else {
        setMobilePerspective('his');
      }
      startSpringLoop();
      return;
    }

    // Fold drag offset into velocity/target for seamless release
    dragOffsetRef.current = 0;
    if (Math.abs(dy) > 42) {
      if (dy < 0) {
        stepNext();
      } else {
        stepPrev();
      }
    } else {
      startSpringLoop();
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
    const ownerAvatar = side === 'his' ? '/his.png' : '/munto.png';

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
          className="w-full h-full rounded-md p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 28px 70px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 28px 70px -20px rgba(0,0,0,0.32), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            <div
              className="shrink-0 flex items-center justify-between pb-2.5 mb-3.5 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span className="flex items-center gap-1.5">
                <img src={ownerAvatar} alt="" className="w-4 h-4 object-contain" />
                <span>{ownerTag}</span>
              </span>
              <span>01 · FILM PRINT · {shortDate}</span>
            </div>

            <div className="flex-1 min-h-[140px] w-full bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasMovie && image ? (
                <img src={image} alt={movie?.title || 'Film'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasMovie ? 'FILM ARCHIVED' : 'UNEXPOSED REEL'}
                </div>
              )}
            </div>

            <div className="shrink-0 mt-4 sm:mt-5">
              <h3 className="font-poster font-bold uppercase text-2xl sm:text-3xl lg:text-[36px] tracking-tight leading-[0.98] truncate">
                {hasMovie ? movie?.title || 'UNTITLED FILM' : 'NO SCREENING'}
                {hasMovie && movie?.year && (
                  <span className="font-poster font-normal text-base sm:text-lg ml-2 opacity-60">
                    {movie.year}
                  </span>
                )}
              </h3>
            </div>

            <div className="shrink-0 mt-3 sm:mt-4 space-y-1 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
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
            className="shrink-0 pt-3.5 mt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
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
          className="w-full h-full rounded-md p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 28px 70px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 28px 70px -20px rgba(0,0,0,0.32), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            <div
              className="shrink-0 flex items-center justify-between pb-2.5 mb-3.5 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span className="flex items-center gap-1.5">
                <img src={ownerAvatar} alt="" className="w-4 h-4 object-contain" />
                <span>{ownerTag}</span>
              </span>
              <span>02 · GAME PRINT · {shortDate}</span>
            </div>

            <div className="flex-1 min-h-[140px] w-full bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasGame && image ? (
                <img src={image} alt={game?.title || 'Game'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasGame ? 'GAME ARCHIVED' : 'NO CARTRIDGE'}
                </div>
              )}
            </div>

            <div className="shrink-0 mt-4 sm:mt-5">
              <h3 className="font-poster font-bold uppercase text-2xl sm:text-3xl lg:text-[36px] tracking-tight leading-[0.98] truncate">
                {hasGame ? game?.title || 'UNTITLED GAME' : 'STANDBY'}
              </h3>
            </div>

            <div className="shrink-0 mt-3 sm:mt-4 space-y-1 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
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
            className="shrink-0 pt-3.5 mt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
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
          className="w-full h-full rounded-md p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 28px 70px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 28px 70px -20px rgba(0,0,0,0.32), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            <div
              className="shrink-0 flex items-center justify-between pb-2.5 mb-3.5 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span className="flex items-center gap-1.5">
                <img src={ownerAvatar} alt="" className="w-4 h-4 object-contain" />
                <span>{ownerTag}</span>
              </span>
              <span>03 · PLAT DU MOIS · {shortDate}</span>
            </div>

            <div className="flex-1 min-h-[140px] w-full bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasFood && image ? (
                <img src={image} alt={food?.title || 'Dish'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasFood ? 'DISH PLATED' : 'UNSERVED COURSE'}
                </div>
              )}
            </div>

            <div className="shrink-0 mt-4 sm:mt-5">
              <h3 className="font-poster font-bold uppercase text-2xl sm:text-3xl lg:text-[36px] tracking-tight leading-[0.98] truncate">
                {hasFood ? food?.title || 'SIGNATURE DISH' : 'UNSERVED COURSE'}
              </h3>
            </div>

            <div className="shrink-0 mt-3 sm:mt-4 space-y-1 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
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
            className="shrink-0 pt-3.5 mt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
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
          className="w-full h-full rounded-md p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden transition-colors duration-700"
          style={{
            backgroundColor: paperBg,
            color: ink,
            boxShadow: isDark
              ? '0 28px 70px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
              : '0 28px 70px -20px rgba(0,0,0,0.32), 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            <div
              className="shrink-0 flex items-center justify-between pb-2.5 mb-3.5 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
              style={{ borderColor: rule, color: muted }}
            >
              <span className="flex items-center gap-1.5">
                <img src={ownerAvatar} alt="" className="w-4 h-4 object-contain" />
                <span>{ownerTag}</span>
              </span>
              <span>04 · ARCHIVAL PRINT · {shortDate}</span>
            </div>

            <div className="flex-1 min-h-[140px] w-full bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
              {hasMemory && image ? (
                <img src={image} alt={memory?.title || 'Memory'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                  {hasMemory ? 'PRINT ARCHIVED' : 'UNEXPOSED FRAME'}
                </div>
              )}
            </div>

            <div className="shrink-0 mt-4 sm:mt-5">
              <h3 className="font-poster font-bold uppercase text-2xl sm:text-3xl lg:text-[36px] tracking-tight leading-[0.98] truncate">
                {hasMemory ? memory?.title || 'UNTITLED MEMORY' : 'UNEXPOSED FRAME'}
              </h3>
            </div>

            <div className="shrink-0 mt-3 sm:mt-4 space-y-1 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
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
            className="shrink-0 pt-3.5 mt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
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
        className="w-full h-full rounded-md p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden transition-colors duration-700"
        style={{
          backgroundColor: paperBg,
          color: ink,
          boxShadow: isDark
            ? '0 28px 70px -20px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.08)'
            : '0 28px 70px -20px rgba(0,0,0,0.32), 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <div
            className="shrink-0 flex items-center justify-between pb-2.5 mb-3.5 border-b font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase"
            style={{ borderColor: rule, color: muted }}
          >
            <span className="flex items-center gap-1.5">
              <img src={ownerAvatar} alt="" className="w-4 h-4 object-contain" />
              <span>{ownerTag}</span>
            </span>
            <span>05 · SONORITÉ · {shortDate}</span>
          </div>

          <div className="flex-1 min-h-[140px] w-full bg-black/85 overflow-hidden relative rounded-sm shadow-inner">
            {hasSong && image ? (
              <img src={image} alt={song?.title || 'Song'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                {hasSong ? 'RECORD ARCHIVED' : 'SILENT GROOVE'}
              </div>
            )}
          </div>

          <div className="shrink-0 mt-4 sm:mt-5">
            <h3 className="font-poster font-bold uppercase text-2xl sm:text-3xl lg:text-[36px] tracking-tight leading-[0.98] truncate">
              {hasSong ? song?.title || 'UNTITLED TRACK' : 'NO TRACK'}
            </h3>
          </div>

          <div className="shrink-0 mt-3 sm:mt-4 space-y-1 font-poster text-xs sm:text-sm lg:text-[15px] tracking-wide">
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
          className="shrink-0 pt-3.5 mt-4 border-t flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
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

  if (!mounted) return null;

  const content = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] w-screen h-screen overflow-hidden select-none touch-none transition-colors duration-700"
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
        className="pointer-events-none absolute inset-x-0 top-0 h-28 sm:h-36 lg:h-44 z-30 transition-all duration-700"
        style={{
          background: `linear-gradient(180deg, ${scene.base} 0%, ${scene.base}e6 30%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 lg:h-44 z-30 transition-all duration-700"
        style={{
          background: `linear-gradient(0deg, ${scene.base} 0%, ${scene.base}e6 30%, transparent 100%)`,
        }}
      />

      {/* Top Navigation Bar */}
      <div className="absolute inset-x-0 top-5 sm:top-7 px-6 sm:px-12 z-40 flex items-center justify-between font-mono text-[11px] sm:text-xs tracking-[0.28em] uppercase">
        <button
          type="button"
          onClick={handleClose}
          className="hover:opacity-100 opacity-70 transition-opacity cursor-pointer flex items-center gap-2"
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
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              mobilePerspective === 'his'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'opacity-60 text-current'
            }`}
          >
            <img src="/his.png" alt="His" className="w-4 h-4 object-contain" />
            <span>HIS</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobilePerspective('her');
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              mobilePerspective === 'her'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'opacity-60 text-current'
            }`}
          >
            <img src="/munto.png" alt="Hers" className="w-4 h-4 object-contain" />
            <span>HERS</span>
          </button>
        </div>

        {/* Active Category Code & Label + Close '✕' */}
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="opacity-70 hidden sm:inline">
            {SECTIONS[activeIndex].code} / 05 · {SECTIONS[activeIndex].label}
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="hover:opacity-100 opacity-70 transition-opacity cursor-pointer font-sans text-base leading-none p-1"
            title="Close showcase (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Right Edge Category Dash Nav (click to navigate directly) */}
      <div className="absolute right-4 sm:right-7 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-2.5">
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

      {/* Full-Screen Vertical Revolving Stage (DOM-Ref Driven at 120fps) */}
      <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-8 lg:px-14">
        <div className="relative w-full max-w-[1320px] h-[72vh] min-h-[460px] max-h-[680px] flex items-center justify-center">
          {SECTIONS.map((section, idx) => (
            <div
              key={section.slug}
              ref={(el) => {
                sectionRefs.current[idx] = el;
              }}
              onClick={() => {
                const rawDiff = idx - currentPosRef.current;
                const offset =
                  ((((rawDiff % NUM_SECTIONS) + NUM_SECTIONS + NUM_SECTIONS / 2) % NUM_SECTIONS) -
                    NUM_SECTIONS / 2);
                if (Math.abs(offset) >= 0.35 && Math.abs(offset) < 1.35) {
                  if (offset > 0) stepNext();
                  else stepPrev();
                }
              }}
              className="w-full h-full absolute inset-0 will-change-[transform,opacity]"
            >
              {/* Side-by-Side Pure Minimalist Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-stretch w-full h-full">
                <div
                  className={`w-full h-full ${
                    mobilePerspective === 'his' ? 'block' : 'hidden md:block'
                  }`}
                >
                  {renderPureCard('his', hisData, section.slug)}
                </div>
                <div
                  className={`w-full h-full ${
                    mobilePerspective === 'her' ? 'block' : 'hidden md:block'
                  }`}
                >
                  {renderPureCard('her', herData, section.slug)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
