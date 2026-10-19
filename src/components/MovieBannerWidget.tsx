'use client';

import React, { useState, useEffect } from 'react';
import { MovieLogEntry } from '@/types/database';
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
  Film,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  LightbulbOff,
  Ticket,
} from 'lucide-react';

interface MovieBannerWidgetProps {
  movie: MovieLogEntry;
  monthId: string;
  monthName: string;
  year: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  isDimmed: boolean;
  onToggleDim: () => void;
}

export default function MovieBannerWidget({
  movie,
  monthId,
  monthName,
  year,
  isEditing,
  onToggleEdit,
  isDimmed,
  onToggleDim,
}: MovieBannerWidgetProps) {
  const {
    deleteMonthMovie,
    updateMonthMovieRating,
    updateMonthMovieReason,
    updateMonthMovieDetails,
  } = useApp();

  // 3D Flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Rating editing state (1 decimal point e.g. 9.8)
  const [ratingInput, setRatingInput] = useState<string>((movie.rating ?? 9.5).toFixed(1));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Editable metadata fields when in Edit mode
  const [titleInput, setTitleInput] = useState(movie.title || '');
  const [directorInput, setDirectorInput] = useState(movie.director || '');
  const [genreInput, setGenreInput] = useState(movie.genre || '');
  const [ticketUrlInput, setTicketUrlInput] = useState(movie.ticketUrl || '');

  // Reflection state with auto-save
  const [reasonText, setReasonText] = useState(movie.reason || '');
  const [isSaved, setIsSaved] = useState(false);

  // Remove confirmation modal state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setReasonText(movie.reason || '');
  }, [movie.reason]);

  useEffect(() => {
    setRatingInput((movie.rating ?? 9.5).toFixed(1));
  }, [movie.rating]);

  useEffect(() => {
    setTitleInput(movie.title || '');
    setDirectorInput(movie.director || '');
    setGenreInput(movie.genre || '');
    setTicketUrlInput(movie.ticketUrl || '');
  }, [movie.title, movie.director, movie.genre, movie.ticketUrl]);

  const triggerSavedBadge = () => {
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReasonText(newText);
    updateMonthMovieReason(monthId, newText);
    triggerSavedBadge();
  };

  const handleRatingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRatingInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      updateMonthMovieRating(monthId, Math.round(num * 10) / 10);
    }
  };

  const handleStarClick = (starIndex: number) => {
    if (!isEditing) return;
    const newRating = starIndex;
    setRatingInput(newRating.toFixed(1));
    updateMonthMovieRating(monthId, newRating);
  };

  const handleDetailBlur = () => {
    updateMonthMovieDetails(monthId, {
      title: titleInput.trim() || 'Untitled Film',
      director: directorInput.trim() || 'Cinema Release',
      genre: genreInput.trim() || 'Romance / Cinema',
      ticketUrl: ticketUrlInput.trim() || undefined,
    });
    triggerSavedBadge();
  };

  const parsed = parseMusicUrl(movie.url);

  // Colors
  const canvasBg = isDimmed ? '#08060A' : movie.canvasColor || '#1E162B';
  const accentColor = movie.accentColor || '#F4C95D';

  const currentRating = movie.rating ?? 9.5;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  // Scannable QR Code for the Golden Ticket Stub (links to Letterboxd/IMDb/YouTube)
  const targetQrUrl = movie.ticketUrl?.trim() || movie.url;
  const qrCodeUrl = getQrCodeImageUrl(targetQrUrl, '2A1A1F', 'FFFDF7', 280);

  // 14 sprocket holes for the 35mm film strip rails
  const sprocketHoles = Array.from({ length: 14 });

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2000px] select-none"
        style={{ minHeight: '820px' }}
      >
        <div
          className="w-full relative rounded-3xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1)',
            minHeight: '820px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: 35mm Film Reel Frame & Midnight Screening
             ======================================================== */}
          <div
            className={`w-full rounded-3xl p-7 sm:p-10 shadow-2xl relative border border-white/15 flex flex-col justify-between transition-colors duration-700 ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backgroundColor: canvasBg,
              color: '#FFFFFF',
              boxShadow: isDimmed
                ? `0 35px 90px -10px rgba(0,0,0,0.95), 0 0 80px -15px ${accentColor}55`
                : `0 30px 70px -15px ${canvasBg}cc, 0 0 50px -10px ${accentColor}44`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '820px',
            }}
          >
            {/* Subtle overhead cinema projector beam when Lights Dimmed */}
            {isDimmed && (
              <div
                className="absolute inset-x-0 top-0 h-72 pointer-events-none opacity-25 rounded-t-3xl transition-opacity duration-700"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${accentColor}, transparent 70%)`,
                }}
              />
            )}

            {/* Top Bar: "Dim Lights" Toggle & Action Buttons (Edit/Done + Flip Ticket) */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-20 mb-3">
              {/* Interactive Spice: Dim the Lights Theatre Toggle */}
              <button
                type="button"
                onClick={onToggleDim}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-md backdrop-blur-md border ${
                  isDimmed
                    ? 'bg-amber-400/20 border-amber-300/60 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                    : 'bg-white/15 hover:bg-white/25 border-white/20 text-white/90 hover:text-white'
                }`}
                title={isDimmed ? 'Turn theatre lights back on' : 'Dim the lights for midnight screening mode'}
              >
                {isDimmed ? (
                  <>
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Lights On</span>
                  </>
                ) : (
                  <>
                    <LightbulbOff className="w-3.5 h-3.5" />
                    <span>🎬 Dim Lights</span>
                  </>
                )}
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
                  title={isEditing ? 'Save and lock edits' : 'Edit rating, details, and reflection'}
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

                {/* Corner Flip Ticket Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 transition-all text-xs font-semibold text-white/90 hover:text-white cursor-pointer shadow-md backdrop-blur-md"
                  title="Flip to view Golden Cinema Ticket Stub"
                >
                  <Ticket className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Flip Ticket</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. 35MM PERFORATED FILM STRIP FRAME AROUND TRAILER
               ======================================================== */}
            <div className="relative z-10 w-full my-3 flex justify-center">
              <div
                className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-[#0B090E] p-2 sm:p-3 transition-shadow duration-700"
                style={{
                  boxShadow: isDimmed
                    ? `0 0 55px -5px ${accentColor}55, 0 20px 50px rgba(0,0,0,0.9)`
                    : '0 20px 45px rgba(0,0,0,0.65)',
                }}
              >
                {/* Top 35mm Sprocket Holes & Edge Code */}
                <div className="space-y-1.5 mb-2">
                  <div className="flex items-center justify-between px-1 text-[9px] font-mono tracking-widest uppercase text-amber-400/60">
                    <span>KODAK 5219 • 35MM</span>
                    <span>▶ MIDNIGHT SCREENING</span>
                    <span>10A</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 px-1 py-0.5">
                    {sprocketHoles.map((_, idx) => (
                      <span
                        key={`top-${idx}`}
                        className="w-3 sm:w-3.5 h-2 sm:h-2.5 rounded-[2px] bg-white/15 border border-white/10 shadow-inner"
                      />
                    ))}
                  </div>
                </div>

                {/* Inner 16:9 Cinema Screen */}
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border border-white/10 relative">
                  {parsed.platform === 'youtube' && parsed.embedUrl ? (
                    <iframe
                      src={parsed.embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                      title={movie.title || 'Movie Trailer'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/60 relative group">
                      {movie.thumbnailUrl ? (
                        <img
                          src={movie.thumbnailUrl}
                          alt={movie.title || 'Movie Poster'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="w-16 h-16 text-white/40" />
                      )}
                      <a
                        href={movie.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white border border-white/30">
                          Open Film Link ↗
                        </span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom 35mm Sprocket Holes & Couple Edge Stamp */}
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center justify-between gap-1.5 px-1 py-0.5">
                    {sprocketHoles.map((_, idx) => (
                      <span
                        key={`bot-${idx}`}
                        className="w-3 sm:w-3.5 h-2 sm:h-2.5 rounded-[2px] bg-white/15 border border-white/10 shadow-inner"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-1 text-[9px] font-mono tracking-widest uppercase text-amber-400/60">
                    <span>EVER TOGETHER ♡</span>
                    <span>GOOGLE & NAMI</span>
                    <span>{monthName.slice(0, 3).toUpperCase()} {year}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                2. MOVIE DETAILS (BELOW): Title, Director, ONLY Genre, Popcorn Rating
               ======================================================== */}
            <div className="relative z-10 text-center space-y-4 my-3">
              {/* Movie Title & Director (Editable when in Edit mode) */}
              {isEditing ? (
                <div className="max-w-md mx-auto space-y-2 bg-black/30 p-3 rounded-2xl border border-amber-400/30">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Movie Title (e.g. La La Land)"
                    className="w-full bg-transparent text-center font-serif text-xl sm:text-2xl font-bold text-white placeholder-white/40 outline-none border-b border-white/15 pb-1"
                  />
                  <input
                    type="text"
                    value={directorInput}
                    onChange={(e) => setDirectorInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Director / Studio (e.g. Damien Chazelle)"
                    className="w-full bg-transparent text-center text-sm sm:text-base font-medium outline-none border-b border-white/15 pb-1"
                    style={{ color: accentColor }}
                  />
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Genre (e.g. Romance / Musical)"
                    className="w-full bg-transparent text-center text-xs uppercase tracking-widest text-amber-200 outline-none pt-0.5"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white line-clamp-2 drop-shadow-sm">
                    {movie.title || 'Untitled Film'}
                  </h3>
                  <p
                    className="font-medium text-base sm:text-lg tracking-wide"
                    style={{ color: accentColor }}
                  >
                    {movie.director || 'Cinema Release'}
                  </p>
                </div>
              )}

              {/* ONLY GENRE BADGE */}
              {!isEditing && (
                <div className="flex items-center justify-center pt-1">
                  <span
                    className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase border backdrop-blur-md shadow-xs"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.14)',
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                      color: accentColor,
                    }}
                  >
                    {movie.genre || 'Romance / Cinema'}
                  </span>
                </div>
              )}

              {/* 🍿 Popcorn Meter / Rating (1-decimal precision, locked unless isEditing) */}
              <div className="pt-2 flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg mr-1" title="Popcorn Meter">
                    🍿
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
                        isEditing
                          ? 'hover:scale-125 cursor-pointer'
                          : 'cursor-default opacity-95'
                      }`}
                      title={isEditing ? `Click to rate ${starIndex}/10` : 'Click Edit to adjust rating'}
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

                  {/* Rating numerical badge with one decimal point */}
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
                        title="Edit decimal rating"
                      />
                      <span className="font-mono text-xs text-white/50">/ 10</span>
                    </div>
                  ) : (
                    <span className="ml-2 font-mono text-sm sm:text-base font-bold text-amber-300">
                      {currentRating.toFixed(1)} / 10
                    </span>
                  )}
                </div>

                {/* Edit hint indicator */}
                {isEditing ? (
                  <span className="text-[11px] text-amber-300/80 font-mono tracking-wide">
                    Click stars or type decimal to adjust • click Done to lock
                  </span>
                ) : (
                  <span className="text-[11px] text-white/35 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Popcorn meter locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions Row: Link to trailer & Remove button */}
            <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
              <a
                href={movie.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
              >
                <span>
                  Open in{' '}
                  {movie.platform === 'letterboxd'
                    ? 'Letterboxd'
                    : movie.platform === 'imdb'
                    ? 'IMDb'
                    : 'YouTube'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-300 transition-colors cursor-pointer text-xs border border-transparent hover:border-red-400/30"
                title="Remove logged movie"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              BACK SIDE: Golden Foil Cinema Ticket Stub + Reflection
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
              minHeight: '820px',
            }}
          >
            {/* Ambient dot pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none rounded-3xl"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, ${accentColor} 1.5px, transparent 0)`,
                backgroundSize: '28px 28px',
              }}
            />

            {/* Back Side Top Bar: Section Title & Buttons (Edit/Done & Flip Back) */}
            <div className="flex items-center justify-between relative z-40 mb-3">
              <span className="text-xs uppercase tracking-widest text-white/60 font-mono font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Cinema Ticket Stub & Memory</span>
              </span>

              <div className="flex items-center gap-2">
                {/* Edit / Done Toggle Button on Back Side */}
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md cursor-pointer ${
                    isEditing
                      ? 'bg-amber-400 text-stone-900 hover:bg-amber-300 ring-2 ring-amber-300/60'
                      : 'bg-white/15 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white'
                  }`}
                  title={isEditing ? 'Save and lock reflection' : 'Edit reflection and rating'}
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

                {/* Corner Flip Back Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 border border-white/30 transition-all text-xs font-semibold text-white cursor-pointer shadow-lg backdrop-blur-md relative z-50"
                  title="Flip back to screening room"
                >
                  <Repeat className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                  <span>Flip Back</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                THE ARTIFACT: GOLDEN FOIL CINEMA TICKET STUB
               ======================================================== */}
            <div className="relative z-30 my-2 flex flex-col items-center">
              <div className="w-full max-w-xl relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF9EA] via-[#F7E8C6] to-[#EDD29F] text-[#2A1A1F] border-2 border-[#D4AF37]/80 shadow-[0_15px_35px_rgba(0,0,0,0.45)] flex flex-col sm:flex-row">
                {/* Left Semicircular Ticket Notch */}
                <div
                  className="hidden sm:block absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-r-2 border-[#D4AF37]/80"
                  style={{ backgroundColor: canvasBg }}
                />
                {/* Right Semicircular Ticket Notch */}
                <div
                  className="hidden sm:block absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-l-2 border-[#D4AF37]/80"
                  style={{ backgroundColor: canvasBg }}
                />

                {/* Left Main Ticket Stub */}
                <div className="flex-1 p-5 sm:pl-7 sm:pr-5 flex flex-col justify-between space-y-3 border-b-2 sm:border-b-0 sm:border-r-2 border-dashed border-[#B68F40]/50">
                  {/* Gold Foil Header Stamp */}
                  <div className="flex items-center justify-between border-b border-[#B68F40]/35 pb-2">
                    <span className="text-[10px] sm:text-[11px] font-mono font-extrabold tracking-widest uppercase text-[#7E3B4D] bg-[#7E3B4D]/10 px-2.5 py-0.5 rounded-full border border-[#7E3B4D]/25">
                      ★ ADMIT TWO : GOOGLE & NAMI ♡
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#8A6928]">
                      VIP SCREENING
                    </span>
                  </div>

                  {/* Film Title & Director on Ticket */}
                  <div>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-[#2A1A1F] leading-snug line-clamp-1">
                      {movie.title || 'Feature Film'}
                    </h4>
                    <p className="text-xs font-medium text-[#6E473B] italic">
                      Directed by {movie.director || 'Cinema Release'}
                    </p>
                  </div>

                  {/* Ticket Perforated Metadata Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono">
                    <div className="bg-[#2A1A1F]/5 rounded-lg p-1.5 border border-[#B68F40]/25">
                      <span className="block text-[8px] uppercase text-[#8A6928]">DATE</span>
                      <span className="font-bold text-[#2A1A1F]">
                        {monthName.slice(0, 3).toUpperCase()} {year}
                      </span>
                    </div>
                    <div className="bg-[#2A1A1F]/5 rounded-lg p-1.5 border border-[#B68F40]/25">
                      <span className="block text-[8px] uppercase text-[#8A6928]">SEATS</span>
                      <span className="font-bold text-[#2A1A1F]">ROW G • 1 & 2</span>
                    </div>
                    <div className="bg-[#2A1A1F]/5 rounded-lg p-1.5 border border-[#B68F40]/25">
                      <span className="block text-[8px] uppercase text-[#8A6928]">POPCORN</span>
                      <span className="font-bold text-[#7E3B4D]">🍿 {currentRating.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>

                {/* Right Tear-Off QR Stub */}
                <div className="sm:w-40 p-4 flex flex-col items-center justify-center bg-[#F4E1B6]/60 shrink-0">
                  <a
                    href={targetQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-[#FFFDF7] border border-[#B68F40]/40 shadow-xs hover:scale-105 transition-transform"
                    title="Scan or click to open IMDb / Letterboxd / Trailer"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Cinema Ticket QR Code"
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg"
                    />
                  </a>
                  <span className="mt-1.5 text-[9px] font-mono font-bold tracking-widest uppercase text-[#6E473B]">
                    NO. {monthId.replace('-', '')}02
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[#8A6928]">
                    SCAN TICKET QR
                  </span>
                </div>
              </div>

              {/* Optional IMDb / Letterboxd link input when in Edit Mode */}
              {isEditing && (
                <div className="w-full max-w-xl mt-2 flex items-center gap-2 bg-black/30 px-3.5 py-2 rounded-xl border border-amber-300/30 text-xs">
                  <span className="text-amber-200/80 font-mono whitespace-nowrap">Ticket QR Link:</span>
                  <input
                    type="url"
                    value={ticketUrlInput}
                    onChange={(e) => setTicketUrlInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Optional: Paste IMDb or Letterboxd URL for ticket QR..."
                    className="flex-1 bg-transparent text-white placeholder-white/35 outline-none text-xs"
                  />
                </div>
              )}
            </div>

            {/* ========================================================
                BESPOKE QUESTION PROMPT: "Who cried first / favorite quote"
               ======================================================== */}
            <div className="relative z-30 my-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/85 flex items-center gap-2 flex-wrap">
                  <span>Who cried first / favorite quote from the film</span>
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

              {/* Romantic Note Textarea / Locked View */}
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
                    placeholder="Write down your favorite scene, quote, who cried first, or what snacks you ate together during the movie..."
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
                        No screening notes written yet. Click &quot;Edit&quot; above to jot down your favorite scene or quote...
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 right-4 pointer-events-none text-[11px] font-mono text-white/30">
                  {reasonText.length} characters
                </div>
              </div>
            </div>

            {/* Back Side Bottom Bar: Quick Flip Back & Couple Watermark */}
            <div className="relative z-40 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/60">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Return to 35mm screening</span>
              </button>

              <span className="font-serif italic text-white/40">
                Ever, Together ♡ Google & Nami
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CONFIRMATION POPUP MODAL FOR REMOVING MOVIE
         ======================================================== */}
      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsConfirmingDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200 space-y-4"
            style={{
              backgroundColor: movie.canvasColor || '#1E162B',
              color: '#FFFFFF',
              boxShadow: `0 25px 60px -10px rgba(0,0,0,0.7), 0 0 35px -5px ${accentColor}33`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon without circular box */}
            <div className="flex justify-center text-red-400">
              <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
            </div>

            {/* Modal Heading & Description */}
            <div className="space-y-1.5">
              <h4 className="font-serif text-xl font-bold tracking-tight text-white">
                Remove this movie?
              </h4>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed px-2">
                This will delete the logged film, its popcorn rating, and your ticket stub notes for this month.
              </p>
            </div>

            {/* Movie Preview Pill */}
            <div className="py-2 px-3 rounded-xl bg-black/30 border border-white/10 text-xs text-white/80 truncate">
              <span className="font-medium text-white">{movie.title || 'Logged Movie'}</span>
              {movie.director && <span className="text-white/50"> • {movie.director}</span>}
            </div>

            {/* Action Buttons */}
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
                  deleteMonthMovie(monthId);
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
