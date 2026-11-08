'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/lib/store';

export default function PersonaThemeBackdrop() {
  const { activePerspective, theme } = useApp();
  const isHis = activePerspective === 'his';
  const isDark = theme === 'dark';

  // Track active transition wave when switching between His and Her side
  const [transitionPulse, setTransitionPulse] = useState(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    setTransitionPulse(true);
    const timer = setTimeout(() => {
      setTransitionPulse(false);
    }, 850);
    return () => clearTimeout(timer);
  }, [activePerspective]);

  // Background gradient tuned to match His (cobalt/midnight blue) & Her (hot-pink/crimson) duotone photos
  const backgroundGradient = isHis
    ? isDark
      ? 'radial-gradient(circle at 0% 55%, rgba(21, 94, 212, 0.34) 0%, rgba(12, 45, 108, 0.22) 34%, rgba(10, 15, 26, 0.96) 72%, #090C14 100%)'
      : 'radial-gradient(circle at 0% 50%, rgba(28, 104, 224, 0.20) 0%, rgba(76, 144, 245, 0.09) 36%, rgba(244, 247, 253, 0.95) 72%, #F9FAFD 100%)'
    : isDark
    ? 'radial-gradient(circle at 100% 55%, rgba(232, 36, 117, 0.32) 0%, rgba(128, 17, 64, 0.20) 34%, rgba(20, 11, 16, 0.96) 72%, #11090E 100%)'
    : 'radial-gradient(circle at 100% 50%, rgba(232, 36, 117, 0.19) 0%, rgba(244, 92, 155, 0.09) 36%, rgba(253, 246, 249, 0.95) 72%, #FDF9FB 100%)';

  return (
    <>
      {/* 1. Base Tuned Gradient & Ambient Aura Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700"
        style={{
          backgroundColor: isHis
            ? isDark
              ? '#090D16'
              : '#F6F9FE'
            : isDark
            ? '#130A0F'
            : '#FDF8FA',
          backgroundImage: backgroundGradient,
        }}
      >
        {/* Directional Slide-Out Color Plume from Left (His) */}
        <div
          className="absolute inset-y-0 left-0 w-[65vw] max-w-[900px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: isHis ? 'translate3d(0%, 0, 0)' : 'translate3d(-105%, 0, 0)',
            opacity: isHis ? 1 : 0,
            background: isDark
              ? 'linear-gradient(90deg, rgba(19, 92, 216, 0.26) 0%, rgba(15, 62, 148, 0.10) 48%, transparent 100%)'
              : 'linear-gradient(90deg, rgba(25, 103, 226, 0.16) 0%, rgba(56, 132, 244, 0.05) 48%, transparent 100%)',
          }}
        />

        {/* Directional Slide-Out Color Plume from Right (Hers) */}
        <div
          className="absolute inset-y-0 right-0 w-[65vw] max-w-[900px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: !isHis ? 'translate3d(0%, 0, 0)' : 'translate3d(105%, 0, 0)',
            opacity: !isHis ? 1 : 0,
            background: isDark
              ? 'linear-gradient(270deg, rgba(232, 36, 117, 0.25) 0%, rgba(156, 22, 78, 0.10) 48%, transparent 100%)'
              : 'linear-gradient(270deg, rgba(232, 36, 117, 0.15) 0%, rgba(242, 82, 148, 0.05) 48%, transparent 100%)',
          }}
        />
      </div>

      {/* 2. Left & Right Slide-Out Persona Cutout Portraits */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none overflow-hidden transition-all duration-500 ${
          transitionPulse ? 'z-30' : 'z-[2]'
        }`}
      >
        {/* Kinetic Sweep Curtain on Switch */}
        <div
          className="absolute inset-y-0 left-0 w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform:
              transitionPulse && isHis
                ? 'translate3d(0%, 0, 0)'
                : 'translate3d(-100%, 0, 0)',
            background:
              'linear-gradient(90deg, rgba(20, 96, 220, 0.22) 0%, rgba(20, 96, 220, 0.06) 45%, transparent 80%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform:
              transitionPulse && !isHis
                ? 'translate3d(0%, 0, 0)'
                : 'translate3d(100%, 0, 0)',
            background:
              'linear-gradient(270deg, rgba(232, 36, 117, 0.22) 0%, rgba(232, 36, 117, 0.06) 45%, transparent 80%)',
          }}
        />

        {/* HIS PORTRAIT: Slides out from the LEFT side of the screen */}
        <div
          className="absolute left-0 bottom-0 flex items-end justify-start will-change-transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: isHis
              ? transitionPulse
                ? 'translate3d(0%, 0, 0) scale(1.03)'
                : 'translate3d(-4%, 0, 0) scale(1)'
              : 'translate3d(-115%, 4%, 0) scale(0.94)',
            opacity: isHis ? 1 : 0,
          }}
        >
          {/* Ambient cobalt glow behind his silhouette */}
          <div
            className="absolute -left-10 bottom-8 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(28, 112, 242, 0.42) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(28, 112, 242, 0.26) 0%, transparent 70%)',
            }}
          />
          <img
            src="/his-theme.png"
            alt="His theme portrait"
            className={`relative h-[50vh] sm:h-[64vh] lg:h-[78vh] max-h-[760px] w-auto object-contain object-left-bottom select-none transition-opacity duration-500 ${
              transitionPulse ? 'opacity-95' : 'opacity-80 sm:opacity-90'
            }`}
            style={{
              filter: isDark
                ? 'drop-shadow(12px 8px 36px rgba(16, 88, 218, 0.45)) contrast(1.04)'
                : 'drop-shadow(12px 10px 32px rgba(16, 74, 185, 0.28)) contrast(1.03)',
            }}
          />
        </div>

        {/* HER PORTRAIT: Slides out from the RIGHT side of the screen */}
        <div
          className="absolute right-0 bottom-0 flex items-end justify-end will-change-transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: !isHis
              ? transitionPulse
                ? 'translate3d(0%, 0, 0) scale(1.03)'
                : 'translate3d(4%, 0, 0) scale(1)'
              : 'translate3d(115%, 4%, 0) scale(0.94)',
            opacity: !isHis ? 1 : 0,
          }}
        >
          {/* Ambient hot-pink glow behind her silhouette */}
          <div
            className="absolute -right-10 bottom-8 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(232, 36, 117, 0.42) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(232, 36, 117, 0.25) 0%, transparent 70%)',
            }}
          />
          <img
            src="/her-theme.png"
            alt="Her theme portrait"
            className={`relative h-[52vh] sm:h-[66vh] lg:h-[80vh] max-h-[780px] w-auto object-contain object-right-bottom select-none transition-opacity duration-500 ${
              transitionPulse ? 'opacity-95' : 'opacity-80 sm:opacity-90'
            }`}
            style={{
              filter: isDark
                ? 'drop-shadow(-12px 8px 36px rgba(232, 36, 117, 0.45)) contrast(1.04)'
                : 'drop-shadow(-12px 10px 32px rgba(210, 28, 103, 0.26)) contrast(1.03)',
            }}
          />
        </div>
      </div>

      {/* 3. Fine Analog Film Grain Overlay (Matches Duotone Grain Texture of Both Photos) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[3] overflow-hidden"
        style={{
          opacity: isDark ? 0.22 : 0.16,
          mixBlendMode: isDark ? 'overlay' : 'multiply',
        }}
      >
        <svg className="w-full h-full">
          <filter id="persona-film-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#persona-film-grain)" />
        </svg>
      </div>
    </>
  );
}
