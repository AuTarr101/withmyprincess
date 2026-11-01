'use client';

import React, { useState, useEffect } from 'react';
import { GameLogEntry } from '@/types/database';
import { useApp } from '@/lib/store';
import {
  parseMusicUrl,
  getQrCodeImageUrl,
} from '@/lib/media-helper';
import RetroTvFrame from './RetroTvFrame';
import {
  Trash2,
  ExternalLink,
  Repeat,
  Gamepad2,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
  Trophy,
  Clock,
  Tv,
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
  const [hoursInput, setHoursInput] = useState(game.hoursPlayed || '24.5 hrs');
  const [statusInput, setStatusInput] = useState(game.completionStatus || '100% Completed ♡');

  // Reflection state
  const [reasonText, setReasonText] = useState(game.reason || '');
  const [isSaved, setIsSaved] = useState(false);

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
    setHoursInput(game.hoursPlayed || '24.5 hrs');
    setStatusInput(game.completionStatus || '100% Completed ♡');
  }, [
    game.title,
    game.developer,
    game.genre,
    game.hoursPlayed,
    game.completionStatus,
  ]);

  const triggerSavedBadge = () => {
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
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
      hoursPlayed: hoursInput.trim() || '24.5 hrs',
      completionStatus: statusInput.trim() || '100% Completed ♡',
    });
    triggerSavedBadge();
  };

  const parsed = parseMusicUrl(game.url);

  const currentRating = game.rating ?? 9.8;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  // Vintage paper & ink QR code for the TV backplate sticker
  const qrCodeUrl = getQrCodeImageUrl(game.url, '1D1A18', 'EDE6DA', 260);
  const ventSlots = Array.from({ length: 12 });

  // Shared wood cabinet & inner bezel styles matching the Retro CRT TV
  const woodCabinetStyle: React.CSSProperties = {
    background:
      'linear-gradient(180deg, #A56A38 0%, #865024 18%, #73421B 52%, #5F3514 85%, #4B280E 100%)',
    boxShadow:
      '0 30px 70px -15px rgba(20,10,4,0.75), inset 0 2px 3px rgba(255,225,190,0.35), inset 0 -4px 6px rgba(35,18,6,0.75)',
  };

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2000px] select-none"
        style={{ minHeight: '880px' }}
      >
        <div
          className="w-full relative rounded-[32px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1)',
            minHeight: '880px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: Walnut Wood TV Console & Co-Op Controls
             ======================================================== */}
          <div
            className={`w-full rounded-[32px] p-3 sm:p-4 relative border-2 border-[#4E2C12] flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              ...woodCabinetStyle,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '880px',
            }}
          >
            {/* Subtle Walnut Wood Grain Overlay */}
            <div
              className="absolute inset-0 rounded-[32px] opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(40,18,5,0.24) 0px, rgba(40,18,5,0.24) 2px, transparent 2px, transparent 9px)',
              }}
            />

            {/* Metallic Warm Cream/Silver Inner Frame Bezel (matches TV bezel) */}
            <div className="relative flex-1 rounded-[24px] p-1.5 sm:p-2 bg-gradient-to-b from-[#E5DDD0] via-[#CFC5B6] to-[#9E9385] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_10px_rgba(0,0,0,0.65)] border border-[#2C241E] flex flex-col">
              {/* Dark Charcoal Console Interior */}
              <div className="flex-1 rounded-[18px] bg-[#1B1816] px-4 py-5 sm:px-8 sm:py-7 flex flex-col justify-between shadow-[inset_0_6px_18px_rgba(0,0,0,0.9)] border border-black text-[#EDE6DA]">
                {/* Top Control Bar: Ochre-Gold & Bakelite Cream Switches */}
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-20 mb-1">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider border bg-[#282320] border-[#C29438]/50 text-[#E5BC38] shadow-md">
                    <Tv className="w-3.5 h-3.5 text-[#E5BC38]" />
                    <span>CH 03 • TELEVISION</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit / Done Toggle Button */}
                    <button
                      type="button"
                      onClick={onToggleEdit}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer border ${
                        isEditing
                          ? 'bg-gradient-to-b from-[#E5BC38] to-[#C29438] text-[#1D1A18] border-[#F5D78B] ring-2 ring-[#E5BC38]/40'
                          : 'bg-[#282320] hover:bg-[#332D29] border-[#CFC5B6]/25 text-[#EDE6DA]'
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

                    {/* Flip TV Backplate Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(true);
                      }}
                      className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-b from-[#EDE6DA] to-[#C9C0B3] hover:from-[#F7F2E9] hover:to-[#D8CFC2] active:scale-95 border border-[#3A2E21] transition-all text-xs font-semibold text-[#1D1A18] cursor-pointer shadow-md"
                      title="Flip to the back of the TV to view Save Slot & Co-Op Notes"
                    >
                      <Repeat className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Flip TV Back</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================
                    1. VINTAGE WOODEN CRT TV WITH ANTENNAS, KNOBS & LEGS
                   ======================================================== */}
                <div className="relative z-10 w-full my-1 flex flex-col items-center">
                  <RetroTvFrame
                    channelLabel={`CH 03 • ${monthName.slice(0, 3).toUpperCase()} ${year}`}
                  >
                    {parsed.platform === 'youtube' && parsed.embedUrl ? (
                      <iframe
                        src={parsed.embedUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full relative z-10"
                        title={game.title || 'Gameplay Trailer'}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/70 relative">
                        {game.thumbnailUrl ? (
                          <img
                            src={game.thumbnailUrl}
                            alt={game.title || 'Game Cover'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Gamepad2 className="w-16 h-16 text-[#EDE6DA]/40" />
                        )}
                      </div>
                    )}
                  </RetroTvFrame>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#B7AEA0]/60 -mt-1 text-center">
                    Tip: Click the TV knobs to switch to Color Bars or toggle scanlines
                  </span>
                </div>

                {/* ========================================================
                    2. GAME DETAILS: Title, Studio, Genre Plate & Vintage VU Meter
                   ======================================================== */}
                <div className="relative z-10 text-center space-y-2.5 my-2">
                  {isEditing ? (
                    <div className="max-w-md mx-auto space-y-2 bg-[#141210] p-3.5 rounded-md border border-[#4A3D2C]">
                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={handleDetailBlur}
                        placeholder="Game Title (e.g. It Takes Two)"
                        className="w-full bg-transparent text-center font-serif text-xl sm:text-2xl font-bold text-[#EDE6DA] outline-none border-b border-white/15 pb-1"
                      />
                      <input
                        type="text"
                        value={developerInput}
                        onChange={(e) => setDeveloperInput(e.target.value)}
                        onBlur={handleDetailBlur}
                        placeholder="Developer / Studio (e.g. Hazelight)"
                        className="w-full bg-transparent text-center text-sm sm:text-base font-medium text-[#C8A45D] outline-none border-b border-white/15 pb-1"
                      />
                      <input
                        type="text"
                        value={genreInput}
                        onChange={(e) => setGenreInput(e.target.value)}
                        onBlur={handleDetailBlur}
                        placeholder="Genre (e.g. Co-Op Adventure)"
                        className="w-full bg-transparent text-center text-xs uppercase tracking-widest text-[#EDE6DA]/80 outline-none pt-0.5"
                      />
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F0E9DC] line-clamp-2">
                        {game.title || 'Untitled Game'}
                      </h3>
                      <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.18em] text-[#B59A66]">
                        {game.developer || 'Game Studio'}
                      </p>
                    </div>
                  )}

                  {/* Stamped Antique Brass Genre Tag */}
                  {!isEditing && (
                    <div className="flex items-center justify-center pt-0.5">
                      <span className="px-3.5 py-0.5 rounded-xs text-[10px] font-mono uppercase tracking-[0.22em] border border-[#5C4B32] bg-[#241E18] text-[#C8B288]">
                        {game.genre || 'Co-Op Adventure'}
                      </span>
                    </div>
                  )}

                  {/* 1970s Analog Signal / VU Meter + Mechanical Split-Flap Readout */}
                  <div className="pt-2 max-w-md w-full mx-auto flex flex-col items-center gap-1.5">
                    <div className="w-full rounded-md bg-[#12100E] border border-[#3F3528] px-3.5 py-2.5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3">
                      {/* Left engraved gauge label */}
                      <div className="flex flex-col items-start text-left shrink-0">
                        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#8E7C5E]">
                          SIGNAL
                        </span>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#61543F]">
                          VU · dB
                        </span>
                      </div>

                      {/* Center 10-segment backlit analog tuner bar */}
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="grid grid-cols-10 gap-1 items-end h-5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((segIndex) => {
                            const isLit = segIndex <= Math.round(displayRating);
                            const isPeak = segIndex >= 8;
                            return (
                              <button
                                key={segIndex}
                                type="button"
                                disabled={!isEditing}
                                onClick={() => handleStarClick(segIndex)}
                                onMouseEnter={() => isEditing && setHoverRating(segIndex)}
                                onMouseLeave={() => isEditing && setHoverRating(null)}
                                title={
                                  isEditing
                                    ? `Set signal rating to ${segIndex}.0 / 10`
                                    : `${currentRating.toFixed(1)} / 10`
                                }
                                className={`h-full rounded-[1px] border transition-all ${
                                  isEditing ? 'cursor-pointer hover:opacity-100' : 'cursor-default'
                                } ${
                                  isLit
                                    ? isPeak
                                      ? 'bg-[#C86D3B] border-[#E08B58] shadow-[0_0_6px_rgba(200,109,59,0.45)]'
                                      : 'bg-[#C9A86A] border-[#DFC288] shadow-[0_0_5px_rgba(201,168,106,0.35)]'
                                    : 'bg-[#1E1B18] border-[#2C2620]'
                                }`}
                              />
                            );
                          })}
                        </div>
                        {/* Calibrated scale ticks */}
                        <div className="grid grid-cols-10 text-[8px] font-mono text-[#6E604B] text-center leading-none">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <span key={n}>{n}</span>
                          ))}
                        </div>
                      </div>

                      {/* Right mechanical split-flap drum counter */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 bg-[#1B1815] px-2 py-1 rounded border border-[#6E5B3E] shrink-0">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={ratingInput}
                            onChange={handleRatingInputChange}
                            className="w-11 bg-transparent text-xs sm:text-sm font-mono font-bold text-[#E6DEC8] outline-none text-center"
                          />
                          <span className="font-mono text-[10px] text-[#8E7C5E]">/10</span>
                        </div>
                      ) : (
                        <div className="bg-[#1A1714] border border-[#4A3E2D] px-2.5 py-1 rounded-xs shadow-inner shrink-0 flex items-baseline gap-1">
                          <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-[#E6DEC8]">
                            {currentRating.toFixed(1)}
                          </span>
                          <span className="font-mono text-[9px] text-[#7D6D52]">/10</span>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <span className="text-[10px] text-[#B59A66] font-mono tracking-wider uppercase">
                        Click meter bars or type decimal • Done to lock
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#7D6D52] font-mono uppercase tracking-widest flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Meter calibrated</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="relative z-10 mt-4 pt-3.5 border-t border-[#CFC5B6]/15 flex items-center justify-between">
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#CFC5B6]/75 hover:text-[#EDE6DA] transition-colors"
                  >
                    <span>Open Game Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-[#C94A29]/20 text-[#CFC5B6]/55 hover:text-[#E8836B] transition-colors cursor-pointer text-xs border border-transparent hover:border-[#C94A29]/40"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              BACK SIDE: Walnut Wood TV Rear Service Panel & Save Log
             ======================================================== */}
          <div
            className={`w-full absolute inset-0 rounded-[32px] p-3 sm:p-4 border-2 border-[#4E2C12] flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-auto z-30' : 'pointer-events-none z-0'
            }`}
            style={{
              ...woodCabinetStyle,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '880px',
            }}
          >
            {/* Subtle Walnut Wood Grain Overlay */}
            <div
              className="absolute inset-0 rounded-[32px] opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(40,18,5,0.24) 0px, rgba(40,18,5,0.24) 2px, transparent 2px, transparent 9px)',
              }}
            />

            {/* Metallic Warm Cream/Silver Inner Frame Bezel */}
            <div className="relative flex-1 rounded-[24px] p-1.5 sm:p-2 bg-gradient-to-b from-[#E5DDD0] via-[#CFC5B6] to-[#9E9385] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_10px_rgba(0,0,0,0.65)] border border-[#2C241E] flex flex-col">
              {/* Recessed Dark Bakelite Rear TV Backplate */}
              <div className="flex-1 rounded-[18px] bg-[#1B1816] px-4 py-5 sm:px-8 sm:py-7 flex flex-col justify-between shadow-[inset_0_6px_18px_rgba(0,0,0,0.9)] border border-black text-[#EDE6DA]">
                {/* Back Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-40 mb-2">
                  <span className="text-xs uppercase tracking-widest text-[#C29438] font-mono font-bold">
                    TV Rear Service Panel • Save Slot 01
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onToggleEdit}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer border ${
                        isEditing
                          ? 'bg-gradient-to-b from-[#E5BC38] to-[#C29438] text-[#1D1A18] border-[#F5D78B] ring-2 ring-[#E5BC38]/40'
                          : 'bg-[#282320] hover:bg-[#332D29] border-[#CFC5B6]/25 text-[#EDE6DA]'
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
                      className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-b from-[#EDE6DA] to-[#C9C0B3] hover:from-[#F7F2E9] hover:to-[#D8CFC2] active:scale-95 border border-[#3A2E21] transition-all text-xs font-semibold text-[#1D1A18] cursor-pointer shadow-md relative z-50"
                    >
                      <Repeat className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                      <span>Flip to TV Front</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================
                    THE ARTIFACT: VINTAGE TV REAR MANUFACTURER PLATE & SAVE STATE
                   ======================================================== */}
                <div className="relative z-30 my-2 flex flex-col items-center">
                  <div className="w-full rounded-2xl overflow-hidden border-2 border-[#3C352E] bg-[#231F1D] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_12px_30px_rgba(0,0,0,0.5)]">
                    {/* Top 7-Color Rainbow Ribbon Accent (matches TV Color Bars) */}
                    <div className="h-2 w-full grid grid-cols-7">
                      <div className="bg-[#C94A29]" />
                      <div className="bg-[#E5BC38]" />
                      <div className="bg-[#A9B867]" />
                      <div className="bg-[#7399B2]" />
                      <div className="bg-[#DFDDD6]" />
                      <div className="bg-[#649BB5]" />
                      <div className="bg-[#87C37F]" />
                    </div>

                    <div className="p-5 flex flex-col sm:flex-row items-center gap-5">
                      <div className="flex-1 space-y-3 w-full">
                        {/* Stamped Brass Header */}
                        <div className="flex items-center justify-between border-b border-[#CFC5B6]/15 pb-2">
                          <span
                            className="px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#1D1A18] border border-[#3B2B10]"
                            style={{
                              background: 'linear-gradient(180deg, #D9AD4E 0%, #C29438 100%)',
                            }}
                          >
                            ★ SAVE SLOT 01 : GOOGLE &amp; NAMI ♡
                          </span>
                          <span className="text-[10px] font-mono text-[#B7AEA0]/70">
                            MODEL CT-{year}
                          </span>
                        </div>

                        {/* Save Slot Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="rounded-xl bg-[#181514] border border-[#C29438]/30 p-3 shadow-inner">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#E5BC38]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Time Played Together</span>
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={hoursInput}
                                onChange={(e) => setHoursInput(e.target.value)}
                                onBlur={handleDetailBlur}
                                className="w-full mt-1 bg-transparent text-sm sm:text-base font-mono font-bold text-[#EDE6DA] border-b border-[#E5BC38]/50 outline-none"
                              />
                            ) : (
                              <p className="mt-1 text-sm sm:text-base font-mono font-bold text-[#EDE6DA]">
                                {game.hoursPlayed || '24.5 hrs'}
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl bg-[#181514] border border-[#87C37F]/35 p-3 shadow-inner">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#87C37F]">
                              <Trophy className="w-3.5 h-3.5" />
                              <span>Completion Status</span>
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={statusInput}
                                onChange={(e) => setStatusInput(e.target.value)}
                                onBlur={handleDetailBlur}
                                className="w-full mt-1 bg-transparent text-sm sm:text-base font-mono font-bold text-[#87C37F] border-b border-[#87C37F]/50 outline-none"
                              />
                            ) : (
                              <p className="mt-1 text-sm sm:text-base font-mono font-bold text-[#87C37F]">
                                {game.completionStatus || '100% Completed ♡'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Vintage Cream Paper Serial Label + QR Code */}
                      <a
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex flex-col items-center p-2.5 rounded-xl bg-[#EDE6DA] text-[#1D1A18] border-2 border-[#9E9385] hover:scale-105 transition-transform shadow-md"
                        title="Scan or click to open game"
                      >
                        <img
                          src={qrCodeUrl}
                          alt="Game QR Code"
                          className="w-20 h-20 rounded"
                        />
                        <span className="mt-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[#3A2E21]">
                          SERIAL QR
                        </span>
                      </a>
                    </div>

                    {/* Molded TV Rear Ventilation Louver Slots (matches front speaker grille) */}
                    <div className="bg-[#161312] border-t border-[#3C352E] px-5 py-2.5">
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                        {ventSlots.map((_, idx) => (
                          <div
                            key={`vent-${idx}`}
                            className="h-2 rounded-full bg-[#0C0A09] border-b border-white/10 shadow-inner"
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
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5BC38] flex items-center gap-2 flex-wrap">
                      <span>Funniest death or best teamwork moment</span>
                      {isEditing ? (
                        <span className="text-[11px] text-[#EDE6DA]/70 font-normal lowercase">
                          (editing mode)
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#B7AEA0]/45 font-normal lowercase flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>locked • click Edit above to change</span>
                        </span>
                      )}
                    </label>
                    {isSaved && (
                      <span className="text-[11px] text-[#87C37F] font-mono flex items-center gap-1 animate-in fade-in">
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved ♡</span>
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex-1 relative rounded-2xl overflow-hidden border transition-all ${
                      isEditing
                        ? 'border-[#E5BC38]/70 bg-[#141210] ring-1 ring-[#E5BC38]/25'
                        : 'border-[#3C352E] bg-[#141210]'
                    }`}
                  >
                    {isEditing ? (
                      <textarea
                        value={reasonText}
                        onChange={handleReasonChange}
                        placeholder="Write down the funniest fail, boss fight victory, or co-op memory from playing this together..."
                        className="w-full h-full min-h-[210px] p-5 text-sm sm:text-base text-[#EDE6DA] placeholder-[#B7AEA0]/35 bg-transparent outline-none resize-none font-serif leading-relaxed"
                      />
                    ) : (
                      <div
                        onClick={onToggleEdit}
                        className="w-full h-full min-h-[210px] p-5 text-sm sm:text-base text-[#EDE6DA]/90 font-serif leading-relaxed whitespace-pre-wrap cursor-pointer"
                        title="Click Edit to modify"
                      >
                        {reasonText.trim() ? (
                          reasonText
                        ) : (
                          <span className="text-[#B7AEA0]/40 italic">
                            No save log written yet. Click &quot;Edit&quot; above to record your funniest co-op memory...
                          </span>
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-3 right-4 pointer-events-none text-[11px] font-mono text-[#B7AEA0]/35">
                      {reasonText.length} characters
                    </div>
                  </div>
                </div>

                {/* Back Bottom Bar */}
                <div className="relative z-40 pt-3.5 border-t border-[#CFC5B6]/15 flex items-center justify-between text-xs text-[#B7AEA0]/65">
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="hover:text-[#EDE6DA] transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Return to TV screen</span>
                  </button>

                  <span className="font-serif italic text-[#B7AEA0]/50">
                    Ever, Together ♡ Google &amp; Nami
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CONFIRMATION POPUP MODAL FOR REMOVING GAME (Wood & Bakelite Theme)
         ======================================================== */}
      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsConfirmingDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-[26px] p-2.5 shadow-2xl border-2 border-[#4E2C12] animate-in zoom-in-95 duration-200"
            style={woodCabinetStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[20px] p-1 bg-gradient-to-b from-[#E5DDD0] via-[#CFC5B6] to-[#9E9385]">
              <div className="rounded-[16px] bg-[#1B1816] p-6 text-center space-y-4 text-[#EDE6DA]">
                <div className="flex justify-center text-[#E8836B]">
                  <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-serif text-xl font-bold tracking-tight text-[#F5EFE6]">
                    Remove this game?
                  </h4>
                  <p className="text-xs sm:text-sm text-[#B7AEA0] leading-relaxed px-2">
                    This will erase the tuned game, co-op roles, and save slot notes for this month.
                  </p>
                </div>

                <div className="py-2 px-3 rounded-xl bg-[#141210] border border-[#3C352E] text-xs text-[#EDE6DA] truncate">
                  <span className="font-medium">{game.title || 'Logged Game'}</span>
                  {game.developer && <span className="text-[#B7AEA0]"> • {game.developer}</span>}
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#282320] hover:bg-[#332D29] active:scale-95 text-[#EDE6DA] text-xs sm:text-sm font-semibold transition-all border border-[#CFC5B6]/25 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      deleteMonthGame(monthId);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#C94A29] hover:bg-[#B33F20] active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer"
                  >
                    Yes, Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
