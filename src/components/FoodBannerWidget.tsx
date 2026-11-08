'use client';

import React, { useState, useEffect } from 'react';
import { FoodLogEntry } from '@/types/database';
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
  Utensils,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
  Lightbulb,
  LightbulbOff,
  Ticket,
  Play,
} from 'lucide-react';

interface FoodBannerWidgetProps {
  food: FoodLogEntry;
  monthId: string;
  monthName: string;
  year: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  isDimmed: boolean;
  onToggleDim: () => void;
}

export default function FoodBannerWidget({
  food,
  monthId,
  monthName,
  year,
  isEditing,
  onToggleEdit,
  isDimmed,
  onToggleDim,
}: FoodBannerWidgetProps) {
  const {
    deleteMonthFood,
    updateMonthFoodDetails,
  } = useApp();

  // 3D Flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Rating editing state (1 decimal point e.g. 9.8)
  const [ratingInput, setRatingInput] = useState<string>((food.rating ?? 9.6).toFixed(1));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Editable metadata fields when in Edit mode
  const [titleInput, setTitleInput] = useState(food.title || '');
  const [restaurantInput, setRestaurantInput] = useState(food.restaurant || '');
  const [genreInput, setGenreInput] = useState(food.genre || '');
  const [ticketUrlInput, setTicketUrlInput] = useState(food.mapsUrl || '');
  const [yearInput, setYearInput] = useState(food.year || '');
  const [cravingInput, setCravingInput] = useState(
    food.cravingLevel || 'Would travel 2 hrs just to eat this again! 🍷'
  );
  const [orderInput, setOrderInput] = useState(
    (food.orderItems && food.orderItems.length > 0
      ? food.orderItems
      : [`1x ${food.title || 'Signature Dish'}`, '2x Wine', '1x Dessert ♡']
    ).join('\n')
  );
  const [stillUrlInput, setStillUrlInput] = useState(food.stillUrl || '');

  // Media still: click play to swap the still for the video embed
  const [isPlaying, setIsPlaying] = useState(false);

  // Reflection state with auto-save
  const [reasonText, setReasonText] = useState(food.reason || '');
  const [isSaved, setIsSaved] = useState(false);

  // Remove confirmation modal state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setReasonText(food.reason || '');
  }, [food.reason]);

  useEffect(() => {
    setRatingInput((food.rating ?? 9.6).toFixed(1));
  }, [food.rating]);

  useEffect(() => {
    setTitleInput(food.title || '');
    setRestaurantInput(food.restaurant || '');
    setGenreInput(food.genre || '');
    setTicketUrlInput(food.mapsUrl || '');
    setYearInput(food.year || '');
    setCravingInput(food.cravingLevel || 'Would travel 2 hrs just to eat this again! 🍷');
    if (food.orderItems && food.orderItems.length > 0) {
      setOrderInput(food.orderItems.join('\n'));
    }
    setStillUrlInput(food.stillUrl || '');
  }, [
    food.title,
    food.restaurant,
    food.genre,
    food.mapsUrl,
    food.year,
    food.cravingLevel,
    food.orderItems,
    food.stillUrl,
  ]);

  useEffect(() => {
    setIsPlaying(false);
  }, [food.url]);

  const triggerSavedBadge = () => {
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReasonText(newText);
    updateMonthFoodDetails(monthId, { reason: newText });
    triggerSavedBadge();
  };

  const handleRatingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRatingInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      updateMonthFoodDetails(monthId, { rating: Math.round(num * 10) / 10 });
    }
  };

  const handleStarClick = (starIndex: number) => {
    if (!isEditing) return;
    const newRating = starIndex;
    setRatingInput(newRating.toFixed(1));
    updateMonthFoodDetails(monthId, { rating: newRating });
  };

  const handleDetailBlur = () => {
    const parsedItems = orderInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    updateMonthFoodDetails(monthId, {
      title: titleInput.trim() || 'Signature Dish',
      restaurant: restaurantInput.trim() || 'Table for Two',
      genre: genreInput.trim() || 'Fine Dining',
      mapsUrl: ticketUrlInput.trim() || undefined,
      year: yearInput.trim() || undefined,
      cravingLevel: cravingInput.trim() || undefined,
      orderItems: parsedItems.length > 0 ? parsedItems : [`1x ${titleInput.trim() || 'Signature Dish'}`],
      stillUrl: stillUrlInput.trim() || undefined,
    });
    triggerSavedBadge();
  };

  const parsed = parseMusicUrl(food.url);

  // Poster derived values
  const yearMatch = (food.title || '').match(/^(.*?)\s*\((\d{4})\)\s*$/);
  const posterTitle = (yearMatch ? yearMatch[1] : food.title) || 'Signature Dish';
  const posterYear = food.year || (yearMatch ? yearMatch[2] : String(year));
  const stillImage = food.stillUrl || food.thumbnailUrl || food.url;
  const trailerEmbed =
    parsed.platform === 'youtube' && parsed.embedUrl
      ? `${parsed.embedUrl}${parsed.embedUrl.includes('?') ? '&' : '?'}autoplay=1`
      : null;

  // Poster print palette (identical to Movie)
  const paperBg = isDimmed ? '#15120F' : '#ECE9E2';
  const inkColor = isDimmed ? '#F1ECE2' : '#1E1B18';
  const mutedInk = isDimmed ? '#8F877C' : '#7A756F';
  const ruleColor = isDimmed ? 'rgba(241,236,226,0.14)' : 'rgba(30,27,24,0.14)';

  const currentRating = food.rating ?? 9.6;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  // Scannable QR Code for the Dinner Receipt Stub
  const targetQrUrl = food.mapsUrl?.trim() || food.url;
  const qrCodeUrl = getQrCodeImageUrl(
    targetQrUrl,
    inkColor.replace('#', ''),
    paperBg.replace('#', ''),
    280
  );

  // Shared pill styling for the poster's top control bar
  const pillBase =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all cursor-pointer border active:scale-95';
  const pillIdle = isDimmed
    ? 'border-white/15 text-[#F1ECE2]/80 hover:text-[#F1ECE2] hover:bg-white/10'
    : 'border-black/10 text-[#1E1B18]/70 hover:text-[#1E1B18] hover:bg-black/5';

  const editField =
    'w-full bg-transparent outline-none border-b border-dashed pb-0.5 placeholder:opacity-40 focus:border-solid';

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2000px] select-none"
        style={{ minHeight: '820px' }}
      >
        <div
          className="w-full relative rounded-md"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1)',
            minHeight: '820px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: Minimalist Food Poster Print
             ======================================================== */}
          <div
            className={`w-full rounded-md p-5 sm:p-7 relative flex flex-col transition-colors duration-700 ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backgroundColor: paperBg,
              color: inkColor,
              boxShadow: isDimmed
                ? '0 35px 80px -15px rgba(0,0,0,0.9)'
                : '0 25px 60px -20px rgba(30,27,24,0.35), 0 2px 6px rgba(30,27,24,0.08)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '820px',
            }}
          >
            {/* Top Bar: Dim Lights · Edit/Done · Flip Ticket */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <button
                type="button"
                onClick={onToggleDim}
                className={`${pillBase} ${
                  isDimmed ? 'border-amber-300/50 text-amber-200 bg-amber-300/10' : pillIdle
                }`}
                title={isDimmed ? 'Turn the lights back on' : 'Dim the lights for a midnight print'}
              >
                {isDimmed ? (
                  <>
                    <Lightbulb className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>Lights On</span>
                  </>
                ) : (
                  <>
                    <LightbulbOff className="w-3.5 h-3.5" />
                    <span>Dim Lights</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`${pillBase} ${
                    isEditing ? 'bg-amber-400 border-amber-400 text-stone-900 hover:bg-amber-300' : pillIdle
                  }`}
                  title={isEditing ? 'Save and lock edits' : 'Edit dish details and rating'}
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
                    setIsPlaying(false);
                    setIsFlipped(true);
                  }}
                  className={`group ${pillBase} ${pillIdle}`}
                  title="Flip to view Dinner Receipt & Table Notes"
                >
                  <Ticket className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Flip Receipt</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. DISH PHOTO STILL (click play to roll video)
               ======================================================== */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-black/80 group">
              {isPlaying && trailerEmbed ? (
                <iframe
                  src={trailerEmbed}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                  title={posterTitle}
                />
              ) : (
                <>
                  {stillImage ? (
                    <img
                      src={stillImage}
                      alt={posterTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="w-14 h-14 text-white/30" />
                    </div>
                  )}

                  {trailerEmbed ? (
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      title="Play dish video"
                    >
                      <span className="w-14 h-14 rounded-full bg-white/85 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-[#1E1B18] fill-[#1E1B18] ml-0.5" />
                      </span>
                    </button>
                  ) : (
                    <a
                      href={food.mapsUrl || food.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white border border-white/30">
                        Open Restaurant / Maps ↗
                      </span>
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Optional custom still URL while editing */}
            {isEditing && (
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="lowercase whitespace-nowrap" style={{ color: mutedInk }}>
                  photo image
                </span>
                <input
                  type="url"
                  value={stillUrlInput}
                  onChange={(e) => setStillUrlInput(e.target.value)}
                  onBlur={handleDetailBlur}
                  placeholder="Optional: paste dish photo URL..."
                  className={editField}
                  style={{ borderColor: ruleColor, color: inkColor }}
                />
              </div>
            )}

            {/* ========================================================
                2. TITLE + YEAR
               ======================================================== */}
            <div className="mt-6">
              {isEditing ? (
                <div className="flex items-end gap-3">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="DISH TITLE"
                    className={`${editField} font-poster font-bold uppercase text-3xl sm:text-4xl tracking-tight`}
                    style={{ borderColor: ruleColor, color: inkColor }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="YEAR"
                    className={`${editField} font-poster text-lg sm:text-xl w-16 shrink-0`}
                    style={{ borderColor: ruleColor, color: inkColor }}
                  />
                </div>
              ) : (
                <h3 className="font-poster font-bold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl">
                  {posterTitle}
                  <span
                    className="font-poster font-normal text-xl sm:text-2xl tracking-normal ml-2 align-baseline"
                    style={{ color: isDimmed ? '#BDB4A8' : '#4A4540' }}
                  >
                    {posterYear}
                  </span>
                </h3>
              )}
            </div>

            {/* ========================================================
                3. METADATA ROWS: cuisine · restaurant · verdict · rated
               ======================================================== */}
            <div className="mt-4 space-y-1.5 font-poster text-sm sm:text-[15px] tracking-wide">
              {[
                {
                  label: 'cuisine',
                  value: food.genre || 'Fine Dining',
                  input: genreInput,
                  setInput: setGenreInput,
                  placeholder: 'ITALIAN FINE DINING',
                },
                {
                  label: 'restaurant',
                  value: food.restaurant || 'Table for Two',
                  input: restaurantInput,
                  setInput: setRestaurantInput,
                  placeholder: 'RESTAURANT NAME',
                },
                {
                  label: 'verdict',
                  value: food.cravingLevel || 'Would travel 2 hrs just to eat this again! 🍷',
                  input: cravingInput,
                  setInput: setCravingInput,
                  placeholder: 'CHEF VERDICT / CRAVING LEVEL',
                },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-[96px_1fr] sm:grid-cols-[108px_1fr] items-baseline">
                  <span className="font-light lowercase" style={{ color: mutedInk }}>
                    {row.label}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={row.input}
                      onChange={(e) => row.setInput(e.target.value)}
                      onBlur={handleDetailBlur}
                      placeholder={row.placeholder}
                      className={`${editField} uppercase`}
                      style={{ borderColor: ruleColor, color: inkColor }}
                    />
                  ) : (
                    <span className="uppercase font-normal truncate">{row.value}</span>
                  )}
                </div>
              ))}

              {/* Food Rating row (locked unless editing) */}
              <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[108px_1fr] items-center">
                <span className="font-light lowercase" style={{ color: mutedInk }}>
                  rated
                </span>
                {isEditing ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => (
                      <button
                        key={starIndex}
                        type="button"
                        onClick={() => handleStarClick(starIndex)}
                        onMouseEnter={() => setHoverRating(starIndex)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                        title={`Rate ${starIndex}/10`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            starIndex <= displayRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'opacity-25'
                          }`}
                        />
                      </button>
                    ))}
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={ratingInput}
                      onChange={handleRatingInputChange}
                      className={`${editField} w-12 ml-1 text-center font-mono text-xs`}
                      style={{ borderColor: ruleColor, color: inkColor }}
                      title="Edit decimal rating"
                    />
                    <span className="text-xs" style={{ color: mutedInk }}>/ 10</span>
                  </div>
                ) : (
                  <span className="uppercase flex items-center gap-1.5">
                    <span>🍷 {currentRating.toFixed(1)} / 10</span>
                    <Lock className="w-3 h-3 opacity-30" />
                  </span>
                )}
              </div>
            </div>

            {/* ========================================================
                4. TABLE (mirrors Movie's "starring" line)
               ======================================================== */}
            <div className="mt-6 font-poster text-xs sm:text-sm tracking-wide flex items-baseline gap-3">
              <span className="font-light lowercase shrink-0" style={{ color: mutedInk }}>
                table
              </span>
              <span className="uppercase tracking-wider">GOOGLE &nbsp;·&nbsp; NAMI &nbsp;(TABLE N° 02)</span>
            </div>

            {/* Footer: couple print stamp · open link · remove */}
            <div
              className="mt-auto pt-6 flex items-center justify-between gap-3 text-[11px]"
              style={{ color: mutedInk }}
            >
              <span className="font-mono tracking-widest uppercase truncate">
                Ever Together ♡ {monthName.slice(0, 3)} {year}
              </span>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={food.mapsUrl || food.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:opacity-100 opacity-80 transition-opacity"
                  title="Open restaurant link"
                >
                  <span>Restaurant</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove logged dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              BACK SIDE: Poster-Print Dinner Receipt + Table Notes
             ======================================================== */}
          <div
            className={`w-full absolute inset-0 rounded-md p-5 sm:p-7 flex flex-col transition-colors duration-700 ${
              isFlipped ? 'pointer-events-auto z-30' : 'pointer-events-none z-0'
            }`}
            style={{
              backgroundColor: paperBg,
              color: inkColor,
              boxShadow: isDimmed
                ? '0 35px 80px -15px rgba(0,0,0,0.9)'
                : '0 25px 60px -20px rgba(30,27,24,0.35), 0 2px 6px rgba(30,27,24,0.08)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '820px',
            }}
          >
            {/* Top Bar: section label · Edit/Done · Flip Back */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span
                className="font-mono text-[11px] tracking-widest uppercase"
                style={{ color: mutedInk }}
              >
                Dinner Receipt &amp; Table Notes
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`${pillBase} ${
                    isEditing ? 'bg-amber-400 border-amber-400 text-stone-900 hover:bg-amber-300' : pillIdle
                  }`}
                  title={isEditing ? 'Save and lock notes' : 'Edit notes and maps link'}
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
                  className={`group ${pillBase} ${pillIdle}`}
                  title="Flip back to the poster"
                >
                  <Repeat className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                  <span>Flip Back</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. HEADLINE
               ======================================================== */}
            <h3 className="font-poster font-bold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl mt-2">
              Table For Two
              <span
                className="font-poster font-normal text-xl sm:text-2xl tracking-normal ml-2"
                style={{ color: isDimmed ? '#BDB4A8' : '#4A4540' }}
              >
                Google &amp; Nami
              </span>
            </h3>

            {/* ========================================================
                2. MINIMAL RECEIPT STUB: metadata rows + tear-off QR
               ======================================================== */}
            <div
              className="mt-5 flex flex-col sm:flex-row border"
              style={{ borderColor: ruleColor }}
            >
              <div
                className="flex-1 p-4 sm:p-5 space-y-1.5 font-poster text-sm sm:text-[15px] tracking-wide border-b sm:border-b-0 sm:border-r border-dashed"
                style={{ borderColor: ruleColor }}
              >
                {[
                  { label: 'dish', value: posterTitle },
                  { label: 'restaurant', value: food.restaurant || '—' },
                  { label: 'date', value: `${monthName} ${year}` },
                  { label: 'table', value: 'Table N° 02 · For Two ♡' },
                  { label: 'rated', value: `🍷 ${currentRating.toFixed(1)} / 10` },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[96px_1fr] sm:grid-cols-[108px_1fr] items-baseline"
                  >
                    <span className="font-light lowercase" style={{ color: mutedInk }}>
                      {row.label}
                    </span>
                    <span className="uppercase truncate">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Tear-off QR stub */}
              <div className="sm:w-36 p-4 flex flex-col items-center justify-center gap-1.5 shrink-0">
                <a
                  href={targetQrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  title="Scan or click to open Google Maps restaurant link"
                >
                  <img src={qrCodeUrl} alt="Restaurant Maps QR code" className="w-20 h-20" />
                </a>
                <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: mutedInk }}>
                  MAPS #{monthId.replace('-', '')}02
                </span>
              </div>
            </div>

            {/* Optional Maps QR link while editing */}
            {isEditing && (
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="lowercase whitespace-nowrap" style={{ color: mutedInk }}>
                  maps link
                </span>
                <input
                  type="url"
                  value={ticketUrlInput}
                  onChange={(e) => setTicketUrlInput(e.target.value)}
                  onBlur={handleDetailBlur}
                  placeholder="Optional: Google Maps restaurant link for the QR..."
                  className={editField}
                  style={{ borderColor: ruleColor, color: inkColor }}
                />
              </div>
            )}

            {/* ========================================================
                3. TABLE NOTES: what were we laughing about over dinner
               ======================================================== */}
            <div className="mt-6 flex-1 flex flex-col">
              <div className="flex items-baseline justify-between gap-3 mb-2 font-poster text-sm sm:text-[15px] tracking-wide">
                <span>
                  <span className="font-light lowercase" style={{ color: mutedInk }}>
                    notes
                  </span>
                  <span className="uppercase ml-3">What were we laughing about over dinner</span>
                </span>
                {isSaved ? (
                  <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3" />
                    Saved ♡
                  </span>
                ) : (
                  !isEditing && <Lock className="w-3 h-3 opacity-30 shrink-0" />
                )}
              </div>

              <div className="flex-1 relative border" style={{ borderColor: ruleColor }}>
                {isEditing ? (
                  <textarea
                    value={reasonText}
                    onChange={handleReasonChange}
                    placeholder="Write down the conversation over dinner, whose dish was better, or the sweetest moment at the table..."
                    className="w-full h-full min-h-[220px] p-4 sm:p-5 text-sm sm:text-base bg-transparent outline-none resize-none font-serif leading-relaxed placeholder:opacity-40"
                    style={{ color: inkColor }}
                  />
                ) : (
                  <div
                    onClick={onToggleEdit}
                    className="w-full h-full min-h-[220px] p-4 sm:p-5 text-sm sm:text-base font-serif leading-relaxed whitespace-pre-wrap cursor-pointer"
                    title="Click to edit"
                  >
                    {reasonText.trim() ? (
                      reasonText
                    ) : (
                      <span className="italic" style={{ color: mutedInk }}>
                        No table notes yet. Click Edit to write down your favorite dinner memories...
                      </span>
                    )}
                  </div>
                )}
                <span
                  className="absolute bottom-2 right-3 pointer-events-none font-mono text-[10px]"
                  style={{ color: mutedInk }}
                >
                  {reasonText.length}
                </span>
              </div>
            </div>

            {/* Footer: couple print stamp · flip back */}
            <div
              className="pt-6 flex items-center justify-between gap-3 text-[11px]"
              style={{ color: mutedInk }}
            >
              <span className="font-mono tracking-widest uppercase truncate">
                Ever Together ♡ {monthName.slice(0, 3)} {year}
              </span>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
              >
                <Repeat className="w-3 h-3" />
                <span>Back to poster</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CONFIRMATION POPUP MODAL FOR REMOVING FOOD
         ======================================================== */}
      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsConfirmingDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-md p-6 sm:p-7 shadow-2xl border text-center animate-in zoom-in-95 duration-200 space-y-4"
            style={{
              backgroundColor: paperBg,
              color: inkColor,
              borderColor: ruleColor,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center text-red-500">
              <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-poster uppercase text-2xl font-bold tracking-tight">
                Remove this dish?
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed px-2" style={{ color: mutedInk }}>
                This will delete the logged dish, receipt, and table notes for {monthName} {year}.
              </p>
            </div>

            <div
              className="py-2 px-3 border text-xs truncate font-poster uppercase tracking-wide"
              style={{ borderColor: ruleColor }}
            >
              <span>{posterTitle}</span>
              {food.restaurant && (
                <span style={{ color: mutedInk }}> · {food.restaurant}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer"
                style={{ borderColor: ruleColor, color: inkColor }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  deleteMonthFood(monthId);
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
