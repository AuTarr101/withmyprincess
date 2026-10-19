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
  Receipt,
  Sparkles,
} from 'lucide-react';

interface FoodBannerWidgetProps {
  food: FoodLogEntry;
  monthId: string;
  monthName: string;
  year: number;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const CRAVING_VERDICTS = [
  'Would travel 2 hrs just to eat this again! 🍷',
  'Instant Comfort Classic ♡ 🥢',
  'Michelin Date Night Perfection ✨',
  'Stole bites off each other’s plates 🍰',
];

export default function FoodBannerWidget({
  food,
  monthId,
  monthName,
  year,
  isEditing,
  onToggleEdit,
}: FoodBannerWidgetProps) {
  const { deleteMonthFood, updateMonthFoodDetails } = useApp();

  // 3D Flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Rating state (1 decimal)
  const [ratingInput, setRatingInput] = useState<string>((food.rating ?? 9.6).toFixed(1));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Editable fields
  const [titleInput, setTitleInput] = useState(food.title || '');
  const [restaurantInput, setRestaurantInput] = useState(food.restaurant || '');
  const [genreInput, setGenreInput] = useState(food.genre || '');
  const [orderTextInput, setOrderTextInput] = useState(
    (food.orderItems && food.orderItems.length > 0
      ? food.orderItems
      : [
          `1x ${food.title || 'Signature Dish'}`,
          '2x Sparkling Peach Bellini',
          '1x Sweet Dessert for Two ♡',
        ]
    ).join('\n')
  );
  const [mapsUrlInput, setMapsUrlInput] = useState(food.mapsUrl || '');

  // Reflection state
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
    if (food.orderItems && food.orderItems.length > 0) {
      setOrderTextInput(food.orderItems.join('\n'));
    }
    setMapsUrlInput(food.mapsUrl || '');
  }, [food.title, food.restaurant, food.genre, food.orderItems, food.mapsUrl]);

  const triggerSavedBadge = () => {
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleCycleCraving = () => {
    const current = food.cravingLevel || CRAVING_VERDICTS[0];
    const idx = CRAVING_VERDICTS.indexOf(current);
    const next = CRAVING_VERDICTS[(idx + 1) % CRAVING_VERDICTS.length];
    updateMonthFoodDetails(monthId, { cravingLevel: next });
    triggerSavedBadge();
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
    setRatingInput(starIndex.toFixed(1));
    updateMonthFoodDetails(monthId, { rating: starIndex });
  };

  const handleDetailBlur = () => {
    const parsedItems = orderTextInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    updateMonthFoodDetails(monthId, {
      title: titleInput.trim() || 'Signature Dish',
      restaurant: restaurantInput.trim() || 'Table for Two',
      genre: genreInput.trim() || 'Fine Dining',
      orderItems: parsedItems.length > 0 ? parsedItems : [`1x ${titleInput.trim() || 'Signature Dish'}`],
      mapsUrl: mapsUrlInput.trim() || undefined,
    });
    triggerSavedBadge();
  };

  const parsed = parseMusicUrl(food.url);

  const canvasBg = food.canvasColor || '#2B1B17';
  const accentColor = food.accentColor || '#F5B895';

  const currentRating = food.rating ?? 9.6;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  const targetQrUrl = food.mapsUrl?.trim() || food.url;
  const qrCodeUrl = getQrCodeImageUrl(targetQrUrl, '221E1D', 'FAF8F5', 240);

  const displayOrderItems =
    food.orderItems && food.orderItems.length > 0
      ? food.orderItems
      : [
          `1x ${food.title || 'Signature Dish'}`,
          '2x Sparkling Peach Bellini',
          '1x Warm Dessert for Two ♡',
        ];

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
              FRONT SIDE: Pinned Dish Photo & Chef's Craving Meter
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
              minHeight: '840px',
            }}
          >
            {/* Top Bar: Table #2 / Craving Meter & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-20 mb-2">
              <button
                type="button"
                onClick={handleCycleCraving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-medium text-amber-200 transition-all cursor-pointer shadow-sm backdrop-blur-md"
                title="Click to cycle Chef’s Craving Verdict!"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate max-w-[210px] sm:max-w-xs">
                  {food.cravingLevel || CRAVING_VERDICTS[0]}
                </span>
              </button>

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
                  title="Flip to view Thermal Dinner Receipt"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Check, Please ↺</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. PINNED DISH PHOTO WITH VINTAGE PHOTO CORNERS & CLIP
               ======================================================== */}
            <div className="relative z-10 w-full my-3 flex justify-center">
              <div className="w-full max-w-lg relative p-3.5 sm:p-4 rounded-2xl bg-[#FAF5EE] shadow-[0_22px_50px_rgba(0,0,0,0.6)] border border-[#E6DAC8]">
                {/* Top Brass Paperclip Pin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-10 h-5 rounded-full border-2 border-[#C89D54] bg-[#FAF5EE]/90 shadow-md flex items-center justify-center">
                  <span className="text-[9px] font-mono font-bold text-[#8C6226]">#02</span>
                </div>

                {/* 4 Vintage Photo Corners */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-[#B8860B]/70 pointer-events-none z-20" />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-[#B8860B]/70 pointer-events-none z-20" />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-[#B8860B]/70 pointer-events-none z-20" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-[#B8860B]/70 pointer-events-none z-20" />

                {/* Inner Dish Media */}
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-stone-900 relative">
                  {parsed.platform === 'youtube' && parsed.embedUrl ? (
                    <iframe
                      src={parsed.embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                      title={food.title || 'Dish Video'}
                    />
                  ) : food.thumbnailUrl || food.url ? (
                    <img
                      src={food.thumbnailUrl || food.url}
                      alt={food.title || 'Signature Dish'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <Utensils className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================
                2. DISH DETAILS: Dish Name, Restaurant, ONLY Cuisine, Michelin Rating
               ======================================================== */}
            <div className="relative z-10 text-center space-y-3.5 my-3">
              {isEditing ? (
                <div className="max-w-md mx-auto space-y-2 bg-black/30 p-3 rounded-2xl border border-amber-400/30">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Dish Name (e.g. Truffle Pasta & Wagyu)"
                    className="w-full bg-transparent text-center font-serif text-xl sm:text-2xl font-bold text-white outline-none border-b border-white/15 pb-1"
                  />
                  <input
                    type="text"
                    value={restaurantInput}
                    onChange={(e) => setRestaurantInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Restaurant Name (e.g. Bistro Milano)"
                    className="w-full bg-transparent text-center text-sm sm:text-base font-medium outline-none border-b border-white/15 pb-1"
                    style={{ color: accentColor }}
                  />
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Cuisine (e.g. Italian Fine Dining)"
                    className="w-full bg-transparent text-center text-xs uppercase tracking-widest text-amber-200 outline-none pt-0.5"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white line-clamp-2">
                    {food.title || 'Signature Dish'}
                  </h3>
                  <p
                    className="font-medium text-base sm:text-lg tracking-wide"
                    style={{ color: accentColor }}
                  >
                    {food.restaurant || 'Table for Two'}
                  </p>
                </div>
              )}

              {/* ONLY CUISINE BADGE */}
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
                    {food.genre || 'Italian Fine Dining'}
                  </span>
                </div>
              )}

              {/* 🍷 Michelin Fork Rating (1-decimal precision) */}
              <div className="pt-1 flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg mr-1" title="Michelin Fork Rating">
                    🍷
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
                    <span>Michelin rating locked</span>
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
                <span>Open Photo / Restaurant Link</span>
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
              BACK SIDE: Torn Thermal Dinner Receipt & Dinner Notes
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
              minHeight: '840px',
            }}
          >
            {/* Back Top Bar */}
            <div className="flex items-center justify-between relative z-40 mb-2">
              <span className="text-xs uppercase tracking-widest text-white/60 font-mono font-medium">
                Thermal Dinner Receipt & Table Memory
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
                THE ARTIFACT: TORN THERMAL PRINTED RECEIPT
               ======================================================== */}
            <div className="relative z-30 my-1 flex flex-col items-center">
              <div className="w-full max-w-md bg-[#FAF8F5] text-[#221E1D] shadow-[0_18px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                {/* Top Zig-Zag Serrated Tear Edge */}
                <div
                  className="w-full h-3"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${canvasBg} 50%, transparent 50%), linear-gradient(225deg, ${canvasBg} 50%, transparent 50%)`,
                    backgroundPosition: 'top left',
                    backgroundSize: '14px 14px',
                    backgroundRepeat: 'repeat-x',
                  }}
                />

                <div className="px-6 py-3 font-mono text-xs space-y-2">
                  <div className="text-center border-b border-dashed border-stone-400 pb-2">
                    <p className="font-bold text-sm tracking-wider uppercase">
                      {(food.restaurant || 'BISTRO MILANO').toUpperCase()} — TABLE #02
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Server: Love ♡ • Date: {monthName.toUpperCase()} {year}
                    </p>
                  </div>

                  {/* Order Line Items (Editable in Edit mode) */}
                  {isEditing ? (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-amber-800 font-bold">
                        Edit Receipt Items (one per line):
                      </span>
                      <textarea
                        value={orderTextInput}
                        onChange={(e) => setOrderTextInput(e.target.value)}
                        onBlur={handleDetailBlur}
                        rows={3}
                        className="w-full p-2 rounded bg-amber-50 border border-amber-300 text-xs font-mono text-stone-800 outline-none resize-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      {displayOrderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="truncate">{item}</span>
                          <span className="text-stone-500 shrink-0">$$$</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Receipt Totals & QR */}
                  <div className="border-t border-dashed border-stone-400 pt-2 flex items-center justify-between gap-4">
                    <div className="space-y-1 text-[11px]">
                      <p className="font-bold text-stone-800">
                        RATING: 🍷 {currentRating.toFixed(1)} / 10
                      </p>
                      <p className="font-extrabold text-[#7E3B4D] uppercase">
                        TOTAL: PRICELESS MEMORIES ♡
                      </p>
                      <p className="text-[9px] text-stone-400">
                        THANK YOU FOR DINING TOGETHER!
                      </p>
                    </div>

                    <a
                      href={targetQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex flex-col items-center p-1 rounded border border-stone-300 bg-white hover:scale-105 transition-transform"
                      title="Scan or click to open Restaurant / Maps link"
                    >
                      <img src={qrCodeUrl} alt="Restaurant QR" className="w-16 h-16" />
                      <span className="text-[8px] text-stone-500 uppercase mt-0.5">MAPS QR</span>
                    </a>
                  </div>
                </div>

                {/* Bottom Zig-Zag Serrated Tear Edge */}
                <div
                  className="w-full h-3"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${canvasBg} 50%, transparent 50%), linear-gradient(315deg, ${canvasBg} 50%, transparent 50%)`,
                    backgroundPosition: 'bottom left',
                    backgroundSize: '14px 14px',
                    backgroundRepeat: 'repeat-x',
                  }}
                />
              </div>

              {isEditing && (
                <div className="w-full max-w-md mt-2 flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-amber-300/30 text-xs">
                  <span className="text-amber-200/80 font-mono whitespace-nowrap">Google Maps QR:</span>
                  <input
                    type="url"
                    value={mapsUrlInput}
                    onChange={(e) => setMapsUrlInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Optional: Paste Google Maps restaurant link..."
                    className="flex-1 bg-transparent text-white placeholder-white/35 outline-none text-xs"
                  />
                </div>
              )}
            </div>

            {/* ========================================================
                BESPOKE QUESTION PROMPT: "What were we laughing about over dinner?"
               ======================================================== */}
            <div className="relative z-30 my-2 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/85 flex items-center gap-2 flex-wrap">
                  <span>What were we laughing about over dinner?</span>
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
                    placeholder="Write down the conversation over dinner, whose dish was better, or the sweetest moment at the table..."
                    className="w-full h-full min-h-[180px] p-4 sm:p-5 text-sm sm:text-base text-white placeholder-white/40 bg-transparent outline-none resize-none font-serif leading-relaxed"
                  />
                ) : (
                  <div
                    onClick={onToggleEdit}
                    className="w-full h-full min-h-[180px] p-4 sm:p-5 text-sm sm:text-base text-white/90 font-serif leading-relaxed whitespace-pre-wrap cursor-pointer"
                    title="Click Edit to modify"
                  >
                    {reasonText.trim() ? (
                      reasonText
                    ) : (
                      <span className="text-white/35 italic">
                        No table notes written yet. Click &quot;Edit&quot; above to jot down your dinner memory...
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
            <div className="relative z-40 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/60">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Return to dish photo</span>
              </button>

              <span className="font-serif italic text-white/40">
                Ever, Together ♡ Google & Nami
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup Modal for Removing Food */}
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
                Remove this dish?
              </h4>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed px-2">
                This will delete the logged meal, thermal receipt, and dinner notes for this month.
              </p>
            </div>

            <div className="py-2 px-3 rounded-xl bg-black/30 border border-white/10 text-xs text-white/80 truncate">
              <span className="font-medium text-white">{food.title || 'Logged Dish'}</span>
              {food.restaurant && <span className="text-white/50"> • {food.restaurant}</span>}
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
