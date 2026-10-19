'use client';

import React, { useState, useEffect } from 'react';
import { MemoryLogEntry } from '@/types/database';
import { useApp } from '@/lib/store';
import {
  parseMusicUrl,
  getQrCodeImageUrl,
} from '@/lib/media-helper';
import {
  Star,
  Trash2,
  ExternalLink,
  Repeat,
  Camera,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
  MapPin,
  Heart,
} from 'lucide-react';

interface MemoryBannerWidgetProps {
  memory: MemoryLogEntry;
  monthId: string;
  monthName: string;
  year: number;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const WASHI_STYLES: Array<'rose' | 'gold' | 'sage'> = ['rose', 'gold', 'sage'];

export default function MemoryBannerWidget({
  memory,
  monthId,
  monthName,
  year,
  isEditing,
  onToggleEdit,
}: MemoryBannerWidgetProps) {
  const { deleteMonthMemory, updateMonthMemoryDetails } = useApp();

  // 3D Flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Rating state (1 decimal)
  const [ratingInput, setRatingInput] = useState<string>((memory.rating ?? 10.0).toFixed(1));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Editable fields
  const [titleInput, setTitleInput] = useState(memory.title || '');
  const [locationInput, setLocationInput] = useState(memory.location || '');
  const [genreInput, setGenreInput] = useState(memory.genre || '');
  const [geotagUrlInput, setGeotagUrlInput] = useState(memory.geotagUrl || '');

  // Reflection state
  const [reasonText, setReasonText] = useState(memory.reason || '');
  const [isSaved, setIsSaved] = useState(false);

  // Remove confirmation modal state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setReasonText(memory.reason || '');
  }, [memory.reason]);

  useEffect(() => {
    setRatingInput((memory.rating ?? 10.0).toFixed(1));
  }, [memory.rating]);

  useEffect(() => {
    setTitleInput(memory.title || '');
    setLocationInput(memory.location || '');
    setGenreInput(memory.genre || '');
    setGeotagUrlInput(memory.geotagUrl || '');
  }, [memory.title, memory.location, memory.genre, memory.geotagUrl]);

  const triggerSavedBadge = () => {
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleCycleWashi = () => {
    const current = memory.washiStyle || 'rose';
    const next = WASHI_STYLES[(WASHI_STYLES.indexOf(current) + 1) % WASHI_STYLES.length];
    updateMonthMemoryDetails(monthId, { washiStyle: next });
    triggerSavedBadge();
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReasonText(newText);
    updateMonthMemoryDetails(monthId, { reason: newText });
    triggerSavedBadge();
  };

  const handleRatingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRatingInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      updateMonthMemoryDetails(monthId, { rating: Math.round(num * 10) / 10 });
    }
  };

  const handleStarClick = (starIndex: number) => {
    if (!isEditing) return;
    setRatingInput(starIndex.toFixed(1));
    updateMonthMemoryDetails(monthId, { rating: starIndex });
  };

  const handleDetailBlur = () => {
    updateMonthMemoryDetails(monthId, {
      title: titleInput.trim() || 'Our favorite moment ♡',
      location: locationInput.trim() || `${monthName} ${year}`,
      genre: genreInput.trim() || 'Core Memory',
      geotagUrl: geotagUrlInput.trim() || undefined,
    });
    triggerSavedBadge();
  };

  const parsed = parseMusicUrl(memory.url);

  const canvasBg = memory.canvasColor || '#1B2420';
  const accentColor = memory.accentColor || '#A7E8BD';

  const currentRating = memory.rating ?? 10.0;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  const targetQrUrl = memory.geotagUrl?.trim() || memory.url;
  const qrCodeUrl = getQrCodeImageUrl(targetQrUrl, '18181B', 'FFFFFF', 240);

  const washiStyle = memory.washiStyle || 'rose';
  const washiVisual =
    washiStyle === 'gold'
      ? 'bg-gradient-to-r from-amber-200/85 via-yellow-100/90 to-amber-300/85 border-amber-400/50 text-amber-900'
      : washiStyle === 'sage'
      ? 'bg-gradient-to-r from-emerald-200/85 via-teal-100/90 to-emerald-300/85 border-emerald-400/50 text-emerald-900'
      : 'bg-gradient-to-r from-rose-200/85 via-pink-100/90 to-rose-300/85 border-rose-400/50 text-rose-900';

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2000px] select-none"
        style={{ minHeight: '850px' }}
      >
        <div
          className="w-full relative rounded-3xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1)',
            minHeight: '850px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: Washi-Taped Polaroid & Handwritten Caption
             ======================================================== */}
          <div
            className={`w-full rounded-3xl p-7 sm:p-10 shadow-2xl relative border border-white/15 flex flex-col justify-between ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backgroundColor: canvasBg,
              color: '#FFFFFF',
              boxShadow: `0 30px 70px -15px ${canvasBg}cc, 0 0 50px -10px ${accentColor}44`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '850px',
            }}
          >
            {/* Top Bar: Location Stamp & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-20 mb-2">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white/90 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span>{memory.location || `${monthName} ${year}`}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md cursor-pointer ${
                    isEditing
                      ? 'bg-amber-400 text-stone-900 hover:bg-amber-300 ring-2 ring-amber-300/60'
                      : 'bg-white/15 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 transition-all text-xs font-semibold text-white/90 hover:text-white cursor-pointer shadow-md backdrop-blur-md"
                  title="Flip Polaroid over to read love letter"
                >
                  <Repeat className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Turn Photo Over</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. REALISTIC 3D POLAROID FRAME WITH WASHI TAPE
               ======================================================== */}
            <div className="relative z-10 w-full my-3 flex justify-center">
              <div className="w-full max-w-md relative pt-4 px-4 pb-7 rounded-xl bg-[#FAF6F0] text-[#332426] shadow-[0_25px_60px_rgba(0,0,0,0.65)] border border-[#EDE4D7] transition-transform duration-300 hover:rotate-[0.5deg]">
                {/* Interactive Washi Tape Strip at Top Center */}
                <button
                  type="button"
                  onClick={handleCycleWashi}
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-2 z-30 w-36 h-7 px-3 flex items-center justify-center text-[10px] font-mono font-bold tracking-widest uppercase border shadow-sm backdrop-blur-xs cursor-pointer transition-all hover:scale-105 ${washiVisual}`}
                  title="Click to change Washi Tape pattern!"
                >
                  <span>
                    {washiStyle === 'gold'
                      ? '✦ STARLIGHT ♡'
                      : washiStyle === 'sage'
                      ? '🌿 BOTANICAL ♡'
                      : '🌸 ROSE TAPE ♡'}
                  </span>
                </button>

                {/* Inner Polaroid Snapshot */}
                <div className="w-full aspect-[4/3] rounded-md overflow-hidden bg-stone-900 shadow-inner border border-stone-300 relative">
                  {parsed.platform === 'youtube' && parsed.embedUrl ? (
                    <iframe
                      src={parsed.embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                      title={memory.title || 'Memory Video'}
                    />
                  ) : memory.thumbnailUrl || memory.url ? (
                    <img
                      src={memory.thumbnailUrl || memory.url}
                      alt={memory.title || 'Polaroid Memory'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <Camera className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Classic Thick Polaroid Chin with Handwritten Marker Caption */}
                <div className="mt-4 pt-1 text-center px-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={handleDetailBlur}
                      placeholder="Write Polaroid marker caption..."
                      className="w-full bg-amber-50/80 text-center font-serif italic text-lg sm:text-xl font-semibold text-[#332426] border-b border-amber-500/60 outline-none py-1 rounded"
                    />
                  ) : (
                    <p className="font-serif italic text-lg sm:text-xl font-semibold text-[#332426] leading-snug">
                      “{memory.title || 'A moment we want to keep forever ♡'}”
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================
                2. MEMORY DETAILS: Date/Location, ONLY Vibe Badge, Emotional Weight
               ======================================================== */}
            <div className="relative z-10 text-center space-y-3 my-2">
              {isEditing ? (
                <div className="max-w-md mx-auto space-y-2 bg-black/30 p-3 rounded-2xl border border-amber-400/30">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Location & Date (e.g. Tokyo • October 14, 2026)"
                    className="w-full bg-transparent text-center text-sm sm:text-base font-medium outline-none border-b border-white/15 pb-1"
                    style={{ color: accentColor }}
                  />
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Vibe / Emotion (e.g. Late Night Walk)"
                    className="w-full bg-transparent text-center text-xs uppercase tracking-widest text-amber-200 outline-none pt-0.5"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <p
                    className="font-medium text-sm sm:text-base tracking-widest uppercase"
                    style={{ color: accentColor }}
                  >
                    {memory.location || `${monthName} ${year}`}
                  </p>
                  <div className="flex items-center justify-center">
                    <span
                      className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase border backdrop-blur-md shadow-xs"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.14)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                        color: accentColor,
                      }}
                    >
                      {memory.genre || 'Core Memory'}
                    </span>
                  </div>
                </div>
              )}

              {/* ♡ Emotional Weight Rating (1-decimal precision) */}
              <div className="pt-1 flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 fill-rose-400 mr-1" />
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => (
                    <button
                      key={starIndex}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => handleStarClick(starIndex)}
                      onMouseEnter={() => isEditing && setHoverRating(starIndex)}
                      onMouseLeave={() => isEditing && setHoverRating(null)}
                      className={`p-1 transition-transform ${
                        isEditing ? 'hover:scale-125 cursor-pointer' : 'cursor-default opacity-95'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          starIndex <= displayRating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'text-white/20 fill-white/5'
                        }`}
                      />
                    </button>
                  ))}

                  {isEditing ? (
                    <div className="ml-2 flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-400/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={ratingInput}
                        onChange={handleRatingInputChange}
                        className="w-12 bg-transparent text-sm sm:text-base font-mono font-bold text-amber-300 outline-none text-center"
                      />
                      <span className="font-mono text-xs text-white/50">/ 10</span>
                    </div>
                  ) : (
                    <span className="ml-2 font-mono text-sm sm:text-base font-bold text-amber-300">
                      {currentRating.toFixed(1)} / 10
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <span className="text-[11px] text-amber-300/80 font-mono tracking-wide">
                    Click stars or type decimal to adjust • click Done to lock
                  </span>
                ) : (
                  <span className="text-[11px] text-white/35 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Emotional weight locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="relative z-10 mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
              <a
                href={targetQrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
              >
                <span>Open Full Photo / Map Pin</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-300 transition-colors cursor-pointer text-xs border border-transparent hover:border-red-400/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              BACK SIDE: Classic Dark Polaroid Carbon Back & Love Letter
             ======================================================== */}
          <div
            className={`w-full absolute inset-0 rounded-3xl p-7 sm:p-10 shadow-2xl border border-white/15 flex flex-col justify-between ${
              isFlipped ? 'pointer-events-auto z-30' : 'pointer-events-none z-0'
            }`}
            style={{
              backgroundColor: canvasBg,
              color: '#FFFFFF',
              boxShadow: `0 30px 70px -15px ${canvasBg}cc, 0 0 50px -10px ${accentColor}44`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '850px',
            }}
          >
            {/* Back Top Bar */}
            <div className="flex items-center justify-between relative z-40 mb-2">
              <span className="text-xs uppercase tracking-widest text-white/60 font-mono font-medium">
                Polaroid Carbon Back & Keepsake Letter
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md cursor-pointer ${
                    isEditing
                      ? 'bg-amber-400 text-stone-900 hover:bg-amber-300 ring-2 ring-amber-300/60'
                      : 'bg-white/15 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 border border-white/30 transition-all text-xs font-semibold text-white cursor-pointer shadow-lg backdrop-blur-md relative z-50"
                >
                  <Repeat className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                  <span>Flip Back</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                THE ARTIFACT: DARK CARBON POLAROID BACKING + GEOTAG QR
               ======================================================== */}
            <div className="relative z-30 my-2 flex flex-col items-center">
              <div className="w-full max-w-lg rounded-2xl bg-[#18181B] border-2 border-[#3F3F46] p-5 shadow-2xl flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-300 border border-white/15">
                    POLAROID 600 — {monthId}
                  </span>
                  <h4 className="font-serif italic text-base sm:text-lg text-zinc-100">
                    “{memory.title || 'Our favorite moment ♡'}”
                  </h4>
                  <p className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{memory.location || `${monthName} ${year}`}</span>
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    DEVELOPED BY GOOGLE & NAMI ♡
                  </p>
                </div>

                {/* Scannable Geotag Map Pin QR */}
                <a
                  href={targetQrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex flex-col items-center p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:scale-105 transition-transform"
                  title="Scan or click to open Geotag / Memory Photo"
                >
                  <img src={qrCodeUrl} alt="Geotag QR" className="w-20 h-20 rounded-lg bg-white p-1" />
                  <span className="mt-1 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                    GEOTAG QR
                  </span>
                </a>
              </div>

              {isEditing && (
                <div className="w-full max-w-lg mt-2 flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-amber-300/30 text-xs">
                  <span className="text-amber-200/80 font-mono whitespace-nowrap">Geotag Pin URL:</span>
                  <input
                    type="url"
                    value={geotagUrlInput}
                    onChange={(e) => setGeotagUrlInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Optional: Paste Google Maps location pin link..."
                    className="flex-1 bg-transparent text-white placeholder-white/35 outline-none text-xs"
                  />
                </div>
              )}
            </div>

            {/* ========================================================
                FOLDED LOVE LETTER KEEPSAKE: "If we could pause time..."
               ======================================================== */}
            <div className="relative z-30 my-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/85 flex items-center gap-2 flex-wrap">
                  <span>If we could pause time in this exact second, would we?</span>
                  {isEditing ? (
                    <span className="text-[11px] text-amber-300/80 font-normal lowercase">
                      (editing mode)
                    </span>
                  ) : (
                    <span className="text-[11px] text-white/40 font-normal lowercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>locked • click Edit above to change</span>
                    </span>
                  )}
                </label>
                {isSaved && (
                  <span className="text-[11px] text-emerald-300 font-mono flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved ♡</span>
                  </span>
                )}
              </div>

              {/* Folded Stationery Love Letter Note Area */}
              <div
                className={`flex-1 relative rounded-2xl overflow-hidden border transition-all ${
                  isEditing
                    ? 'border-amber-300/60 bg-[#FAF6F0] text-[#332426] ring-2 ring-amber-300/30'
                    : 'border-[#E6DAC8] bg-[#FAF6F0]/95 text-[#332426]'
                } shadow-inner`}
              >
                {/* Subtle Fold Crease Line Across the Middle of the Letter */}
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#D8C8B4]/70 pointer-events-none" />

                {isEditing ? (
                  <textarea
                    value={reasonText}
                    onChange={handleReasonChange}
                    placeholder="Write a love note on the back of this Polaroid—what did the air feel like, what did we say, and why will we never forget it?"
                    className="w-full h-full min-h-[210px] p-5 text-sm sm:text-base text-[#332426] placeholder-stone-400 bg-transparent outline-none resize-none font-serif italic leading-relaxed relative z-10"
                  />
                ) : (
                  <div
                    onClick={onToggleEdit}
                    className="w-full h-full min-h-[210px] p-5 text-sm sm:text-base text-[#332426] font-serif italic leading-relaxed whitespace-pre-wrap cursor-pointer relative z-10"
                    title="Click Edit to modify"
                  >
                    {reasonText.trim() ? (
                      reasonText
                    ) : (
                      <span className="text-stone-400 italic">
                        No letter written on the back yet. Click &quot;Edit&quot; above to write your keepsake note...
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 right-4 pointer-events-none text-[11px] font-mono text-stone-400 z-10">
                  {reasonText.length} characters
                </div>
              </div>
            </div>

            {/* Back Bottom Bar */}
            <div className="relative z-40 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/60">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Turn Polaroid back over</span>
              </button>

              <span className="font-serif italic text-white/40">
                Ever, Together ♡ Google & Nami
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup Modal for Removing Memory */}
      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsConfirmingDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200 space-y-4"
            style={{
              backgroundColor: canvasBg,
              color: '#FFFFFF',
              boxShadow: `0 25px 60px -10px rgba(0,0,0,0.7), 0 0 35px -5px ${accentColor}33`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center text-red-400">
              <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-serif text-xl font-bold tracking-tight text-white">
                Remove this Polaroid?
              </h4>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed px-2">
                This will delete the logged snapshot and the love letter written on the back for this month.
              </p>
            </div>

            <div className="py-2 px-3 rounded-xl bg-black/30 border border-white/10 text-xs text-white/80 truncate">
              <span className="font-medium text-white">{memory.title || 'Logged Memory'}</span>
              {memory.location && <span className="text-white/50"> • {memory.location}</span>}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-2.5 px-4 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all border border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  deleteMonthMemory(monthId);
                }}
                className="flex-1 py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
