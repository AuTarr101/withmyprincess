'use client';

import React, { useState, useEffect } from 'react';
import { MusicLogEntry } from '@/types/database';
import { useApp } from '@/lib/store';
import {
  parseMusicUrl,
  getSpotifyUri,
  getSpotifyCodeImageUrl,
  getQrCodeImageUrl,
} from '@/lib/media-helper';
import {
  Star,
  Trash2,
  ExternalLink,
  Repeat,
  Radio,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface SongBannerWidgetProps {
  song: MusicLogEntry;
  monthId: string;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export default function SongBannerWidget({
  song,
  monthId,
  isEditing,
  onToggleEdit,
}: SongBannerWidgetProps) {
  const { deleteMonthSong, updateMonthSongRating, updateMonthSongReason, updateMonthSongSpotify, theme } = useApp();
  const isDark = theme === 'dark';

  // Flip state (front vs back blank canvas)
  const [isFlipped, setIsFlipped] = useState(false);

  // Rating editing state (with decimal point e.g. 9.5)
  const [ratingInput, setRatingInput] = useState<string>((song.rating ?? 9.5).toFixed(1));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Reason of choice state with auto-save
  const [reasonText, setReasonText] = useState(song.reason || '');
  const [isSaved, setIsSaved] = useState(false);

  // Remove confirmation state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setReasonText(song.reason || '');
  }, [song.reason]);

  useEffect(() => {
    setRatingInput((song.rating ?? 9.5).toFixed(1));
  }, [song.rating]);

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReasonText(newText);
    updateMonthSongReason(monthId, newText);
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleRatingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRatingInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      updateMonthSongRating(monthId, Math.round(num * 10) / 10);
    }
  };

  const handleStarClick = (starIndex: number) => {
    if (!isEditing) return;
    const newRating = starIndex;
    setRatingInput(newRating.toFixed(1));
    updateMonthSongRating(monthId, newRating);
  };

  const parsed = parseMusicUrl(song.url);

  // Overall Light / Dark Theme Palette
  const cardBg = isDark ? '#1E161A' : '#FFFFFF';
  const cardBorder = isDark ? '#382830' : '#EFE7DB';
  const primaryText = isDark ? '#F3E8EB' : '#3A2832';
  const accentColor = isDark ? song.accentColor || '#E8B4C0' : '#7E3B4D';
  const cardShadow = isDark
    ? '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(232, 180, 192, 0.12)'
    : '0 20px 50px -12px rgba(110, 45, 59, 0.12), 0 4px 20px -4px rgba(110, 45, 59, 0.06)';

  const currentRating = song.rating ?? 9.5;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;

  // Real scannable codes synced to Dark / Light theme
  const spotifyUri = getSpotifyUri(song.url) || getSpotifyUri(song.spotifyUrl);
  const codeBgHex = isDark ? '22181E' : 'FAF6F0';
  const codeBarColor = isDark ? 'white' : 'black';
  const qrFgHex = isDark ? 'F3E8EB' : '463836';
  const qrBgHex = isDark ? '22181E' : 'FAF6F0';

  const spotifyCodeUrl = spotifyUri
    ? getSpotifyCodeImageUrl(spotifyUri, codeBgHex, codeBarColor)
    : null;
  const openSpotifyUrl = spotifyUri
    ? `https://open.spotify.com/${spotifyUri.split(':')[1]}/${spotifyUri.split(':')[2]}`
    : null;
  const qrCodeUrl = getQrCodeImageUrl(song.url, qrFgHex, qrBgHex);

  const [spotifyInput, setSpotifyInput] = useState('');
  const [spotifyError, setSpotifyError] = useState('');
  const [codeFailed, setCodeFailed] = useState(false);

  const handleAttachSpotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getSpotifyUri(spotifyInput)) {
      setSpotifyError('That doesn’t look like a Spotify track link');
      return;
    }
    setSpotifyError('');
    setCodeFailed(false);
    updateMonthSongSpotify(monthId, spotifyInput.trim());
    setSpotifyInput('');
  };

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2000px] select-none"
        style={{ minHeight: '800px' }}
      >
        <div
          className="w-full relative rounded-3xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1)',
            minHeight: '800px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: Song Player & Details (Matches Light/Dark Theme)
             ======================================================== */}
          <div
            className={`w-full rounded-3xl p-7 sm:p-10 relative border flex flex-col justify-between transition-colors duration-300 ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: primaryText,
              boxShadow: cardShadow,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '800px',
            }}
          >
            {/* Top Bar: Section Title & Buttons (Edit/Done & Flip) */}
            <div className="flex items-center justify-between relative z-20 mb-3">
              <span className="text-xs uppercase tracking-widest text-stone-400 dark:text-rose-200/60 font-mono font-medium">
                Song of the Month
              </span>

              <div className="flex items-center gap-2">
                {/* Edit / Done Toggle Button */}
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
                    isEditing
                      ? 'bg-wine-700 text-white hover:bg-wine-800 dark:bg-amber-400 dark:text-stone-900 dark:hover:bg-amber-300 ring-2 ring-wine-300 dark:ring-amber-300/60'
                      : 'bg-cream-100 hover:bg-cream-200 border border-cream-300 text-stone-700 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-rose-100'
                  }`}
                  title={isEditing ? 'Save and lock edits' : 'Edit rating and reflection'}
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

                {/* Corner Flip Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-wine-800 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-rose-100 active:scale-95 transition-all text-xs font-semibold cursor-pointer shadow-xs"
                  title="Click to flip card"
                >
                  <Repeat className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Flip Canvas</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                1. YOUTUBE / SPOTIFY EMBED (ABOVE)
               ======================================================== */}
            <div className="relative z-10 w-full my-4 flex justify-center">
              <div className="w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-xl border-2 border-cream-200 dark:border-[#3A2832] bg-stone-950">
                {parsed.platform === 'youtube' && parsed.embedUrl ? (
                  <iframe
                    src={parsed.embedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                    title={song.title || 'YouTube Music Video'}
                  />
                ) : parsed.platform === 'spotify' && parsed.embedUrl ? (
                  <iframe
                    src={parsed.embedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="w-full h-full"
                    title={song.title || 'Spotify Track'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-900">
                    {song.thumbnailUrl ? (
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title || 'Song Thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Radio className="w-16 h-16 text-white/40" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================
                2. DETAILS (BELOW): Title, Artist, Genre, Rating
               ======================================================== */}
            <div className="relative z-10 text-center space-y-4 my-4">
              {/* Song Title & Artist */}
              <div className="space-y-1.5">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-800 dark:text-rose-50 line-clamp-2">
                  {song.title || 'Untitled Track'}
                </h3>
                <p
                  className="font-medium text-base sm:text-lg tracking-wide"
                  style={{ color: accentColor }}
                >
                  {song.artist || 'Unknown Artist'}
                </p>
              </div>

              {/* Genre Pill */}
              <div className="flex items-center justify-center pt-1">
                <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase border bg-cream-100/80 border-cream-300 text-wine-800 dark:bg-white/10 dark:border-white/20 dark:text-rose-200 shadow-2xs">
                  {song.genre || 'Song of the Month'}
                </span>
              </div>

              {/* Rating (Stars) / 10 — Locked unless user clicks Edit */}
              <div className="pt-2 flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
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
                          ? 'hover:scale-130 cursor-pointer'
                          : 'cursor-default opacity-95'
                      }`}
                      title={isEditing ? `Click to rate ${starIndex}/10` : 'Click Edit to adjust rating'}
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          starIndex <= displayRating
                            ? 'text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.35)]'
                            : 'text-stone-300 dark:text-white/20 fill-stone-100 dark:fill-white/5'
                        }`}
                      />
                    </button>
                  ))}

                  {/* Rating numerical badge with one decimal point */}
                  {isEditing ? (
                    <div className="ml-3 flex items-center gap-1.5 bg-cream-100 dark:bg-black/40 px-2.5 py-1 rounded-lg border border-wine-300 dark:border-amber-400/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={ratingInput}
                        onChange={handleRatingInputChange}
                        className="w-12 bg-transparent text-sm sm:text-base font-mono font-bold text-wine-800 dark:text-amber-300 outline-none text-center"
                        title="Edit decimal rating"
                      />
                      <span className="font-mono text-xs text-stone-400 dark:text-white/50">/ 10</span>
                    </div>
                  ) : (
                    <span className="ml-3 font-mono text-sm sm:text-base font-bold text-wine-800 dark:text-amber-300">
                      {currentRating.toFixed(1)} / 10
                    </span>
                  )}
                </div>

                {/* Edit hint indicator */}
                {isEditing ? (
                  <span className="text-[11px] text-wine-700 dark:text-amber-300/80 font-mono tracking-wide">
                    Click stars or type decimal to adjust • click Done to lock
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400 dark:text-white/35 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Rating locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions Row: Link to platform & Remove button */}
            <div className="relative z-10 mt-6 pt-5 border-t border-cream-200 dark:border-white/15 flex items-center justify-between">
              <a
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-wine-800 dark:text-rose-200/70 dark:hover:text-white transition-colors"
              >
                <span>Open in {song.platform === 'spotify' ? 'Spotify' : 'YouTube'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-red-500/10 text-stone-400 hover:text-red-600 dark:text-white/50 dark:hover:text-red-300 transition-colors cursor-pointer text-xs border border-transparent hover:border-red-400/30"
                title="Remove logged song"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              BACK SIDE: Spotify-Style Soundwave Code + Reason for Choice
             ======================================================== */}
          <div
            className={`w-full absolute inset-0 rounded-3xl p-7 sm:p-10 border flex flex-col justify-between transition-colors duration-300 ${
              isFlipped ? 'pointer-events-auto z-30' : 'pointer-events-none z-0'
            }`}
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: primaryText,
              boxShadow: cardShadow,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '800px',
            }}
          >
            {/* Ambient dot grid texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none rounded-3xl"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, ${accentColor} 1.2px, transparent 0)`,
                backgroundSize: '28px 28px',
              }}
            />

            {/* Back Side Top Bar: Section Title & Buttons (Edit/Done & Flip Back) */}
            <div className="flex items-center justify-between relative z-40 mb-3">
              <span className="text-xs uppercase tracking-widest text-stone-400 dark:text-rose-200/60 font-mono font-medium">
                Song Reflection & Code
              </span>

              <div className="flex items-center gap-2">
                {/* Edit / Done Toggle Button on Back Side */}
                <button
                  type="button"
                  onClick={onToggleEdit}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
                    isEditing
                      ? 'bg-wine-700 text-white hover:bg-wine-800 dark:bg-amber-400 dark:text-stone-900 dark:hover:bg-amber-300 ring-2 ring-wine-300 dark:ring-amber-300/60'
                      : 'bg-cream-100 hover:bg-cream-200 border border-cream-300 text-stone-700 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-rose-100'
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
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-wine-800 dark:bg-white/15 dark:hover:bg-white/25 dark:border-white/25 dark:text-white active:scale-95 transition-all text-xs font-semibold cursor-pointer shadow-xs relative z-50"
                  title="Click corner to flip back to front"
                >
                  <Repeat className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                  <span>Flip Back</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                REAL SCANNABLE CODES (Spotify Code + QR)
               ======================================================== */}
            <div className="relative z-30 my-3 flex flex-col items-center gap-3">
              <div className="w-full max-w-md p-4 rounded-2xl border border-cream-200 dark:border-[#3A2832] bg-[#FAF6F0] dark:bg-[#22181E] flex items-center gap-4 shadow-md">
                {/* Spotify Code (official, scannable in the Spotify app) */}
                <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
                  {spotifyCodeUrl && !codeFailed ? (
                    <a href={openSpotifyUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-full" title="Open in Spotify">
                      <img
                        src={spotifyCodeUrl}
                        alt={`Spotify Code for ${song.title || 'this song'}`}
                        className="w-full h-auto rounded-xl"
                        onError={() => setCodeFailed(true)}
                      />
                    </a>
                  ) : (
                    <form onSubmit={handleAttachSpotify} className="w-full space-y-2">
                      <p className="text-[11px] text-stone-500 dark:text-rose-200/60 leading-snug">
                        {codeFailed
                          ? 'Couldn’t load the Spotify Code. Try another Spotify link:'
                          : 'Paste this song’s Spotify link to generate its real Spotify Code:'}
                      </p>
                      <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-white/10 border border-cream-300 dark:border-white/20 p-1">
                        <input
                          type="url"
                          value={spotifyInput}
                          onChange={(e) => setSpotifyInput(e.target.value)}
                          placeholder="https://open.spotify.com/track/..."
                          className="flex-1 min-w-0 bg-transparent px-3 py-1 text-xs text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-white/35 outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!spotifyInput.trim()}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-wine-700 text-white dark:bg-rose-300 dark:text-stone-900 disabled:opacity-40 cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                      {spotifyError && <p className="text-[11px] text-red-500 dark:text-red-300">{spotifyError}</p>}
                    </form>
                  )}
                  <p className="mt-1.5 text-[10px] uppercase tracking-widest font-mono text-stone-400 dark:text-white/45 text-center">
                    {spotifyCodeUrl && !codeFailed ? 'Spotify app → Search → camera icon' : 'Spotify Code'}
                  </p>
                </div>

                {/* QR code (scannable by any phone camera, opens the logged link) */}
                <a
                  href={song.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex flex-col items-center"
                  title="Scan with your phone camera"
                >
                  <img
                    src={qrCodeUrl}
                    alt="QR code for this song"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-cream-200 dark:border-[#3A2832]"
                  />
                  <span className="mt-1.5 text-[10px] uppercase tracking-widest font-mono text-stone-400 dark:text-white/45">
                    {song.platform === 'spotify' ? 'Spotify' : 'YouTube'} QR
                  </span>
                </a>
              </div>
            </div>

            {/* ========================================================
                SECTION TO WRITE THE REASON OF THE CHOICE (Locked unless isEditing)
               ======================================================== */}
            <div className="relative z-30 my-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-rose-100/85 flex items-center gap-2">
                  <span>Reason for this choice</span>
                  {isEditing ? (
                    <span className="text-[11px] text-wine-700 dark:text-amber-300/80 font-normal lowercase">
                      (editing mode)
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400 dark:text-white/40 font-normal lowercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>locked • click Edit above to change</span>
                    </span>
                  )}
                </label>
                {isSaved && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-mono flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved ♡</span>
                  </span>
                )}
              </div>

              {/* Romantic Note Textarea / Locked View */}
              <div
                className={`flex-1 relative rounded-2xl overflow-hidden border transition-all ${
                  isEditing
                    ? 'border-wine-400 dark:border-amber-300/50 bg-[#FAF6F0] dark:bg-black/40 ring-1 ring-wine-300/40 dark:ring-amber-300/20'
                    : 'border-cream-200 dark:border-white/15 bg-[#FAF6F0]/80 dark:bg-black/25'
                }`}
              >
                {isEditing ? (
                  <textarea
                    value={reasonText}
                    onChange={handleReasonChange}
                    placeholder="Why did you choose this song for this month? Write down the memories, lyrics, feelings, or story behind it..."
                    className="w-full h-full min-h-[220px] p-5 text-sm sm:text-base text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-white/40 bg-transparent outline-none resize-none font-serif leading-relaxed"
                  />
                ) : (
                  <div
                    onClick={onToggleEdit}
                    className="w-full h-full min-h-[220px] p-5 text-sm sm:text-base text-stone-700 dark:text-white/90 font-serif leading-relaxed whitespace-pre-wrap cursor-pointer"
                    title="Click Edit to modify"
                  >
                    {reasonText.trim() ? (
                      reasonText
                    ) : (
                      <span className="text-stone-400 dark:text-white/35 italic">
                        No reflection written yet. Click &quot;Edit&quot; above to add your thoughts...
                      </span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 right-4 pointer-events-none text-[11px] font-mono text-stone-400 dark:text-white/30">
                  {reasonText.length} characters
                </div>
              </div>
            </div>

            {/* Back Side Bottom Bar: Quick Flip Back & Couple Watermark */}
            <div className="relative z-40 pt-4 border-t border-cream-200 dark:border-white/15 flex items-center justify-between text-xs text-stone-500 dark:text-white/60">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="hover:text-wine-800 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Return to song player</span>
              </button>

              <span className="font-serif italic text-stone-400 dark:text-white/40">
                Ever, Together ♡ Google & Nami
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CONFIRMATION POPUP MODAL FOR REMOVING SONG
         ======================================================== */}
      {isConfirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsConfirmingDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border text-center animate-in zoom-in-95 duration-200 space-y-4"
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: primaryText,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center text-red-500 dark:text-red-400">
              <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-serif text-xl font-bold tracking-tight text-stone-800 dark:text-white">
                Remove this song?
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-white/70 leading-relaxed px-2">
                This will delete the logged track, its rating, and your memories for this month.
              </p>
            </div>

            <div className="py-2 px-3 rounded-xl bg-cream-100 dark:bg-black/30 border border-cream-200 dark:border-white/10 text-xs text-stone-700 dark:text-white/80 truncate">
              <span className="font-medium text-stone-900 dark:text-white">{song.title || 'Logged Song'}</span>
              {song.artist && <span className="text-stone-500 dark:text-white/50"> • {song.artist}</span>}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-2.5 px-4 rounded-full bg-cream-100 hover:bg-cream-200 dark:bg-white/15 dark:hover:bg-white/25 active:scale-95 text-stone-700 dark:text-white text-xs sm:text-sm font-semibold transition-all border border-cream-300 dark:border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  deleteMonthSong(monthId);
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
