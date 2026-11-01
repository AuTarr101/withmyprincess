'use client';

import React from 'react';
import { Utensils } from 'lucide-react';

interface PorcelainPlateFrameProps {
  imageUrl?: string;
  embedUrl?: string | null;
  isYoutube?: boolean;
  title?: string;
  restaurant?: string;
  monthLabel?: string;
  accentColor?: string;
  emptyState?: boolean;
}

/**
 * Realistic Overhead Fine Porcelain Dining Plate ("Picture on a Plate" Theme)
 * Features:
 * - Flanking vintage French bistro silverware (fork on left, knife on right)
 * - Outer sculpted bone-china rim with radial glaze sheen
 * - Classic bistro double-line filigree rim (burgundy & antique gold leaf)
 * - Deep recessed circular plate well with realistic inner bevel shadow
 * - Circular dish photo/video framed directly on the center of the plate
 */
export default function PorcelainPlateFrame({
  imageUrl,
  embedUrl,
  isYoutube = false,
  title = 'Signature Dish',
  restaurant = 'MAISON DE DEUX',
  monthLabel = 'TABLE N° 02',
  emptyState = false,
}: PorcelainPlateFrameProps) {
  const crestTopText = (restaurant || 'MAISON DE DEUX').toUpperCase().slice(0, 26);

  return (
    <div className="relative w-full flex items-center justify-center py-2 sm:py-4 select-none">
      {/* Subtle Linen Placemat Oval Shadow underneath */}
      <div
        className="absolute w-[310px] h-[310px] sm:w-[390px] sm:h-[390px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(35,24,18,0.28) 0%, rgba(35,24,18,0.14) 58%, transparent 74%)',
          transform: 'translateY(14px)',
        }}
      />

      <div className="relative flex items-center justify-center gap-4 sm:gap-7">
        {/* ============================================================
            LEFT SILVERWARE: Vintage French Bistro Dinner Fork (SVG)
           ============================================================ */}
        <div
          className="hidden sm:flex flex-col items-center justify-center opacity-85 transition-transform duration-500 hover:-translate-y-1"
          aria-hidden="true"
        >
          <svg
            width="28"
            height="270"
            viewBox="0 0 28 270"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[2px_8px_6px_rgba(30,20,15,0.25)]"
          >
            <defs>
              <linearGradient id="silverwareGradLeft" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B8B2A6" />
                <stop offset="35%" stopColor="#F4F1EA" />
                <stop offset="65%" stopColor="#C9C3B8" />
                <stop offset="100%" stopColor="#8E877C" />
              </linearGradient>
            </defs>
            {/* 4 Fork Tines */}
            <rect x="4" y="6" width="2.3" height="46" rx="1.1" fill="url(#silverwareGradLeft)" />
            <rect x="9.8" y="4" width="2.3" height="48" rx="1.1" fill="url(#silverwareGradLeft)" />
            <rect x="15.8" y="4" width="2.3" height="48" rx="1.1" fill="url(#silverwareGradLeft)" />
            <rect x="21.6" y="6" width="2.3" height="46" rx="1.1" fill="url(#silverwareGradLeft)" />
            {/* Fork Heel / Bowl */}
            <path
              d="M4 48 C4 68, 10.5 76, 11.5 92 L16.5 92 C17.5 76, 24 68, 24 48 Z"
              fill="url(#silverwareGradLeft)"
            />
            {/* Neck Collar */}
            <rect x="10.2" y="91" width="7.6" height="4" rx="1.5" fill="#9A9286" />
            {/* Vintage Sculpted Handle */}
            <path
              d="M11.5 95 L16.5 95 L19.5 248 C19.8 258, 17 264, 14 264 C11 264, 8.2 258, 8.5 248 Z"
              fill="url(#silverwareGradLeft)"
            />
            {/* Subtle Engraved Ridge on Handle */}
            <line
              x1="14"
              y1="108"
              x2="14"
              y2="250"
              stroke="#8F887D"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* ============================================================
            CENTERPIECE: Fine Bone China / Porcelain Plate
           ============================================================ */}
        <div
          className="relative w-[290px] h-[290px] sm:w-[376px] sm:h-[376px] rounded-full flex items-center justify-center transition-transform duration-500"
          style={{
            background:
              'radial-gradient(circle at 32% 26%, #FFFFFF 0%, #FCFBF9 38%, #F1ECE1 76%, #E2D9C8 95%, #CFC3AE 100%)',
            boxShadow:
              '0 26px 55px -12px rgba(28, 19, 14, 0.45), 0 8px 20px -4px rgba(28, 19, 14, 0.25), inset 0 2px 5px rgba(255, 255, 255, 0.95), inset 0 -5px 12px rgba(145, 130, 108, 0.38)',
          }}
        >
          {/* Outer Porcelain Moulded Lip Bevel */}
          <div
            className="
              absolute inset-[6px] sm:inset-[8px] rounded-full pointer-events-none
              border border-[#DCD2C0]/80
            "
            style={{
              boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.8)',
            }}
          />

          {/* Outer Bistro Pinstripe Ring (Deep Burgundy / Antique Gold) */}
          <div
            className="absolute inset-[13px] sm:inset-[16px] rounded-full pointer-events-none"
            style={{
              border: '1.5px solid rgba(122, 40, 40, 0.55)',
            }}
          />

          {/* Second Fine Gold Filigree Ring */}
          <div
            className="absolute inset-[18px] sm:inset-[22px] rounded-full pointer-events-none"
            style={{
              border: '1px solid rgba(180, 138, 78, 0.55)',
            }}
          />

          {/* Top Rim Bistro Crest Text */}
          <div className="absolute top-[22px] sm:top-[27px] left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
            <span className="text-[7.5px] sm:text-[9px] font-serif font-bold tracking-[0.26em] text-[#7A2828]/85 uppercase whitespace-nowrap px-2">
              ✦ {crestTopText} ✦
            </span>
          </div>

          {/* Bottom Rim Table Number Stamp */}
          <div className="absolute bottom-[22px] sm:bottom-[27px] left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1.5">
            <span className="text-[7px] sm:text-[8.5px] font-mono tracking-[0.22em] text-[#786B59] uppercase whitespace-nowrap">
              {monthLabel}
            </span>
          </div>

          {/* Left & Right Rim Rosette Ornaments */}
          <span
            className="absolute left-[22px] sm:left-[28px] top-1/2 -translate-y-1/2 text-[9px] text-[#9E7B47]/75 pointer-events-none"
            aria-hidden="true"
          >
            ❖
          </span>
          <span
            className="absolute right-[22px] sm:right-[28px] top-1/2 -translate-y-1/2 text-[9px] text-[#9E7B47]/75 pointer-events-none"
            aria-hidden="true"
          >
            ❖
          </span>

          {/* ============================================================
              INNER RECESSED PLATE WELL (Frames the Dish Photo)
             ============================================================ */}
          <div
            className="relative w-[202px] h-[202px] sm:w-[264px] sm:h-[264px] rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 60% 65%, #FAF7F2 0%, #EFE9DC 70%, #DFD5C3 100%)',
              boxShadow:
                'inset 0 10px 22px rgba(45, 33, 24, 0.28), inset 0 2px 6px rgba(45, 33, 24, 0.18), 0 2px 3px rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(212, 200, 180, 0.85)',
            }}
          >
            {emptyState ? (
              /* Empty Porcelain Well waiting for a Dish */
              <div className="flex flex-col items-center justify-center text-center p-6 text-[#8C7D6B]">
                <div className="w-12 h-12 rounded-full border border-dashed border-[#B5A690] flex items-center justify-center mb-2 bg-white/50">
                  <Utensils className="w-5 h-5 text-[#7A2828]/70 stroke-[1.5]" />
                </div>
                <span className="font-serif italic text-xs sm:text-sm text-[#5C4E41]">
                  Ready to Serve
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#968876] mt-0.5">
                  Paste Dish Photo Above
                </span>
              </div>
            ) : isYoutube && embedUrl ? (
              <div className="w-full h-full relative rounded-full overflow-hidden bg-stone-900">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full scale-[1.35]"
                  title={title || 'Dish Video'}
                />
              </div>
            ) : imageUrl ? (
              <div className="w-full h-full relative rounded-full overflow-hidden group">
                <img
                  src={imageUrl}
                  alt={title || 'Signature Dish'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Inner Plate Well Depth Vignette + Porcelain Glaze Reflection */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow:
                      'inset 0 10px 24px rgba(20, 12, 8, 0.42), inset 0 -6px 16px rgba(20, 12, 8, 0.25), inset 0 0 0 1px rgba(255,255,255,0.2)',
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8C7D6B]">
                <Utensils className="w-12 h-12 stroke-[1.4]" />
              </div>
            )}

            {/* Subtle Ceramic Glaze Specular Highlight Arc across the Plate */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.04) 36%, transparent 52%)',
              }}
            />
          </div>
        </div>

        {/* ============================================================
            RIGHT SILVERWARE: Vintage French Bistro Dinner Knife (SVG)
           ============================================================ */}
        <div
          className="hidden sm:flex flex-col items-center justify-center opacity-85 transition-transform duration-500 hover:-translate-y-1"
          aria-hidden="true"
        >
          <svg
            width="28"
            height="270"
            viewBox="0 0 28 270"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[2px_8px_6px_rgba(30,20,15,0.25)]"
          >
            <defs>
              <linearGradient id="silverwareGradRight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B8B2A6" />
                <stop offset="40%" stopColor="#F7F5F0" />
                <stop offset="75%" stopColor="#C5BFB4" />
                <stop offset="100%" stopColor="#8A8378" />
              </linearGradient>
            </defs>
            {/* Knife Blade */}
            <path
              d="M15 6 C9 18, 7.5 52, 8 124 L17.5 124 L17.5 8 C17.5 6.5, 16 5.5, 15 6 Z"
              fill="url(#silverwareGradRight)"
            />
            {/* Knife Bolster Collar */}
            <rect x="9.5" y="123" width="9" height="5" rx="1.5" fill="#9A9286" />
            {/* Knife Handle */}
            <path
              d="M10.5 128 L17.5 128 L19.2 250 C19.4 259, 16.8 264, 14 264 C11.2 264, 8.6 259, 8.8 250 Z"
              fill="url(#silverwareGradRight)"
            />
            {/* Rivet Details on Bistro Knife Handle */}
            <circle cx="14" cy="156" r="1.6" fill="#7D756B" />
            <circle cx="14" cy="194" r="1.6" fill="#7D756B" />
            <circle cx="14" cy="232" r="1.6" fill="#7D756B" />
          </svg>
        </div>
      </div>
    </div>
  );
}
