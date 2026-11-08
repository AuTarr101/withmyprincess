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

  // Softened, airy background gradients tuned to gently complement His (cobalt) & Her (rose-pink) photos
  const backgroundGradient = isHis
    ? isDark
      ? 'radial-gradient(circle at 0% 55%, rgba(28, 96, 204, 0.18) 0%, rgba(16, 48, 108, 0.10) 36%, rgba(11, 15, 24, 0.96) 74%, #0A0D14 100%)'
      : 'radial-gradient(circle at 0% 50%, rgba(42, 112, 222, 0.11) 0%, rgba(92, 148, 238, 0.05) 38%, rgba(247, 249, 253, 0.96) 74%, #FAFBFD 100%)'
    : isDark
    ? 'radial-gradient(circle at 100% 55%, rgba(214, 62, 122, 0.15) 0%, rgba(118, 26, 64, 0.09) 36%, rgba(19, 12, 16, 0.96) 74%, #110B0E 100%)'
    : 'radial-gradient(circle at 100% 50%, rgba(224, 82, 138, 0.09) 0%, rgba(238, 128, 172, 0.04) 38%, rgba(253, 249, 251, 0.96) 74%, #FDFBFC 100%)';

  return (
    <>
      {/* 1. Base Softened Gradient & Ambient Aura Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700"
        style={{
          backgroundColor: isHis
            ? isDark
              ? '#0A0D14'
              : '#F8FAFD'
            : isDark
            ? '#120B0F'
            : '#FDFBFC',
          backgroundImage: backgroundGradient,
        }}
      >
        {/* Subtle Directional Slide-Out Color Plume from Left (His) */}
        <div
          className="absolute inset-y-0 left-0 w-[58vw] max-w-[820px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: isHis ? 'translate3d(0%, 0, 0)' : 'translate3d(-105%, 0, 0)',
            opacity: isHis ? 1 : 0,
            background: isDark
              ? 'linear-gradient(90deg, rgba(25, 92, 204, 0.14) 0%, rgba(18, 62, 142, 0.05) 48%, transparent 100%)'
              : 'linear-gradient(90deg, rgba(38, 108, 220, 0.08) 0%, rgba(68, 136, 238, 0.03) 48%, transparent 100%)',
          }}
        />

        {/* Subtle Directional Slide-Out Color Plume from Right (Hers) */}
        <div
          className="absolute inset-y-0 right-0 w-[58vw] max-w-[820px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: !isHis ? 'translate3d(0%, 0, 0)' : 'translate3d(105%, 0, 0)',
            opacity: !isHis ? 1 : 0,
            background: isDark
              ? 'linear-gradient(270deg, rgba(214, 62, 122, 0.12) 0%, rgba(142, 30, 76, 0.04) 48%, transparent 100%)'
              : 'linear-gradient(270deg, rgba(224, 82, 138, 0.07) 0%, rgba(238, 118, 166, 0.025) 48%, transparent 100%)',
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
        {/* Gentle Kinetic Sweep Curtain on Switch */}
        <div
          className="absolute inset-y-0 left-0 w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform:
              transitionPulse && isHis
                ? 'translate3d(0%, 0, 0)'
                : 'translate3d(-100%, 0, 0)',
            background:
              'linear-gradient(90deg, rgba(28, 98, 212, 0.13) 0%, rgba(28, 98, 212, 0.03) 45%, transparent 80%)',
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
              'linear-gradient(270deg, rgba(218, 66, 126, 0.12) 0%, rgba(218, 66, 126, 0.03) 45%, transparent 80%)',
          }}
        />

        {/* HIS PORTRAIT: Slides out from the LEFT side of the screen */}
        <div
          className="absolute left-0 bottom-0 flex items-end justify-start will-change-transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: isHis
              ? transitionPulse
                ? 'translate3d(0%, 0, 0) scale(1.02)'
                : 'translate3d(-4%, 0, 0) scale(1)'
              : 'translate3d(-115%, 4%, 0) scale(0.94)',
            opacity: isHis ? 1 : 0,
          }}
        >
          {/* Softened cobalt glow behind his silhouette */}
          <div
            className="absolute -left-10 bottom-8 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(32, 108, 232, 0.24) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(32, 108, 232, 0.15) 0%, transparent 70%)',
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
                ? 'drop-shadow(10px 8px 30px rgba(18, 84, 204, 0.32))'
                : 'drop-shadow(10px 8px 28px rgba(18, 72, 176, 0.18))',
            }}
          />
        </div>

        {/* HER PORTRAIT: Slides out from the RIGHT side of the screen */}
        <div
          className="absolute right-0 bottom-0 flex items-end justify-end will-change-transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: !isHis
              ? transitionPulse
                ? 'translate3d(0%, 0, 0) scale(1.02)'
                : 'translate3d(4%, 0, 0) scale(1)'
              : 'translate3d(115%, 4%, 0) scale(0.94)',
            opacity: !isHis ? 1 : 0,
          }}
        >
          {/* Softened rose-pink glow behind her silhouette */}
          <div
            className="absolute -right-10 bottom-8 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(218, 64, 125, 0.22) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(218, 64, 125, 0.13) 0%, transparent 70%)',
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
                ? 'drop-shadow(-10px 8px 30px rgba(214, 54, 118, 0.30))'
                : 'drop-shadow(-10px 8px 28px rgba(198, 48, 108, 0.16))',
            }}
          />
        </div>
      </div>

      {/* 3. Fine Analog Film Grain Overlay (Matches Duotone Grain Texture of Both Photos) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[3] overflow-hidden"
        style={{
          opacity: isDark ? 0.20 : 0.14,
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
