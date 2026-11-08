'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Play,
  Pause,
  Sparkles,
  Quote,
  Volume2,
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
  const {
    deleteMonthSong,
    updateMonthSongRating,
    updateMonthSongReason,
    updateMonthSongSpotify,
    updateMonthSongDetails,
    theme,
  } = useApp();
  const isDark = theme === 'dark';

  // Flip state (front: Apple Music Now Playing | back: Apple Music Live Lyrics & Codes)
  const [isFlipped, setIsFlipped] = useState(false);

  // Inline player state (tap album cover to toggle live Spotify / YouTube embed)
  const [isPlayingEmbed, setIsPlayingEmbed] = useState(false);

  // Rating editing state (with decimal point e.g. 9.5)
  const [ratingInput, setRatingInput] = useState<string>((song.rating ?? 9.5).toFixed(1));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Editable track metadata when in Edit mode
  const [titleInput, setTitleInput] = useState(song.title || '');
  const [artistInput, setArtistInput] = useState(song.artist || '');
  const [genreInput, setGenreInput] = useState(song.genre || '');
  const [thumbInput, setThumbInput] = useState(song.thumbnailUrl || '');

  // Reason of choice state with debounced auto-save for zero typing lag
  const [reasonText, setReasonText] = useState(song.reason || '');
  const [isSaved, setIsSaved] = useState(false);
  const isNotesFocusedRef = useRef(false);
  const reasonDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const savedBadgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Remove confirmation state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isNotesFocusedRef.current) {
      setReasonText(song.reason || '');
    }
  }, [song.reason, monthId]);

  useEffect(() => {
    setRatingInput((song.rating ?? 9.5).toFixed(1));
  }, [song.rating]);

  useEffect(() => {
    setTitleInput(song.title || '');
    setArtistInput(song.artist || '');
    setGenreInput(song.genre || '');
    setThumbInput(song.thumbnailUrl || '');
  }, [song.title, song.artist, song.genre, song.thumbnailUrl]);

  useEffect(() => {
    setIsPlayingEmbed(false);
  }, [song.url]);

  const triggerSavedBadge = () => {
    if (savedBadgeTimerRef.current) clearTimeout(savedBadgeTimerRef.current);
    setIsSaved(true);
    savedBadgeTimerRef.current = setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReasonText(newText);
    if (reasonDebounceRef.current) clearTimeout(reasonDebounceRef.current);
    reasonDebounceRef.current = setTimeout(() => {
      updateMonthSongReason(monthId, newText);
      triggerSavedBadge();
    }, 400);
  };

  const handleReasonBlur = () => {
    isNotesFocusedRef.current = false;
    if (reasonDebounceRef.current) {
      clearTimeout(reasonDebounceRef.current);
      reasonDebounceRef.current = null;
    }
    if (reasonText !== (song.reason || '')) {
      updateMonthSongReason(monthId, reasonText);
      triggerSavedBadge();
    }
  };

  const handleDetailBlur = () => {
    updateMonthSongDetails(monthId, {
      title: titleInput.trim() || 'Untitled Track',
      artist: artistInput.trim() || 'Unknown Artist',
      genre: genreInput.trim() || 'Song of the Month',
      thumbnailUrl: thumbInput.trim() || undefined,
    });
    triggerSavedBadge();
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
  const canEmbed = Boolean((parsed.platform === 'youtube' || parsed.platform === 'spotify') && parsed.embedUrl);

  const currentRating = song.rating ?? 9.5;
  const displayRating = hoverRating !== null && isEditing ? hoverRating : currentRating;
  const ratingPercent = Math.min(100, Math.max(8, (displayRating / 10) * 100));

  // Scannable codes synced to Dark / Light theme
  const spotifyUri = getSpotifyUri(song.url) || getSpotifyUri(song.spotifyUrl);
  const codeBgHex = isDark ? '18141C' : 'F4EFF2';
  const codeBarColor = isDark ? 'white' : 'black';
  const qrFgHex = isDark ? 'F5ECF0' : '2A1E24';
  const qrBgHex = isDark ? '18141C' : 'F4EFF2';

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

  // Shared Apple Music frosted glass background layers (Blurred Album-Art Mesh + Frosted Grainy Glass)
  const renderAppleMusicGlassBackdrop = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[34px] z-0">
      {/* 1. Dynamic Blurred Album-Art Color Mesh */}
      {song.thumbnailUrl ? (
        <>
          <img
            src={song.thumbnailUrl}
            alt=""
            aria-hidden="true"
            className="absolute -top-1/4 -left-1/4 w-[145%] h-[145%] max-w-none object-cover blur-[72px] saturate-[185%] opacity-55 dark:opacity-50 scale-125 transition-all duration-700"
          />
          <img
            src={song.thumbnailUrl}
            alt=""
            aria-hidden="true"
            className="absolute -bottom-1/4 -right-1/4 w-[140%] h-[140%] max-w-none object-cover blur-[85px] saturate-[170%] opacity-45 dark:opacity-40 scale-125 rotate-12 transition-all duration-700"
          />
        </>
      ) : (
        <div
          className="absolute inset-0 opacity-60 blur-3xl"
          style={{
            background: `radial-gradient(circle at 25% 25%, ${
              song.accentColor || '#E85D88'
            }55 0%, ${song.canvasColor || '#4A1E34'}44 55%, transparent 100%)`,
          }}
        />
      )}

      {/* 2. Frosted Shower-Glass Diffusion Wash */}
      <div
        className="absolute inset-0 backdrop-blur-3xl transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(155deg, rgba(24, 20, 28, 0.64) 0%, rgba(16, 13, 20, 0.74) 55%, rgba(12, 10, 16, 0.80) 100%)'
            : 'linear-gradient(155deg, rgba(255, 255, 255, 0.66) 0%, rgba(252, 248, 251, 0.54) 55%, rgba(248, 242, 247, 0.64) 100%)',
        }}
      />

      {/* 3. Etched Sandblasted Glass Grain Overlay */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.22 : 0.24,
          mixBlendMode: isDark ? 'soft-light' : 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='amGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23amGrain)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
        }}
      />

      {/* 4. Top Specular Glass Reflection Sheen */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)',
        }}
      />
    </div>
  );

  // Glass pill button classes
  const glassPill =
    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95 backdrop-blur-xl border border-white/55 dark:border-white/15 bg-white/40 hover:bg-white/60 text-stone-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]';

  const editField =
    'w-full bg-white/30 dark:bg-white/10 rounded-lg px-2.5 py-1 outline-none border border-white/50 dark:border-white/20 focus:border-wine-500 dark:focus:border-rose-300 text-stone-900 dark:text-white placeholder:opacity-50';

  return (
    <div className="w-full max-w-[540px] mx-auto py-2">
      {/* 3D Flip Card Container */}
      <div
        className="w-full relative [perspective:2200px] select-none"
        style={{ minHeight: '780px' }}
      >
        <div
          className="w-full relative rounded-[34px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.78s cubic-bezier(0.22, 1, 0.36, 1)',
            minHeight: '780px',
          }}
        >
          {/* ========================================================
              FRONT SIDE: Apple Music "Now Playing" Glassmorphic Sheet
             ======================================================== */}
          <div
            className={`w-full rounded-[34px] p-6 sm:p-8 relative border border-white/65 dark:border-white/15 flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.16), 0 32px 80px -16px rgba(0, 0, 0, 0.75)'
                : 'inset 0 1px 1px rgba(255,255,255,0.85), 0 28px 70px -16px rgba(60, 30, 45, 0.18)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              minHeight: '780px',
            }}
          >
            {renderAppleMusicGlassBackdrop()}

            {/* Top Sheet Grabber & Header Controls */}
            <div className="relative z-10">
              {/* Apple Music Sheet Grabber */}
              <div className="w-10 h-1 rounded-full bg-stone-900/20 dark:bg-white/25 mx-auto mb-4" />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] bg-white/35 dark:bg-white/10 border border-white/50 dark:border-white/12 text-stone-700 dark:text-white/80 backdrop-blur-md">
                    <Volume2 className="w-3 h-3 opacity-75" />
                    <span>Now Playing</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onToggleEdit}
                    className={
                      isEditing
                        ? 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95 bg-wine-700 text-white dark:bg-rose-400 dark:text-stone-950 shadow-sm'
                        : glassPill
                    }
                    title={isEditing ? 'Save and lock edits' : 'Edit song details and rating'}
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
                      setIsPlayingEmbed(false);
                      setIsFlipped(true);
                    }}
                    className={`group ${glassPill}`}
                    title="Flip to Apple Music Live Lyrics & Notes view"
                  >
                    <Quote className="w-3.5 h-3.5 opacity-80 group-hover:scale-110 transition-transform" />
                    <span>Lyrics &amp; Notes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 1. Floating Square Album Cover / Inline Player */}
            <div className="relative z-10 my-5 flex flex-col items-center">
              <div
                className={`relative w-full max-w-[330px] aspect-square rounded-[26px] overflow-hidden border border-white/50 dark:border-white/15 bg-stone-900 transition-transform duration-500 ease-out ${
                  isPlayingEmbed ? 'scale-100' : 'hover:scale-[1.015]'
                }`}
                style={{
                  boxShadow: isDark
                    ? '0 28px 60px -12px rgba(0, 0, 0, 0.72), 0 8px 24px -6px rgba(0, 0, 0, 0.5)'
                    : '0 26px 55px -12px rgba(45, 20, 35, 0.32), 0 8px 20px -6px rgba(45, 20, 35, 0.15)',
                }}
              >
                {isPlayingEmbed && canEmbed && parsed.embedUrl ? (
                  <div className="w-full h-full relative bg-black">
                    <iframe
                      src={
                        parsed.platform === 'youtube'
                          ? `${parsed.embedUrl}${parsed.embedUrl.includes('?') ? '&' : '?'}autoplay=1`
                          : parsed.embedUrl
                      }
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                      title={song.title || 'Song Player'}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPlayingEmbed(false)}
                      className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 hover:bg-black/90 text-white border border-white/25 backdrop-blur-md cursor-pointer transition-all"
                    >
                      Cover Art
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => canEmbed && setIsPlayingEmbed(true)}
                    className={`w-full h-full relative group ${canEmbed ? 'cursor-pointer' : ''}`}
                  >
                    {song.thumbnailUrl ? (
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title || 'Album Artwork'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-500/30 via-purple-500/25 to-blue-500/30 text-white/70">
                        <Radio className="w-16 h-16 stroke-[1.4]" />
                      </div>
                    )}

                    {/* Subtle bottom gradient + Frosted Play Pill on Cover */}
                    {canEmbed && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-85 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/85 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20">
                          {parsed.platform === 'spotify' ? 'Spotify' : 'YouTube'}
                        </span>
                        <span className="w-11 h-11 rounded-full bg-white/85 dark:bg-white/90 text-stone-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional Cover Art URL input while editing */}
              {isEditing && (
                <div className="w-full max-w-[330px] mt-3">
                  <input
                    type="url"
                    value={thumbInput}
                    onChange={(e) => setThumbInput(e.target.value)}
                    onBlur={handleDetailBlur}
                    placeholder="Custom album cover image URL (optional)..."
                    className={`${editField} text-xs`}
                  />
                </div>
              )}
            </div>

            {/* 2. Apple Music Track Info + Scrubber + Rating Controls */}
            <div className="relative z-10 space-y-4">
              {/* Left-Aligned Title & Artist Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={handleDetailBlur}
                        placeholder="Song Title"
                        className={`${editField} font-bold text-lg`}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={artistInput}
                          onChange={(e) => setArtistInput(e.target.value)}
                          onBlur={handleDetailBlur}
                          placeholder="Artist"
                          className={`${editField} text-sm`}
                        />
                        <input
                          type="text"
                          value={genreInput}
                          onChange={(e) => setGenreInput(e.target.value)}
                          onBlur={handleDetailBlur}
                          placeholder="Genre"
                          className={`${editField} text-sm`}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-sans text-2xl sm:text-[26px] font-bold tracking-tight text-stone-900 dark:text-white leading-tight truncate">
                        {song.title || 'Untitled Track'}
                      </h3>
                      <p className="text-base sm:text-[17px] font-medium text-stone-600 dark:text-white/70 truncate">
                        {song.artist || 'Unknown Artist'}
                      </p>
                    </>
                  )}
                </div>

                {/* Genre Pill Badge */}
                {!isEditing && (
                  <span className="shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/40 dark:bg-white/10 border border-white/55 dark:border-white/15 text-stone-700 dark:text-white/85 backdrop-blur-md mt-1">
                    {song.genre || 'Music'}
                  </span>
                )}
              </div>

              {/* Apple Music Scrubber Bar (Synced to Rating Score) */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-1.5 rounded-full bg-stone-900/12 dark:bg-white/15 overflow-hidden backdrop-blur-xs">
                  <div
                    className="h-full rounded-full bg-stone-800/80 dark:bg-white/90 transition-all duration-300"
                    style={{ width: `${ratingPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] tracking-wider text-stone-500 dark:text-white/50">
                  <span>{monthId}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-stone-900/8 dark:bg-white/10 text-[9px] font-semibold uppercase tracking-[0.16em]">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Lossless · {currentRating.toFixed(1)}/10</span>
                  </span>
                  <span>-00:00</span>
                </div>
              </div>

              {/* Frosted Glass Rating & Controls Dock */}
              <div className="rounded-2xl p-3.5 bg-white/35 dark:bg-white/[0.07] backdrop-blur-xl border border-white/55 dark:border-white/12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => (
                      <button
                        key={starIndex}
                        type="button"
                        disabled={!isEditing}
                        onClick={() => handleStarClick(starIndex)}
                        onMouseEnter={() => isEditing && setHoverRating(starIndex)}
                        onMouseLeave={() => isEditing && setHoverRating(null)}
                        className={`p-0.5 transition-transform ${
                          isEditing ? 'hover:scale-125 cursor-pointer' : 'cursor-default'
                        }`}
                        title={isEditing ? `Rate ${starIndex}/10` : 'Click Edit to adjust rating'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            starIndex <= displayRating
                              ? 'text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]'
                              : 'text-stone-400/40 dark:text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1 bg-white/50 dark:bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/60 dark:border-white/20">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={ratingInput}
                        onChange={handleRatingInputChange}
                        className="w-11 bg-transparent text-xs sm:text-sm font-mono font-bold text-stone-900 dark:text-amber-300 outline-none text-center"
                        title="Edit decimal rating"
                      />
                      <span className="font-mono text-[11px] opacity-60">/10</span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs sm:text-sm font-bold text-stone-800 dark:text-white/90 flex items-center gap-1">
                      <span>{currentRating.toFixed(1)} / 10</span>
                      <Lock className="w-3 h-3 opacity-35" />
                    </span>
                  )}
                </div>

                {/* Note preview snippet on front (tap to flip to Live Lyrics view) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingEmbed(false);
                    setIsFlipped(true);
                  }}
                  className="w-full text-left pt-1.5 border-t border-stone-900/10 dark:border-white/10 flex items-center justify-between gap-2 text-xs text-stone-600 dark:text-white/65 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span className="truncate italic font-serif">
                    {reasonText.trim()
                      ? `“${reasonText.trim()}”`
                      : 'Tap to write memories, lyrics, or reflections on the back...'}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider opacity-70">
                    Lyrics →
                  </span>
                </button>
              </div>

              {/* Bottom Bar: Play/Pause Toggle · External Link · Remove */}
              <div className="pt-1 flex items-center justify-between text-xs text-stone-600 dark:text-white/65">
                <div className="flex items-center gap-3">
                  {canEmbed && (
                    <button
                      type="button"
                      onClick={() => setIsPlayingEmbed((v) => !v)}
                      className="inline-flex items-center gap-1.5 font-semibold text-stone-800 dark:text-white hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {isPlayingEmbed ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Hide Player</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Inline</span>
                        </>
                      )}
                    </button>
                  )}

                  <a
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    <span>Open {song.platform === 'spotify' ? 'Spotify' : 'YouTube'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-300 transition-colors cursor-pointer"
                  title="Remove logged song"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              BACK SIDE: Apple Music "Live Lyrics" Glass View & Codes Dock
             ======================================================== */}
          <div
            className={`w-full absolute inset-0 rounded-[34px] p-6 sm:p-8 border border-white/65 dark:border-white/15 flex flex-col justify-between overflow-hidden ${
              isFlipped ? 'pointer-events-auto z-30' : 'pointer-events-none z-0'
            }`}
            style={{
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.16), 0 32px 80px -16px rgba(0, 0, 0, 0.75)'
                : 'inset 0 1px 1px rgba(255,255,255,0.85), 0 28px 70px -16px rgba(60, 30, 45, 0.18)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '780px',
            }}
          >
            {renderAppleMusicGlassBackdrop()}

            {/* Back Top Bar: Mini Track Header (Apple Music Live Lyrics Header) + Controls */}
            <div className="relative z-20">
              <div className="w-10 h-1 rounded-full bg-stone-900/20 dark:bg-white/25 mx-auto mb-4" />

              <div className="flex items-center justify-between gap-3">
                {/* Mini Track Pill (click to return to front player) */}
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="flex items-center gap-3 min-w-0 text-left group cursor-pointer"
                  title="Return to Now Playing"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-900 border border-white/50 dark:border-white/15 shadow-md shrink-0">
                    {song.thumbnailUrl ? (
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title || 'Track'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/60">
                        <Radio className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-sans text-sm sm:text-base font-bold text-stone-900 dark:text-white truncate">
                      {song.title || 'Untitled Track'}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-white/65 truncate">
                      {song.artist || 'Unknown Artist'}
                    </p>
                  </div>
                </button>

                {/* Right Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isSaved && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      <span>Saved ♡</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                    }}
                    className={`group ${glassPill}`}
                    title="Flip back to Now Playing"
                  >
                    <Repeat className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                    <span>Player</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Full-Bleed Apple Music "Live Lyrics" Memories & Reflections Canvas */}
            <div className="relative z-20 my-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-stone-600 dark:text-white/65">
                  Lyrics · Memories &amp; Reflections
                </span>
                <span className="text-[10px] font-mono text-stone-500 dark:text-white/45">
                  {reasonText.length} chars
                </span>
              </div>

              <div className="flex-1 relative rounded-3xl overflow-hidden bg-white/32 dark:bg-white/[0.06] backdrop-blur-xl border border-white/60 dark:border-white/14 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] focus-within:border-white/90 dark:focus-within:border-white/30 transition-all">
                <textarea
                  value={reasonText}
                  onFocus={() => {
                    isNotesFocusedRef.current = true;
                  }}
                  onChange={handleReasonChange}
                  onBlur={handleReasonBlur}
                  placeholder="Write your favorite lyrics, memories, feelings, or what this song means to you..."
                  className="w-full h-full min-h-[260px] p-5 sm:p-6 text-base sm:text-lg font-serif font-medium leading-relaxed text-stone-900 dark:text-white placeholder-stone-500/60 dark:placeholder-white/35 bg-transparent outline-none resize-none select-text cursor-text"
                />
              </div>
            </div>

            {/* Bottom Frosted Glass Scannable Codes Dock (Spotify Soundwave + QR) */}
            <div className="relative z-20 rounded-3xl p-4 sm:p-5 bg-white/38 dark:bg-white/[0.07] backdrop-blur-xl border border-white/60 dark:border-white/14 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Real Spotify Soundwave Code */}
                <div className="flex-1 w-full flex flex-col items-center">
                  {spotifyCodeUrl && !codeFailed ? (
                    <a
                      href={openSpotifyUrl || song.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full max-w-[260px] transition-transform hover:scale-[1.02]"
                      title="Scan in the Spotify app camera or click to open in Spotify"
                    >
                      <img
                        src={spotifyCodeUrl}
                        alt={`Spotify Code for ${song.title || 'this song'}`}
                        className="w-full h-auto rounded-xl shadow-xs"
                        onError={() => setCodeFailed(true)}
                      />
                    </a>
                  ) : (
                    <form onSubmit={handleAttachSpotify} className="w-full space-y-2">
                      <p className="text-[11px] text-stone-600 dark:text-white/70 leading-snug">
                        {codeFailed
                          ? 'Couldn’t load the Spotify Code. Try another Spotify link:'
                          : 'Paste this song’s Spotify link to generate its scannable Spotify Code:'}
                      </p>
                      <div className="flex items-center gap-1.5 rounded-full bg-white/60 dark:bg-black/35 border border-white/70 dark:border-white/20 p-1">
                        <input
                          type="url"
                          value={spotifyInput}
                          onChange={(e) => setSpotifyInput(e.target.value)}
                          placeholder="https://open.spotify.com/track/..."
                          className="flex-1 min-w-0 bg-transparent px-3 py-1 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-white/40 outline-none select-text"
                        />
                        <button
                          type="submit"
                          disabled={!spotifyInput.trim()}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-900 text-white dark:bg-white dark:text-stone-900 disabled:opacity-40 cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                      {spotifyError && (
                        <p className="text-[11px] text-red-600 dark:text-red-300">{spotifyError}</p>
                      )}
                    </form>
                  )}
                  <span className="mt-1.5 text-[9px] uppercase tracking-[0.2em] font-mono text-stone-500 dark:text-white/50">
                    Spotify Soundwave Code
                  </span>
                </div>

                {/* Right: Phone Camera QR Code */}
                <a
                  href={song.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex flex-col items-center group"
                  title="Scan with your phone camera"
                >
                  <img
                    src={qrCodeUrl}
                    alt="QR code for this song"
                    className="w-20 h-20 rounded-xl border border-white/60 dark:border-white/15 shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <span className="mt-1 text-[9px] uppercase tracking-[0.2em] font-mono text-stone-500 dark:text-white/50">
                    {song.platform === 'spotify' ? 'Spotify' : 'YouTube'} QR
                  </span>
                </a>
              </div>
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
            className="w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/30 dark:border-white/15 bg-white/85 dark:bg-[#1E161E]/90 backdrop-blur-2xl text-center animate-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center text-red-500 dark:text-red-400">
              <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-white">
                Remove this song?
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 leading-relaxed px-2">
                This will delete the logged track, its rating, and your memories for this month.
              </p>
            </div>

            <div className="py-2 px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs text-stone-700 dark:text-white/85 truncate">
              <span className="font-medium text-stone-900 dark:text-white">
                {song.title || 'Logged Song'}
              </span>
              {song.artist && (
                <span className="text-stone-500 dark:text-white/55"> • {song.artist}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-2.5 px-4 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/15 dark:hover:bg-white/25 active:scale-95 text-stone-700 dark:text-white text-xs sm:text-sm font-semibold transition-all border border-black/10 dark:border-white/15 cursor-pointer"
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
