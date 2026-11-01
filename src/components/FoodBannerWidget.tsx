'use client';

import React, { useState, useEffect } from 'react';
import { FoodLogEntry } from '@/types/database';
import { useApp } from '@/lib/store';
import {
  parseMusicUrl,
  getQrCodeImageUrl,
} from '@/lib/media-helper';
import PorcelainPlateFrame from './PorcelainPlateFrame';
import {
  Trash2,
  ExternalLink,
  Repeat,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
  Utensils,
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
  'RESERVE DE LA MAISON · WOULD TRAVEL 2 HRS FOR THIS',
  'INSTANT COMFORT CLASSIC · TABLE FOR TWO',
  'ETOILE DU SOIR · DATE NIGHT PERFECTION',
  'PARTAGE DU CHEF · STOLE BITES OFF EACH OTHER’S PLATES',
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
          '2x Verre de Maison',
          '1x Dessert Partagé ♡',
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
      restaurant: restaurantInput.trim() || 'Maison de Deux',
      genre: genreInput.trim() || 'Fine Dining',
      orderItems: parsedItems.length > 0 ? parsedItems : [`1x ${titleInput.trim() || 'Signature Dish'}`],
      mapsUrl: mapsUrlInput.trim() || undefined,
    });
    triggerSavedBadge();
  };

  const parsed = parseMusicUrl(food.url);

  const currentRating = food.rating ?? 9.6;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  const targetQrUrl = food.mapsUrl?.trim() || food.url;
  const qrCodeUrl = getQrCodeImageUrl(targetQrUrl, '2B1D19', 'FAF6EE', 240);

  const displayOrderItems =
    food.orderItems && food.orderItems.length > 0
      ? food.orderItems
      : [
          `1x ${food.title || 'Signature Dish'}`,
          '2x Verre de Maison',
          '1x Dessert Partagé ♡',
        ];

  // Woven Linen & Porcelain Table Palette
  const linenSurface = '#F5EFE4';
  const mahoganyFrame = '#3B231E';
  const burgundyInk = '#6E2226';
  const espressoInk = '#261B17';

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2000px] select-none"
        style={{ minHeight: '860px' }}
      >
        <div
          className="w-full relative rounded-3xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1)',
            minHeight: '860px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: Fine Bistro Linen Placemat & Porcelain Plate
             ======================================================== */}
          <div
            className={`w-full rounded-3xl p-6 sm:p-9 shadow-2xl relative flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backgroundColor: linenSurface,
              backgroundImage: `
                radial-gradient(rgba(158, 120, 64, 0.06) 1px, transparent 0),
                radial-gradient(rgba(110, 34, 38, 0.04) 1px, transparent 0)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
              color: espressoInk,
              border: `6px solid ${mahoganyFrame}`,
              boxShadow:
                '0 30px 70px -15px rgba(20, 12, 9, 0.65), inset 0 0 0 2px rgba(158, 120, 64, 0.45)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '860px',
            }}
          >
            {/* Inner Bistro Menu Double Frame Border */}
            <div
              className="absolute inset-3 sm:inset-4 rounded-2xl pointer-events-none"
              style={{
                border: '1px solid rgba(110, 34, 38, 0.25)',
                boxShadow: 'inset 0 0 0 3px rgba(245, 239, 228, 1), inset 0 0 0 4px rgba(158, 120, 64, 0.3)',
              }}
            />

            {/* Top Bar: Vintage Brass Table Verdict Tag & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-20 px-1 pt-1">
              <button
                type="button"
                onClick={handleCycleCraving}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECE3D3] hover:bg-[#E3D6C1] border border-[#C5B293] text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-[#5A3E28] transition-all cursor-pointer shadow-2xs"
                title="Click to cycle Sommelier & Chef's Verdict"
              >
                <span className="w-2 h-2 rounded-full bg-[#7A2828]" />
                <span className="truncate max-w-[200px] sm:max-w-xs uppercase">
                  {food.cravingLevel || CRAVING_VERDICTS[0]}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    isEditing
                      ? 'bg-[#7A2828] text-[#FAF6EE] border-[#571919] shadow-sm'
                      : 'bg-[#ECE3D3] hover:bg-[#E3D6C1] border-[#C5B293] text-[#3B2A22]'
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
                  className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2B1D19] hover:bg-[#3D2923] active:scale-95 border border-[#8C6C3E]/50 transition-all text-xs font-semibold text-[#F5EFE4] cursor-pointer shadow-sm"
                  title="Flip plate over to inspect Backstamp & Tasting Ledger"
                >
                  <Repeat className="w-3.5 h-3.5 text-[#D8B478] group-hover:rotate-180 transition-transform duration-500" />
                  <span>Flip Plate ↺</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. CENTERPIECE: PICTURE ON A PORCELAIN PLATE
               ======================================================== */}
            <div className="relative z-10 my-1">
              <PorcelainPlateFrame
                imageUrl={food.thumbnailUrl || food.url}
                embedUrl={parsed.embedUrl}
                isYoutube={parsed.platform === 'youtube'}
                title={food.title || 'Signature Dish'}
                restaurant={food.restaurant || 'MAISON DE DEUX'}
                monthLabel={`${monthName.toUpperCase()} ${year} • N° 02`}
              />
            </div>

            {/* ========================================================
                2. BISTRO MENU TYPOGRAPHY & VINTAGE GASTRONOMIC SCORE
               ======================================================== */}
            <div className="relative z-10 text-center space-y-3 my-1 px-2">
              <div className="flex items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.28em] text-[#8A6D46]">
                <span className="h-px w-8 sm:w-14 bg-[#C7B599]" />
                <span>PLAT DU MOIS · COURSE OF THE MONTH</span>
                <span className="h-px w-8 sm:w-14 bg-[#C7B599]" />
              </div>

              {isEditing ? (
                <div className="max-w-md mx-auto space-y-2 bg-[#EBE1CF]/90 p-3.5 rounded-2xl border border-[#B89B6E] shadow-inner">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Dish Name (e.g. Truffle Tagliolini & Wagyu)"
                    className="w-full bg-transparent text-center font-serif text-xl sm:text-2xl font-bold text-[#261B17] outline-none border-b border-[#C5B293] pb-1"
                  />
                  <input
                    type="text"
                    value={restaurantInput}
                    onChange={(e) => setRestaurantInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Restaurant / Kitchen (e.g. Osteria Romana)"
                    className="w-full bg-transparent text-center font-serif italic text-sm sm:text-base font-medium text-[#7A2828] outline-none border-b border-[#C5B293] pb-1"
                  />
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Cuisine Style (e.g. Italian Fine Dining)"
                    className="w-full bg-transparent text-center font-mono text-xs uppercase tracking-widest text-[#6E5638] outline-none pt-0.5"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#231915] line-clamp-2">
                    {food.title || 'Signature Dish'}
                  </h3>
                  <p
                    className="font-serif italic text-base sm:text-lg font-medium"
                    style={{ color: burgundyInk }}
                  >
                    {food.restaurant || 'Maison de Deux'}
                  </p>
                </div>
              )}

              {/* Cuisine Classification Pill */}
              {!isEditing && (
                <div className="flex items-center justify-center pt-0.5">
                  <span className="px-4 py-1 rounded-full text-[11px] font-mono font-semibold tracking-[0.2em] uppercase bg-[#EAE0CE] border border-[#C6B394] text-[#5C4328]">
                    {food.genre || 'Fine Dining'}
                  </span>
                </div>
              )}

              {/* Vintage Brass Gastronomic Rating Plaque */}
              <div className="pt-1 flex flex-col items-center gap-1.5">
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-[#261B17] border border-[#8F6F40] shadow-md text-[#F5EFE4]">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A66B] mr-1">
                    GASTRONOMIE
                  </span>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pipIndex) => {
                      const active = pipIndex <= displayRating;
                      return (
                        <button
                          key={pipIndex}
                          type="button"
                          disabled={!isEditing}
                          onClick={() => handleStarClick(pipIndex)}
                          onMouseEnter={() => isEditing && setHoverRating(pipIndex)}
                          onMouseLeave={() => isEditing && setHoverRating(null)}
                          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center transition-transform ${
                            isEditing ? 'hover:scale-125 cursor-pointer' : 'cursor-default'
                          }`}
                          title={`Rate ${pipIndex} / 10`}
                        >
                          <span
                            className={`text-xs sm:text-sm leading-none transition-colors ${
                              active
                                ? 'text-[#E3B76B] drop-shadow-[0_0_4px_rgba(227,183,107,0.5)]'
                                : 'text-[#5C4A42]'
                            }`}
                          >
                            ✦
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-4 w-px bg-[#5C4A42] mx-1" />

                  {isEditing ? (
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-[#C9A66B]/50">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={ratingInput}
                        onChange={handleRatingInputChange}
                        className="w-11 bg-transparent text-xs sm:text-sm font-mono font-bold text-[#E3B76B] outline-none text-center"
                      />
                      <span className="font-mono text-[10px] text-[#A39286]">/10</span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-[#E3B76B]">
                      {currentRating.toFixed(1)} <span className="text-[10px] text-[#9E8C7E]">/ 10</span>
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <span className="text-[10px] text-[#7A2828] font-mono tracking-wide">
                    Click rosettes or type decimal to adjust • click Done to lock
                  </span>
                ) : (
                  <span className="text-[10px] text-[#857362] font-mono flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Gastronomic rating sealed</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="relative z-10 mt-3 pt-3 border-t border-[#D6C7B0] flex items-center justify-between px-2">
              <a
                href={targetQrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#6E5638] hover:text-[#261B17] transition-colors"
              >
                <span>Inspect Dish / Restaurant Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-[#7A2828]/10 text-[#8C7A68] hover:text-[#7A2828] transition-colors cursor-pointer text-xs font-mono"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Plate</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              BACK SIDE: Porcelain Plate Underside Stamp & Tasting Ledger
             ======================================================== */}
          <div
            className={`w-full absolute inset-0 rounded-3xl p-6 sm:p-9 shadow-2xl flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-auto z-30' : 'pointer-events-none z-0'
            }`}
            style={{
              backgroundColor: linenSurface,
              backgroundImage: `
                radial-gradient(rgba(158, 120, 64, 0.06) 1px, transparent 0),
                radial-gradient(rgba(110, 34, 38, 0.04) 1px, transparent 0)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
              color: espressoInk,
              border: `6px solid ${mahoganyFrame}`,
              boxShadow:
                '0 30px 70px -15px rgba(20, 12, 9, 0.65), inset 0 0 0 2px rgba(158, 120, 64, 0.45)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '860px',
            }}
          >
            {/* Inner Bistro Menu Double Frame Border */}
            <div
              className="absolute inset-3 sm:inset-4 rounded-2xl pointer-events-none"
              style={{
                border: '1px solid rgba(110, 34, 38, 0.25)',
                boxShadow: 'inset 0 0 0 3px rgba(245, 239, 228, 1), inset 0 0 0 4px rgba(158, 120, 64, 0.3)',
              }}
            />

            {/* Back Top Bar */}
            <div className="flex items-center justify-between relative z-40 px-1 pt-1">
              <div className="flex items-center gap-2">
                <Utensils className="w-3.5 h-3.5 text-[#7A2828]" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#5C4328] font-mono font-semibold">
                  Plate Backstamp & L’Addition
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    isEditing
                      ? 'bg-[#7A2828] text-[#FAF6EE] border-[#571919] shadow-sm'
                      : 'bg-[#ECE3D3] hover:bg-[#E3D6C1] border-[#C5B293] text-[#3B2A22]'
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
                  className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2B1D19] hover:bg-[#3D2923] active:scale-95 border border-[#8C6C3E]/50 transition-all text-xs font-semibold text-[#F5EFE4] cursor-pointer shadow-sm relative z-50"
                >
                  <Repeat className="w-3.5 h-3.5 text-[#D8B478] group-hover:-rotate-180 transition-transform duration-500" />
                  <span>Front of Plate</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                PORCELAIN UNDERSIDE FOOT-RING & BISTRO L'ADDITION
               ======================================================== */}
            <div className="relative z-30 my-2 flex flex-col items-center">
              <div
                className="w-full max-w-lg rounded-3xl p-5 sm:p-6 relative overflow-hidden"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, #FCFBF8 0%, #F4EFE4 72%, #E5DCCB 100%)',
                  boxShadow:
                    '0 16px 35px -10px rgba(35, 22, 16, 0.25), inset 0 0 0 6px #DFD4C0, inset 0 0 0 8px rgba(122, 40, 40, 0.28)',
                  border: '1px solid #CBBBA0',
                }}
              >
                {/* Porcelain Kiln Backstamp Header */}
                <div className="text-center border-b border-dashed border-[#C2B299] pb-3 mb-3">
                  <p className="text-[9px] font-mono uppercase tracking-[0.28em] text-[#8A6D46]">
                    ✦ PORCELAINE DE TABLE • FABRIQUÉ POUR DEUX ✦
                  </p>
                  <p className="font-serif font-bold text-base sm:text-lg tracking-wide text-[#261B17] mt-0.5">
                    {(food.restaurant || 'MAISON DE DEUX').toUpperCase()}
                  </p>
                  <p className="text-[10px] font-mono text-[#786652] tracking-wider uppercase">
                    Table N° 02 • Service: {monthName} {year}
                  </p>
                </div>

                {/* Courses / Order Line Items + QR Backstamp */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full flex-1 space-y-2 font-mono text-xs">
                    <div className="text-[10px] uppercase tracking-widest text-[#7A2828] font-bold">
                      Menu Dégustation / Courses Ordered:
                    </div>

                    {isEditing ? (
                      <textarea
                        value={orderTextInput}
                        onChange={(e) => setOrderTextInput(e.target.value)}
                        onBlur={handleDetailBlur}
                        rows={3}
                        placeholder="One course or drink per line..."
                        className="w-full p-2 rounded-lg bg-[#FAF6EE] border border-[#B89B6E] text-xs font-mono text-[#261B17] outline-none resize-none"
                      />
                    ) : (
                      <div className="space-y-1.5 py-0.5">
                        {displayOrderItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 border-b border-dotted border-[#D5C7B2] pb-1 text-[#2E211C]"
                          >
                            <span className="truncate">{item}</span>
                            <span className="text-[#8A6D46] text-[10px] shrink-0">INCL.</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#5C4328]">NOTE GASTRONOMIQUE:</span>
                      <span className="text-[#7A2828]">✦ {currentRating.toFixed(1)} / 10.0</span>
                    </div>
                  </div>

                  {/* Ceramic Kiln QR Stamp */}
                  <a
                    href={targetQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex flex-col items-center p-2 rounded-2xl border border-[#C5B293] bg-[#FAF6EE] hover:scale-105 transition-transform shadow-xs"
                    title="Scan or click to open Restaurant / Google Maps"
                  >
                    <img src={qrCodeUrl} alt="Restaurant QR" className="w-16 h-16 sm:w-18 sm:h-18" />
                    <span className="text-[8px] font-mono tracking-widest text-[#6E5638] uppercase mt-1">
                      CARTE / MAPS
                    </span>
                  </a>
                </div>

                {isEditing && (
                  <div className="mt-3 pt-2 border-t border-dashed border-[#C2B299] flex items-center gap-2 text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A2828] whitespace-nowrap">
                      Maps Link:
                    </span>
                    <input
                      type="url"
                      value={mapsUrlInput}
                      onChange={(e) => setMapsUrlInput(e.target.value)}
                      onBlur={handleDetailBlur}
                      placeholder="Optional: Paste Google Maps restaurant URL..."
                      className="flex-1 bg-[#FAF6EE] px-2.5 py-1 rounded border border-[#C5B293] text-[#261B17] placeholder-[#9E8D7B] outline-none text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================
                SOMMELIER & TABLE MEMORY JOURNAL
               ======================================================== */}
            <div className="relative z-30 my-2 flex-1 flex flex-col px-1">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#4A3525] flex items-center gap-2 flex-wrap">
                  <span>Table Conversation & Tasting Notes</span>
                  {isEditing ? (
                    <span className="text-[11px] text-[#7A2828] font-normal lowercase">
                      (editing journal)
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#857362] font-normal lowercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>sealed • click Edit above to write</span>
                    </span>
                  )}
                </label>
                {isSaved && (
                  <span className="text-[11px] text-[#2E6B47] font-mono font-semibold flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Menu ♡</span>
                  </span>
                )}
              </div>

              <div
                className={`flex-1 relative rounded-2xl overflow-hidden border transition-all ${
                  isEditing
                    ? 'border-[#7A2828] bg-[#FCFBF8] ring-2 ring-[#7A2828]/15'
                    : 'border-[#C8B79C] bg-[#FAF6EE]/90'
                }`}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(transparent, transparent 27px, rgba(197, 178, 147, 0.35) 28px)',
                }}
              >
                {isEditing ? (
                  <textarea
                    value={reasonText}
                    onChange={handleReasonChange}
                    placeholder="Write down what we were laughing about over dinner, whose dish won the night, or the sweetest moment at the table..."
                    className="w-full h-full min-h-[175px] p-4 sm:p-5 text-sm sm:text-base text-[#261B17] placeholder-[#9C8B7A] bg-transparent outline-none resize-none font-serif leading-[28px]"
                  />
                ) : (
                  <div
                    onClick={onToggleEdit}
                    className="w-full h-full min-h-[175px] p-4 sm:p-5 text-sm sm:text-base text-[#2E211C] font-serif leading-[28px] whitespace-pre-wrap cursor-pointer"
                    title="Click Edit to modify tasting notes"
                  >
                    {reasonText.trim() ? (
                      reasonText
                    ) : (
                      <span className="text-[#968471] italic">
                        No table notes written yet. Click &quot;Edit&quot; above to record your dinner conversation and tasting memory...
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-2.5 right-4 pointer-events-none text-[10px] font-mono text-[#8C7A68] bg-[#FAF6EE]/80 px-1.5 rounded">
                  {reasonText.length} chars
                </div>
              </div>
            </div>

            {/* Back Bottom Bar */}
            <div className="relative z-40 pt-3 border-t border-[#D6C7B0] flex items-center justify-between text-xs text-[#6E5638] px-2">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="hover:text-[#261B17] transition-colors cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Return to Plated Dish</span>
              </button>

              <span className="font-serif italic text-[#7A2828]/80">
                Maison Google & Nami ♡
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup Modal for Removing Food */}
      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsConfirmingDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-[#3B231E] text-center animate-in zoom-in-95 duration-200 space-y-4"
            style={{
              backgroundColor: linenSurface,
              color: espressoInk,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center text-[#7A2828]">
              <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-serif text-xl font-bold tracking-tight text-[#261B17]">
                Clear this plate from the table?
              </h4>
              <p className="text-xs sm:text-sm text-[#6E5638] leading-relaxed px-2">
                This will remove the plated dish photo, tasting courses, and dinner notes for {monthName} {year}.
              </p>
            </div>

            <div className="py-2 px-3 rounded-xl bg-[#EAE0CE] border border-[#C6B394] text-xs text-[#261B17] truncate font-serif">
              <span className="font-bold">{food.title || 'Plated Dish'}</span>
              {food.restaurant && <span className="italic text-[#7A2828]"> • {food.restaurant}</span>}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#EAE0CE] hover:bg-[#DFD2BC] active:scale-95 text-[#261B17] text-xs sm:text-sm font-semibold transition-all border border-[#C6B394] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  deleteMonthFood(monthId);
                }}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#7A2828] hover:bg-[#5E1D1D] active:scale-95 text-[#FAF6EE] text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                Clear Plate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
