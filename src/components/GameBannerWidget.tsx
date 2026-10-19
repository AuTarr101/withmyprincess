'use client';

import React, { useState, useEffect } from 'react';
import { GameLogEntry } from '@/types/database';
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
  Gamepad2,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
  BatteryCharging,
  Trophy,
  Clock,
  Volume2,
} from 'lucide-react';

interface GameBannerWidgetProps {
  game: GameLogEntry;
  monthId: string;
  monthName: string;
  year: number;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export default function GameBannerWidget({
  game,
  monthId,
  monthName,
  year,
  isEditing,
  onToggleEdit,
}: GameBannerWidgetProps) {
  const { deleteMonthGame, updateMonthGameDetails } = useApp();

  // 3D Flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Rating state (1 decimal)
  const [ratingInput, setRatingInput] = useState<string>((game.rating ?? 9.5).toFixed(1));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Editable fields
  const [titleInput, setTitleInput] = useState(game.title || '');
  const [developerInput, setDeveloperInput] = useState(game.developer || '');
  const [genreInput, setGenreInput] = useState(game.genre || '');
  const [hisRoleInput, setHisRoleInput] = useState(game.hisRole || 'Player 1 🧸');
  const [herRoleInput, setHerRoleInput] = useState(game.herRole || 'Player 2 🐶');
  const [hoursInput, setHoursInput] = useState(game.hoursPlayed || '24.5 hrs');
  const [statusInput, setStatusInput] = useState(game.completionStatus || '100% Completed ♡');

  // Reflection state
  const [reasonText, setReasonText] = useState(game.reason || '');
  const [isSaved, setIsSaved] = useState(false);
  const [chimeActive, setChimeActive] = useState(false);

  // Remove confirmation modal state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setReasonText(game.reason || '');
  }, [game.reason]);

  useEffect(() => {
    setRatingInput((game.rating ?? 9.5).toFixed(1));
  }, [game.rating]);

  useEffect(() => {
    setTitleInput(game.title || '');
    setDeveloperInput(game.developer || '');
    setGenreInput(game.genre || '');
    setHisRoleInput(game.hisRole || 'Player 1 🧸');
    setHerRoleInput(game.herRole || 'Player 2 🐶');
    setHoursInput(game.hoursPlayed || '24.5 hrs');
    setStatusInput(game.completionStatus || '100% Completed ♡');
  }, [
    game.title,
    game.developer,
    game.genre,
    game.hisRole,
    game.herRole,
    game.hoursPlayed,
    game.completionStatus,
  ]);

  const triggerSavedBadge = () => {
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  };

  // Sweet 8-bit GBA Start Chime Easter Egg via Web Audio API
  const playStartChime = () => {
    setChimeActive(true);
    setTimeout(() => setChimeActive(false), 600);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
    } catch {
      // Ignore audio errors if blocked
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReasonText(newText);
    updateMonthGameDetails(monthId, { reason: newText });
    triggerSavedBadge();
  };

  const handleRatingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRatingInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      updateMonthGameDetails(monthId, { rating: Math.round(num * 10) / 10 });
    }
  };

  const handleStarClick = (starIndex: number) => {
    if (!isEditing) return;
    setRatingInput(starIndex.toFixed(1));
    updateMonthGameDetails(monthId, { rating: starIndex });
  };

  const handleDetailBlur = () => {
    updateMonthGameDetails(monthId, {
      title: titleInput.trim() || 'Untitled Game',
      developer: developerInput.trim() || 'Game Studio',
      genre: genreInput.trim() || 'Co-Op Adventure',
      hisRole: hisRoleInput.trim() || 'Player 1 🧸',
      herRole: herRoleInput.trim() || 'Player 2 🐶',
      hoursPlayed: hoursInput.trim() || '24.5 hrs',
      completionStatus: statusInput.trim() || '100% Completed ♡',
    });
    triggerSavedBadge();
  };

  const parsed = parseMusicUrl(game.url);

  const canvasBg = game.canvasColor || '#241834';
  const accentColor = game.accentColor || '#C084FC';

  const currentRating = game.rating ?? 9.8;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  const qrCodeUrl = getQrCodeImageUrl(game.url, '1E142B', 'FFFFFF', 260);
  const goldPins = Array.from({ length: 18 });

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2000px] select-none"
        style={{ minHeight: '840px' }}
      >
        <div
          className="w-full relative rounded-3xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1)',
            minHeight: '840px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: Translucent GBA Cartridge & Co-Op Roles
             ======================================================== */}
          <div
            className={`w-full rounded-3xl p-7 sm:p-10 shadow-2xl relative border-2 border-white/20 flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backgroundColor: canvasBg,
              color: '#FFFFFF',
              boxShadow: `0 30px 70px -15px ${canvasBg}cc, 0 0 50px -10px ${accentColor}44`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '840px',
            }}
          >
            {/* Subtle Translucent Atomic-Purple Circuit Board Traces in Background */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, ${accentColor} 1px, transparent 1px),
                  linear-gradient(180deg, ${accentColor} 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Top Bar: Battery / Press Start Chime & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-20 mb-2">
              <button
                type="button"
                onClick={playStartChime}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide transition-all cursor-pointer border backdrop-blur-md ${
                  chimeActive
                    ? 'bg-emerald-400/30 border-emerald-300 text-emerald-200 scale-105 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                    : 'bg-white/15 hover:bg-white/25 border-white/20 text-emerald-300'
                }`}
                title="Click to play 8-bit Press Start chime!"
              >
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>BATTERY 100%</span>
                <Volume2 className="w-3 h-3 opacity-75" />
              </button>

              <div className="flex items-center gap-2">
                {/* Edit / Done Toggle Button */}
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

                {/* Eject / Flip Cartridge Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 transition-all text-xs font-semibold text-white/90 hover:text-white cursor-pointer shadow-md backdrop-blur-md"
                  title="Flip cartridge to view Save Slot"
                >
                  <Repeat className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Eject Cartridge</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. GBA TRANSLUCENT CARTRIDGE SHELL & GAMEPLAY WINDOW
               ======================================================== */}
            <div className="relative z-10 w-full my-2 flex justify-center">
              <div className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/25 p-3 sm:p-4 shadow-[inset_0_2px_12px_rgba(255,255,255,0.2),0_20px_45px_rgba(0,0,0,0.6)]">
                {/* Cartridge Molded Grip Ridges & Header */}
                <div className="flex flex-col items-center mb-2.5 space-y-1">
                  <div className="w-36 flex flex-col gap-1 opacity-40">
                    <div className="h-1 rounded-full bg-white/60" />
                    <div className="h-1 rounded-full bg-white/60" />
                  </div>
                  <span className="text-[10px] font-mono font-extrabold tracking-[0.25em] uppercase text-white/60">
                    GAME BOY ADVANCE • COUPLE EDITION
                  </span>
                </div>

                {/* Cartridge Sticker Label Frame */}
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border-2 border-white/20 relative shadow-xl">
                  {parsed.platform === 'youtube' && parsed.embedUrl ? (
                    <iframe
                      src={parsed.embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                      title={game.title || 'Gameplay Trailer'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/50 relative">
                      {game.thumbnailUrl ? (
                        <img
                          src={game.thumbnailUrl}
                          alt={game.title || 'Game Cover'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Gamepad2 className="w-16 h-16 text-white/40" />
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Cartridge Serial Bar */}
                <div className="mt-2 flex items-center justify-between px-1 text-[9px] font-mono uppercase tracking-widest text-white/50">
                  <span>AGB-002 • {monthName.slice(0, 3).toUpperCase()}-{year}</span>
                  <span>▼ INSERT THIS SIDE</span>
                  <span>MADE IN LOVE ♡</span>
                </div>
              </div>
            </div>

            {/* ========================================================
                2. SIGNATURE SPICE: CO-OP ROLE BADGES ("Who played who")
               ======================================================== */}
            <div className="relative z-10 max-w-lg w-full mx-auto grid grid-cols-2 gap-2.5 my-2">
              <div className="rounded-2xl bg-black/30 border border-white/15 px-3.5 py-2.5 flex flex-col items-center text-center backdrop-blur-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80">
                  🧸 PLAYER 1 (GOOGLE)
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={hisRoleInput}
                    onChange={(e) => setHisRoleInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="e.g. Cody 🧸"
                    className="w-full mt-0.5 bg-transparent text-center text-xs sm:text-sm font-bold text-white border-b border-amber-300/40 outline-none"
                  />
                ) : (
                  <span className="mt-0.5 text-xs sm:text-sm font-bold text-white">
                    {game.hisRole || 'Cody 🧸'}
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-black/30 border border-white/15 px-3.5 py-2.5 flex flex-col items-center text-center backdrop-blur-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300/80">
                  🐶 PLAYER 2 (NAMI)
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={herRoleInput}
                    onChange={(e) => setHerRoleInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="e.g. May 🐶"
                    className="w-full mt-0.5 bg-transparent text-center text-xs sm:text-sm font-bold text-white border-b border-rose-300/40 outline-none"
                  />
                ) : (
                  <span className="mt-0.5 text-xs sm:text-sm font-bold text-white">
                    {game.herRole || 'May 🐶'}
                  </span>
                )}
              </div>
            </div>

            {/* ========================================================
                3. GAME DETAILS: Title, Studio, ONLY Genre, Joy-Con Rating
               ======================================================== */}
            <div className="relative z-10 text-center space-y-3 my-2">
              {isEditing ? (
                <div className="max-w-md mx-auto space-y-2 bg-black/30 p-3 rounded-2xl border border-amber-400/30">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Game Title (e.g. It Takes Two)"
                    className="w-full bg-transparent text-center font-serif text-xl sm:text-2xl font-bold text-white outline-none border-b border-white/15 pb-1"
                  />
                  <input
                    type="text"
                    value={developerInput}
                    onChange={(e) => setDeveloperInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Developer / Studio (e.g. Hazelight)"
                    className="w-full bg-transparent text-center text-sm sm:text-base font-medium outline-none border-b border-white/15 pb-1"
                    style={{ color: accentColor }}
                  />
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Genre (e.g. Co-Op Adventure)"
                    className="w-full bg-transparent text-center text-xs uppercase tracking-widest text-amber-200 outline-none pt-0.5"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white line-clamp-2">
                    {game.title || 'Untitled Game'}
                  </h3>
                  <p
                    className="font-medium text-base sm:text-lg tracking-wide"
                    style={{ color: accentColor }}
                  >
                    {game.developer || 'Game Studio'}
                  </p>
                </div>
              )}

              {/* ONLY GENRE BADGE */}
              {!isEditing && (
                <div className="flex items-center justify-center pt-0.5">
                  <span
                    className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase border backdrop-blur-md shadow-xs"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.14)',
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                      color: accentColor,
                    }}
                  >
                    {game.genre || 'Co-Op Adventure'}
                  </span>
                </div>
              )}

              {/* 🎮 Joy-Con Rating (1-decimal precision) */}
              <div className="pt-1 flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg mr-1" title="Joy-Con Rating">
                    🎮
                  </span>
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
                    <span>Joy-Con rating locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="relative z-10 mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
              <a
                href={game.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
              >
                <span>Open Game Link</span>
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
              BACK SIDE: Holographic Cartridge Back, Gold Pins & Save Slot
             ======================================================== */}
          <div
            className={`w-full absolute inset-0 rounded-3xl p-7 sm:p-10 shadow-2xl border-2 border-white/20 flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-auto z-30' : 'pointer-events-none z-0'
            }`}
            style={{
              backgroundColor: canvasBg,
              color: '#FFFFFF',
              boxShadow: `0 30px 70px -15px ${canvasBg}cc, 0 0 50px -10px ${accentColor}44`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '840px',
            }}
          >
            {/* Back Top Bar */}
            <div className="flex items-center justify-between relative z-40 mb-2">
              <span className="text-xs uppercase tracking-widest text-white/60 font-mono font-medium">
                Cartridge Back & Save State
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
                THE ARTIFACT: HOLOGRAPHIC CARTRIDGE BACK & SAVE SLOT 01
               ======================================================== */}
            <div className="relative z-30 my-2 flex flex-col items-center">
              <div className="w-full max-w-xl rounded-2xl overflow-hidden border-2 border-white/25 bg-gradient-to-br from-white/15 via-purple-500/15 to-cyan-400/15 backdrop-blur-md shadow-2xl">
                {/* Holographic Gleam Header + Save Slot 01 */}
                <div className="p-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between border-b border-white/15 pb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-gradient-to-r from-pink-400/30 via-purple-400/30 to-cyan-400/30 border border-white/30 text-white">
                        ✦ SAVE SLOT 01 : GOOGLE & NAMI ♡
                      </span>
                      <span className="text-[10px] font-mono text-white/50">
                        SRAM v2.6
                      </span>
                    </div>

                    {/* Save Slot Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl bg-black/35 border border-white/15 p-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-cyan-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Time Played Together</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={hoursInput}
                            onChange={(e) => setHoursInput(e.target.value)}
                            onBlur={handleDetailBlur}
                            className="w-full mt-1 bg-transparent text-sm sm:text-base font-mono font-bold text-white border-b border-cyan-300/50 outline-none"
                          />
                        ) : (
                          <p className="mt-1 text-sm sm:text-base font-mono font-bold text-white">
                            {game.hoursPlayed || '24.5 hrs'}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-black/35 border border-white/15 p-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-300">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Completion Status</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={statusInput}
                            onChange={(e) => setStatusInput(e.target.value)}
                            onBlur={handleDetailBlur}
                            className="w-full mt-1 bg-transparent text-sm sm:text-base font-mono font-bold text-emerald-300 border-b border-amber-300/50 outline-none"
                          />
                        ) : (
                          <p className="mt-1 text-sm sm:text-base font-mono font-bold text-emerald-300">
                            {game.completionStatus || '100% Completed ♡'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Holographic QR Code Sticker */}
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex flex-col items-center p-2.5 rounded-xl bg-white/10 border border-white/25 hover:scale-105 transition-transform"
                    title="Scan or click to open game"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Game QR Code"
                      className="w-20 h-20 rounded-lg bg-white p-1"
                    />
                    <span className="mt-1.5 text-[9px] font-mono uppercase tracking-widest text-white/60">
                      CARTRIDGE QR
                    </span>
                  </a>
                </div>

                {/* Authentic Golden Contact Pins along the bottom of the cartridge */}
                <div className="bg-[#0B1F17] border-t-2 border-emerald-900/80 px-4 pt-2 pb-1">
                  <div className="flex items-end justify-between gap-1">
                    {goldPins.map((_, idx) => (
                      <div
                        key={`pin-${idx}`}
                        className="flex-1 h-5 rounded-t-[2px] bg-gradient-to-b from-[#FFE082] via-[#D4AF37] to-[#9A7B1C] border-x border-amber-200/30 shadow-[0_0_6px_rgba(212,175,55,0.4)]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                BESPOKE QUESTION PROMPT: "Funniest death or best teamwork moment"
               ======================================================== */}
            <div className="relative z-30 my-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/85 flex items-center gap-2 flex-wrap">
                  <span>Funniest death or best teamwork moment</span>
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

              <div
                className={`flex-1 relative rounded-2xl overflow-hidden border transition-all ${
                  isEditing
                    ? 'border-amber-300/50 focus-within:border-amber-300 bg-black/40 ring-1 ring-amber-300/20'
                    : 'border-white/15 bg-black/25'
                }`}
              >
                {isEditing ? (
                  <textarea
                    value={reasonText}
                    onChange={handleReasonChange}
                    placeholder="Write down the funniest fail, boss fight victory, or co-op memory from playing this together..."
                    className="w-full h-full min-h-[200px] p-5 text-sm sm:text-base text-white placeholder-white/40 bg-transparent outline-none resize-none font-serif leading-relaxed"
                  />
                ) : (
                  <div
                    onClick={onToggleEdit}
                    className="w-full h-full min-h-[200px] p-5 text-sm sm:text-base text-white/90 font-serif leading-relaxed whitespace-pre-wrap cursor-pointer"
                    title="Click Edit to modify"
                  >
                    {reasonText.trim() ? (
                      reasonText
                    ) : (
                      <span className="text-white/35 italic">
                        No save log written yet. Click &quot;Edit&quot; above to record your funniest co-op memory...
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 right-4 pointer-events-none text-[11px] font-mono text-white/30">
                  {reasonText.length} characters
                </div>
              </div>
            </div>

            {/* Back Bottom Bar */}
            <div className="relative z-40 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/60">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Return to cartridge front</span>
              </button>

              <span className="font-serif italic text-white/40">
                Ever, Together ♡ Google & Nami
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup Modal for Removing Game */}
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
                Remove this game?
              </h4>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed px-2">
                This will erase the logged cartridge, co-op roles, and save slot notes for this month.
              </p>
            </div>

            <div className="py-2 px-3 rounded-xl bg-black/30 border border-white/10 text-xs text-white/80 truncate">
              <span className="font-medium text-white">{game.title || 'Logged Game'}</span>
              {game.developer && <span className="text-white/50"> • {game.developer}</span>}
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
                  deleteMonthGame(monthId);
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
