'use client';

import React, { useState } from 'react';

interface RetroTvFrameProps {
  /** Content rendered inside the curved 4:3 CRT tube when TV is on the game channel */
  children?: React.ReactNode;
  /** If true, shows the vintage rainbow color-bars test pattern by default (e.g. empty state) */
  defaultTestPattern?: boolean;
  /** Optional channel badge text */
  channelLabel?: string;
}

const COLOR_BARS = [
  '#C94A29', // Terracotta Red-Orange
  '#E5BC38', // Golden Yellow
  '#A9B867', // Sage Olive Green
  '#7399B2', // Muted Sky Blue
  '#DFDDD6', // Warm Off-White
  '#649BB5', // Cerulean Teal Blue
  '#87C37F', // Pastel Mint Green
];

export default function RetroTvFrame({
  children,
  defaultTestPattern = false,
  channelLabel = 'CH 03',
}: RetroTvFrameProps) {
  const [showColorBars, setShowColorBars] = useState(defaultTestPattern);
  const [scanlinesOn, setScanlinesOn] = useState(true);
  const [dialAngle, setDialAngle] = useState(0);
  const [knob1Angle, setKnob1Angle] = useState(0);
  const [knob2Angle, setKnob2Angle] = useState(0);

  const isShowingBars = defaultTestPattern || showColorBars || !children;

  const handleTopKnobClick = () => {
    setKnob1Angle((a) => a + 45);
    if (!defaultTestPattern) {
      setShowColorBars((prev) => !prev);
    }
  };

  const handleSecondKnobClick = () => {
    setKnob2Angle((a) => a + 45);
    setScanlinesOn((prev) => !prev);
  };

  const handleBigDialClick = () => {
    setDialAngle((a) => a + 60);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* ============================================================
          1. RABBIT-EAR TELESCOPING ANTENNAS (SVG)
         ============================================================ */}
      <div className="w-full relative h-24 sm:h-28 -mb-1.5 pointer-events-none z-10">
        <svg
          viewBox="0 0 500 115"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="antennaChrome" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5C5854" />
              <stop offset="45%" stopColor="#EAE6DF" />
              <stop offset="70%" stopColor="#9A948C" />
              <stop offset="100%" stopColor="#433F3C" />
            </linearGradient>
            <radialGradient id="antennaTip" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#CFCAC2" />
              <stop offset="100%" stopColor="#4A4642" />
            </radialGradient>
          </defs>

          {/* Left vertical antenna rod */}
          <line
            x1="168"
            y1="112"
            x2="167"
            y2="10"
            stroke="url(#antennaChrome)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Left base collar */}
          <rect x="163" y="106" width="10" height="7" rx="2" fill="url(#antennaChrome)" />
          <rect x="165" y="101" width="6" height="6" rx="1" fill="url(#antennaChrome)" />
          {/* Left ball tip */}
          <circle cx="167" cy="9" r="4.2" fill="url(#antennaTip)" />

          {/* Middle angled antenna rod */}
          <line
            x1="242"
            y1="112"
            x2="306"
            y2="24"
            stroke="url(#antennaChrome)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Middle base collar */}
          <rect x="237" y="106" width="10" height="7" rx="2" fill="url(#antennaChrome)" />
          <circle cx="306" cy="24" r="4.2" fill="url(#antennaTip)" />

          {/* Right parallel angled antenna rod */}
          <line
            x1="274"
            y1="112"
            x2="338"
            y2="30"
            stroke="url(#antennaChrome)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Right base collar */}
          <rect x="269" y="106" width="10" height="7" rx="2" fill="url(#antennaChrome)" />
          <circle cx="338" cy="30" r="4.2" fill="url(#antennaTip)" />
        </svg>
      </div>

      {/* ============================================================
          2. OUTER WALNUT WOODEN TV CABINET
         ============================================================ */}
      <div
        className="w-full relative rounded-[26px] sm:rounded-[32px] p-2.5 sm:p-3.5 shadow-[0_26px_50px_-12px_rgba(0,0,0,0.65),inset_0_2px_3px_rgba(255,225,190,0.35),inset_0_-4px_6px_rgba(35,18,6,0.7)] border border-[#4E2C12]"
        style={{
          background:
            'linear-gradient(180deg, #A56A38 0%, #865024 18%, #73421B 50%, #5F3514 85%, #4B280E 100%)',
        }}
      >
        {/* Subtle wood grain texture overlay */}
        <div
          className="absolute inset-0 rounded-[26px] sm:rounded-[32px] opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(40,18,5,0.22) 0px, rgba(40,18,5,0.22) 2px, transparent 2px, transparent 9px)',
          }}
        />

        {/* Metallic Cream/Silver Inner Frame Bezel */}
        <div className="relative rounded-[20px] sm:rounded-[24px] p-1.5 sm:p-2 bg-gradient-to-b from-[#E5DDD0] via-[#CFC5B6] to-[#9E9385] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_8px_rgba(0,0,0,0.6)] border border-[#2C241E]">
          {/* Dark Inner Cabinet Faceplate */}
          <div className="rounded-[16px] sm:rounded-[20px] bg-[#1A1817] p-1.5 sm:p-2.5 flex items-stretch gap-1.5 sm:gap-2.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]">
            {/* Far-Left Recessed Trim Strip */}
            <div className="hidden xs:block w-3.5 sm:w-5 rounded-l-[12px] rounded-r-[4px] bg-gradient-to-r from-[#2D2A28] via-[#211E1C] to-[#171514] border border-white/10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] shrink-0" />

            {/* ========================================================
                CENTER: DEEP BEVELED 4:3 CURVED CRT TUBE SCREEN
               ======================================================== */}
            <div className="flex-1 relative rounded-[16px] sm:rounded-[20px] p-2 sm:p-3 bg-gradient-to-b from-[#332F2C] via-[#1C1A18] to-[#2B2725] shadow-[inset_0_8px_18px_rgba(0,0,0,0.95),inset_0_-6px_14px_rgba(255,255,255,0.06)] border border-black">
              {/* Curved Glass Tube */}
              <div className="relative w-full aspect-[4/3] rounded-[22px] sm:rounded-[30px] overflow-hidden bg-[#111010] shadow-[inset_0_0_32px_rgba(0,0,0,0.85)] border-[3px] border-[#0E0D0C]">
                {isShowingBars ? (
                  /* Vintage SMPTE Color Bars Test Pattern (matches uploaded image) */
                  <div className="w-full h-full grid grid-cols-7 relative">
                    {COLOR_BARS.map((hex, idx) => (
                      <div
                        key={idx}
                        className="h-full w-full"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    {defaultTestPattern && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[1px] px-4 text-center">
                        <span className="px-3 py-1 rounded bg-black/75 text-amber-300 font-mono text-xs sm:text-sm tracking-widest uppercase border border-amber-400/30 shadow-lg">
                          {channelLabel} • NO CARTRIDGE SIGNAL
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Active Game Channel Content */
                  <div className="w-full h-full relative">{children}</div>
                )}

                {/* Authentic CRT Scanlines Overlay */}
                {scanlinesOn && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20 opacity-25"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)',
                    }}
                  />
                )}

                {/* Curved CRT Glass Vignette + Right-Side Window Glare Reflection */}
                <div
                  className="absolute inset-0 pointer-events-none z-20 rounded-[22px] sm:rounded-[30px]"
                  style={{
                    boxShadow:
                      'inset 0 12px 28px rgba(0,0,0,0.55), inset 0 -12px 28px rgba(0,0,0,0.55), inset 16px 0 28px rgba(0,0,0,0.45), inset -16px 0 28px rgba(0,0,0,0.45)',
                    background:
                      'linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 78%, rgba(255,248,230,0.22) 88%, rgba(255,255,255,0.04) 96%)',
                  }}
                />

                {/* Subtle On-Screen Display (OSD) Channel Indicator */}
                <div className="absolute top-2.5 left-3.5 z-20 pointer-events-none">
                  <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-emerald-400/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {isShowingBars ? 'CH 00 • TEST' : channelLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================
                RIGHT: VINTAGE CONTROL COLUMN (Yellow Plate, Knobs, Grille)
               ======================================================== */}
            <div className="w-12 sm:w-16 rounded-r-[12px] rounded-l-[4px] bg-gradient-to-b from-[#2A2623] via-[#211E1C] to-[#1A1716] border border-white/15 p-1.5 sm:p-2 flex flex-col items-center justify-between shrink-0 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)]">
              {/* Top Ochre/Gold Recessed Plate with 2 Small Knobs */}
              <div
                className="w-full rounded-[6px] p-1 sm:p-1.5 flex flex-col items-center gap-1.5 sm:gap-2 border border-[#3B2B10] shadow-[inset_0_1px_3px_rgba(255,240,190,0.45),0_2px_4px_rgba(0,0,0,0.6)]"
                style={{
                  background: 'linear-gradient(180deg, #D9AD4E 0%, #C29438 100%)',
                }}
              >
                {/* Small Knob 1: Toggle Color Bars / Game Channel */}
                <button
                  type="button"
                  onClick={handleTopKnobClick}
                  title="Switch TV Channel (Game / Color Bars)"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-[#EDE6DA] to-[#B7AEA0] border-2 border-[#3A2E21] shadow-[0_2px_4px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  style={{ transform: `rotate(${knob1Angle}deg)` }}
                >
                  <span className="w-0.5 h-2 bg-[#4A3C2C] rounded-full -translate-y-0.5" />
                </button>

                {/* Small Knob 2: Toggle CRT Scanlines */}
                <button
                  type="button"
                  onClick={handleSecondKnobClick}
                  title="Toggle CRT Scanlines"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-[#EDE6DA] to-[#B7AEA0] border-2 border-[#3A2E21] shadow-[0_2px_4px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  style={{ transform: `rotate(${knob2Angle}deg)` }}
                >
                  <span className="w-0.5 h-2 bg-[#4A3C2C] rounded-full -translate-y-0.5" />
                </button>
              </div>

              {/* Middle Large Rotary Tuner Dial */}
              <div className="my-1.5 sm:my-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleBigDialClick}
                  title="Turn Tuner Dial (8-bit Chime)"
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#151312] p-1 border-2 border-[#3C3632] shadow-[0_4px_8px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  style={{ transform: `rotate(${dialAngle}deg)` }}
                >
                  <span className="w-full h-full rounded-full bg-gradient-to-br from-[#EFE9DF] via-[#CFC7BA] to-[#988F82] border border-[#2A2420] shadow-inner flex items-center justify-center">
                    <span className="w-0.5 h-2.5 bg-[#3A332C] rounded-full -translate-y-1" />
                  </span>
                </button>
              </div>

              {/* Bottom Horizontal Slatted Speaker Grille + Silver Badge */}
              <div className="w-full flex-1 flex flex-col justify-end gap-[2.5px] sm:gap-[3px] pt-1">
                {Array.from({ length: 13 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full h-[3px] sm:h-[3.5px] rounded-[1px] bg-gradient-to-b from-[#D7CFC3] to-[#9A9184] shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
                  />
                ))}
                {/* Bottom silver nameplate */}
                <div className="mt-1 self-end w-6 sm:w-8 h-2 sm:h-2.5 rounded-[1px] bg-gradient-to-b from-[#E5DEC3] to-[#B5AC9E] border border-black/50 shadow-2xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. FOUR ANGLED MID-CENTURY WOODEN LEGS WITH RUBBER FEET
         ============================================================ */}
      <div className="w-full relative h-20 sm:h-24 -mt-1.5 pointer-events-none">
        <svg
          viewBox="0 0 500 105"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="frontLegWood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5D3415" />
              <stop offset="38%" stopColor="#A66D3B" />
              <stop offset="70%" stopColor="#7C4B22" />
              <stop offset="100%" stopColor="#46250D" />
            </linearGradient>
            <linearGradient id="backLegWood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B200B" />
              <stop offset="45%" stopColor="#6D401C" />
              <stop offset="100%" stopColor="#2E1808" />
            </linearGradient>
          </defs>

          {/* Soft floor shadow ellipses */}
          <ellipse cx="105" cy="96" rx="22" ry="4" fill="rgba(0,0,0,0.32)" />
          <ellipse cx="136" cy="76" rx="16" ry="3" fill="rgba(0,0,0,0.22)" />
          <ellipse cx="364" cy="76" rx="16" ry="3" fill="rgba(0,0,0,0.22)" />
          <ellipse cx="395" cy="96" rx="22" ry="4" fill="rgba(0,0,0,0.32)" />

          {/* Back-Left Leg */}
          <polygon points="146,0 164,0 140,71 131,71" fill="url(#backLegWood)" />
          <rect x="129" y="70" width="13" height="6" rx="2" fill="#232120" stroke="#78726C" strokeWidth="0.8" />

          {/* Back-Right Leg */}
          <polygon points="336,0 354,0 369,71 360,71" fill="url(#backLegWood)" />
          <rect x="358" y="70" width="13" height="6" rx="2" fill="#232120" stroke="#78726C" strokeWidth="0.8" />

          {/* Front-Left Leg */}
          <polygon points="118,0 143,0 112,90 99,90" fill="url(#frontLegWood)" />
          <rect x="96" y="89" width="18" height="7" rx="2.5" fill="#1F1D1C" stroke="#8C857E" strokeWidth="1" />

          {/* Front-Right Leg */}
          <polygon points="357,0 382,0 401,90 388,90" fill="url(#frontLegWood)" />
          <rect x="386" y="89" width="18" height="7" rx="2.5" fill="#1F1D1C" stroke="#8C857E" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
