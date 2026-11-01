import { MusicLogEntry, MovieLogEntry, GameLogEntry, FoodLogEntry, MemoryLogEntry } from '@/types/database';

export interface ParsedMedia {
  platform: 'spotify' | 'youtube' | 'link';
  embedUrl?: string;
  originalUrl: string;
  id?: string;
  type?: string;
}

export function parseMusicUrl(url: string): ParsedMedia {
  const trimmed = url.trim();
  if (!trimmed) {
    return { platform: 'link', originalUrl: url };
  }

  // Spotify Track or Album or Playlist
  // Examples:
  // https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
  // https://open.spotify.com/intl-ja/track/4cOdK2wGLETKBW3PvgPWqT
  const spotifyMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    const type = spotifyMatch[1];
    const id = spotifyMatch[2];
    return {
      platform: 'spotify',
      type,
      id,
      originalUrl: trimmed,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`,
    };
  }

  // YouTube / YouTube Music
  // Examples:
  // https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // https://youtu.be/dQw4w9WgXcQ
  // https://music.youtube.com/watch?v=dQw4w9WgXcQ
  // https://www.youtube.com/embed/dQw4w9WgXcQ
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      platform: 'youtube',
      id,
      originalUrl: trimmed,
      embedUrl: `https://www.youtube.com/embed/${id}`,
    };
  }

  return {
    platform: 'link',
    originalUrl: trimmed,
  };
}

/**
 * Returns a Spotify URI (e.g. "spotify:track:4cOdK2wGLETKBW3PvgPWqT") for a Spotify link, or null.
 */
export function getSpotifyUri(url?: string): string | null {
  if (!url) return null;
  const parsed = parseMusicUrl(url);
  if (parsed.platform === 'spotify' && parsed.type && parsed.id) {
    return `spotify:${parsed.type}:${parsed.id}`;
  }
  return null;
}

/**
 * Convert "#rgb", "#rrggbb" or "hsl(h, s%, l%)" into a 6-digit hex string WITHOUT the leading "#".
 */
export function cssColorToHex(color: string, fallback = '231826'): string {
  const c = color.trim();
  const hexMatch = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const h = hexMatch[1];
    return (h.length === 3 ? h.split('').map((x) => x + x).join('') : h).toUpperCase();
  }
  const hslMatch = c.match(/^hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);
  if (hslMatch) {
    const h = Number(hslMatch[1]) / 360;
    const s = Number(hslMatch[2]) / 100;
    const l = Number(hslMatch[3]) / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r, g, b]
      .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }
  return fallback;
}

/**
 * Official, scannable Spotify Code image (scan in the Spotify app: Search → camera icon).
 */
export function getSpotifyCodeImageUrl(
  spotifyUri: string,
  bgHex: string,
  barColor: 'white' | 'black' = 'white',
  size = 640
): string {
  return `https://scannables.scdn.co/uri/plain/png/${bgHex}/${barColor}/${size}/${spotifyUri}`;
}

/**
 * Standard QR code image that any phone camera can scan.
 */
export function getQrCodeImageUrl(data: string, darkHex = '1A1A1A', lightHex = 'FFFFFF', size = 300): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
    data
  )}&color=${darkHex}&bgcolor=${lightHex}`;
}

/**
 * Generate a deterministic rich aesthetic palette based on a seed string
 */
export function getFallbackColors(seed: string): { canvasColor: string; accentColor: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const palettes = [
    { canvasColor: '#2B1C28', accentColor: '#E6A5B8' }, // Romantic velvet plum
    { canvasColor: '#1E2922', accentColor: '#9FD4B4' }, // Deep forest sage
    { canvasColor: '#1E2333', accentColor: '#A3BCE2' }, // Midnight twilight blue
    { canvasColor: '#2E221B', accentColor: '#E5B899' }, // Warm vintage ember
    { canvasColor: '#2A1E32', accentColor: '#C4A5E6' }, // Deep amethyst violet
    { canvasColor: '#301F22', accentColor: '#E8A3A8' }, // Crimson wine
    { canvasColor: '#1B262C', accentColor: '#BBE1FA' }, // Nordic slate
    { canvasColor: '#28261E', accentColor: '#E6DE9F' }, // Warm antique olive
  ];

  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

/**
 * Client-side dominant tone extractor using HTML Canvas
 */
export function extractColorsFromImage(imageUrl: string): Promise<{ canvasColor: string; accentColor: string }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(getFallbackColors(imageUrl));
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const timeout = setTimeout(() => {
      resolve(getFallbackColors(imageUrl));
    }, 1500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(getFallbackColors(imageUrl));

        ctx.drawImage(img, 0, 0, 30, 30);
        const imgData = ctx.getImageData(0, 0, 30, 30).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const red = imgData[i];
          const green = imgData[i + 1];
          const blue = imgData[i + 2];
          // Skip pure black or pure white pixels
          const brightness = (red + green + blue) / 3;
          if (brightness > 25 && brightness < 235) {
            r += red;
            g += green;
            b += blue;
            count++;
          }
        }

        if (count === 0) {
          return resolve(getFallbackColors(imageUrl));
        }

        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);

        // Convert RGB to HSL to produce deep canvas tone and glowing accent
        const [h, s] = rgbToHsl(avgR, avgG, avgB);

        // Deep rich canvas background (darkness with hue)
        const canvasColor = `hsl(${Math.round(h)}, ${Math.min(50, Math.round(s * 100))}%, 14%)`;
        // Bright lively accent for text/decorations
        const accentColor = `hsl(${Math.round(h)}, ${Math.max(65, Math.round(s * 100))}%, 74%)`;

        resolve({ canvasColor, accentColor });
      } catch {
        resolve(getFallbackColors(imageUrl));
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(getFallbackColors(imageUrl));
    };

    img.src = imageUrl;
  });
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

/**
 * Fetch and extract rich metadata for a music link (YouTube or Spotify)
 */
export async function fetchSongMetadata(rawUrl: string): Promise<MusicLogEntry> {
  const url = rawUrl.trim();
  const parsed = parseMusicUrl(url);

  let title = 'Song of the Month';
  let artist = 'Unknown Artist';
  let thumbnailUrl = '';
  let views = '18.4M streams';
  let duration = '3:45';
  let durationSeconds = 225;
  let genre = 'Indie Pop';

  if (parsed.platform === 'youtube' && parsed.id) {
    thumbnailUrl = `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`;
    views = `${(Math.floor(Math.random() * 80) + 12).toFixed(1)}M views`;
    duration = '3:35';
    durationSeconds = 215;
    genre = 'Acoustic / Indie Pop';

    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${parsed.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          const rawTitle: string = data.title;
          if (rawTitle.includes(' - ')) {
            const parts = rawTitle.split(' - ');
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').replace(/\(Official.*?\)/gi, '').replace(/\[Official.*?\]/gi, '').trim();
          } else {
            title = rawTitle.replace(/\(Official.*?\)/gi, '').replace(/\[Official.*?\]/gi, '').trim();
            artist = data.author_name || 'YouTube Creator';
          }
        }
        if (data.thumbnail_url) {
          thumbnailUrl = data.thumbnail_url;
        }
      }
    } catch {
      title = 'Favorite Track';
      artist = 'YouTube Music';
    }
  } else if (parsed.platform === 'spotify') {
    views = `${(Math.floor(Math.random() * 90) + 15).toFixed(1)}M streams`;
    duration = '3:20';
    durationSeconds = 200;
    genre = 'Spotify Masterpiece';

    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          title = data.title;
        }
        if (data.thumbnail_url) {
          thumbnailUrl = data.thumbnail_url;
        }
      }
    } catch {
      title = 'Spotify Track';
      artist = 'Spotify Artist';
    }

    if (!thumbnailUrl) {
      thumbnailUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
    }
  } else {
    thumbnailUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
  }

  // Extract tone for the canvas
  const colors = await extractColorsFromImage(thumbnailUrl || url);

  return {
    url,
    title,
    artist,
    thumbnailUrl,
    canvasColor: colors.canvasColor,
    accentColor: colors.accentColor,
    rating: 9.6,
    views,
    duration,
    durationSeconds,
    genre,
    platform: parsed.platform,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch and extract rich metadata for a movie link (YouTube trailer, Letterboxd, IMDb, or direct URL)
 */
export async function fetchMovieMetadata(rawUrl: string): Promise<MovieLogEntry> {
  const url = rawUrl.trim();
  const parsed = parseMusicUrl(url);

  let title = 'Feature Film of the Month';
  let director = 'Cinema Screening';
  let thumbnailUrl = '';
  let genre = 'Romance / Drama';
  let platform: 'youtube' | 'imdb' | 'letterboxd' | 'link' = 'link';
  let canonicalUrl = url;
  let year: string | undefined;
  let starring: string | undefined;

  if (parsed.platform === 'youtube' && parsed.id) {
    platform = 'youtube';
    thumbnailUrl = `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`;

    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${parsed.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          let rawTitle: string = data.title;
          // Clean up common trailer suffixes
          rawTitle = rawTitle
            .replace(/\(Official\s*Trailer.*?\)/gi, '')
            .replace(/\[Official\s*Trailer.*?\]/gi, '')
            .replace(/-\s*Official\s*Trailer.*/gi, '')
            .replace(/\|\s*Official\s*Trailer.*/gi, '')
            .replace(/Official\s*Trailer/gi, '')
            .replace(/\(4K.*?\)/gi, '')
            .replace(/\[4K.*?\]/gi, '')
            .trim();

          if (rawTitle.includes(' - ')) {
            const parts = rawTitle.split(' - ');
            title = parts[0].trim();
            director = parts.slice(1).join(' - ').trim() || data.author_name || 'Studio Release';
          } else {
            title = rawTitle || 'Movie of the Month';
            director = data.author_name || 'Studio Release';
          }
        }
        if (data.thumbnail_url) {
          thumbnailUrl = data.thumbnail_url;
        }
      }
    } catch {
      title = 'Midnight Screening';
      director = 'Cinema Feature';
    }
  } else if (/letterboxd\.com\/film\/([a-z0-9-]+)/i.test(url)) {
    platform = 'letterboxd';
    const match = url.match(/letterboxd\.com\/film\/([a-z0-9-]+)/i);
    if (match && match[1]) {
      title = match[1]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    director = 'Letterboxd Selection';
    thumbnailUrl = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
  } else if (extractImdbId(url)) {
    platform = 'imdb';
    const imdbId = extractImdbId(url) as string;
    // Normalise localized / mobile / share variants to the canonical title page
    canonicalUrl = `https://www.imdb.com/title/${imdbId}/`;
    title = 'IMDb Feature Film';
    director = '';
    thumbnailUrl = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

    // IMDb's public suggestion endpoint returns title, year, top cast & poster (CORS-enabled)
    try {
      const res = await fetch(`https://v3.sg.media-imdb.com/suggestion/x/${imdbId}.json`);
      if (res.ok) {
        const data = await res.json();
        const hit = (data?.d || []).find((d: { id?: string }) => d.id === imdbId) || data?.d?.[0];
        if (hit) {
          if (hit.l) title = hit.l;
          if (hit.y) year = String(hit.y);
          if (hit.s) starring = hit.s;
          if (hit.i?.imageUrl) {
            // Request a lighter 800px rendition of the poster
            thumbnailUrl = String(hit.i.imageUrl).replace(/\._V1_.*\.jpg$/i, '._V1_UX800_.jpg');
          }
        }
      }
    } catch {
      // Keep placeholder metadata; the user can fill it in via Edit
    }
  } else {
    thumbnailUrl = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
  }

  // Infer genre keyword if possible
  const lower = `${title} ${director}`.toLowerCase();
  if (lower.includes('anime') || lower.includes('ghibli') || lower.includes('shinkai') || lower.includes('animation')) {
    genre = 'Animation / Romance';
  } else if (lower.includes('sci-fi') || lower.includes('dune') || lower.includes('interstellar') || lower.includes('space')) {
    genre = 'Sci-Fi / Epic';
  } else if (lower.includes('horror') || lower.includes('thriller') || lower.includes('mystery')) {
    genre = 'Thriller / Mystery';
  } else if (lower.includes('comedy') || lower.includes('funny')) {
    genre = 'Romantic Comedy';
  } else {
    genre = 'Romance / Cinema';
  }

  const colors = await extractColorsFromImage(thumbnailUrl || url);

  return {
    url: canonicalUrl,
    title,
    director,
    thumbnailUrl,
    canvasColor: colors.canvasColor,
    accentColor: colors.accentColor,
    rating: 9.7,
    genre,
    platform,
    ...(year ? { year } : {}),
    ...(starring ? { starring } : {}),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Extracts an IMDb title id (tt1234567) from any IMDb URL variant:
 * www / m. subdomains, localized paths (imdb.com/th/title/...), or a bare id.
 */
export function extractImdbId(url: string): string | null {
  const match =
    url.match(/imdb\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?title\/(tt\d{5,})/i) ||
    url.trim().match(/^(tt\d{5,})$/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Fetch and extract metadata for a Game link (YouTube trailer, Steam, or cover art URL)
 */
export async function fetchGameMetadata(rawUrl: string): Promise<GameLogEntry> {
  const url = rawUrl.trim();
  const parsed = parseMusicUrl(url);

  let title = 'Co-Op Game of the Month';
  let developer = 'Game Studio';
  let thumbnailUrl = '';
  const genre = 'Co-Op Adventure';
  let platform: 'youtube' | 'steam' | 'link' = 'link';

  if (parsed.platform === 'youtube' && parsed.id) {
    platform = 'youtube';
    thumbnailUrl = `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`;

    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${parsed.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          let rawTitle: string = data.title;
          rawTitle = rawTitle
            .replace(/\(Official.*?\)/gi, '')
            .replace(/\[Official.*?\]/gi, '')
            .replace(/-\s*Official\s*Trailer.*/gi, '')
            .replace(/Official\s*Reveal\s*Trailer/gi, '')
            .replace(/Official\s*Gameplay\s*Trailer/gi, '')
            .replace(/Official\s*Trailer/gi, '')
            .trim();
          title = rawTitle || 'Game of the Month';
          developer = data.author_name || 'Game Studio';
        }
        if (data.thumbnail_url) {
          thumbnailUrl = data.thumbnail_url;
        }
      }
    } catch {
      title = 'Player 1 & Player 2';
      developer = 'Co-Op Cartridge';
    }
  } else if (/store\.steampowered\.com\/app\/(\d+)\/?([a-zA-Z0-9_]*)/i.test(url)) {
    platform = 'steam';
    const match = url.match(/store\.steampowered\.com\/app\/(\d+)\/?([a-zA-Z0-9_]*)/i);
    if (match) {
      const appId = match[1];
      const slug = match[2];
      if (slug) {
        title = slug.split('_').join(' ');
      } else {
        title = `Steam Game #${appId}`;
      }
      thumbnailUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
    }
    developer = 'Steam Release';
  } else {
    thumbnailUrl = /\.(jpg|jpeg|png|webp|gif)/i.test(url)
      ? url
      : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80';
  }

  const colors = await extractColorsFromImage(thumbnailUrl || url);

  return {
    url,
    title,
    developer,
    thumbnailUrl,
    canvasColor: colors.canvasColor,
    accentColor: colors.accentColor,
    rating: 9.8,
    genre,
    hisRole: 'Player 1 🧸',
    herRole: 'Player 2 🐶',
    hoursPlayed: '18.5 hrs',
    completionStatus: '100% Completed ♡',
    platform,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch and extract metadata for a Food / Restaurant entry (Photo link, YouTube, or Google Maps URL)
 */
export async function fetchFoodMetadata(rawUrl: string): Promise<FoodLogEntry> {
  const url = rawUrl.trim();
  const parsed = parseMusicUrl(url);

  let title = 'Signature Date Night Dish';
  let restaurant = 'Table for Two';
  let thumbnailUrl = '';
  const genre = 'Chef’s Special';
  let platform: 'youtube' | 'link' = 'link';

  if (parsed.platform === 'youtube' && parsed.id) {
    platform = 'youtube';
    thumbnailUrl = `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`;
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${parsed.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.author_name) restaurant = data.author_name;
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      }
    } catch {
      // Fallback
    }
  } else {
    thumbnailUrl =
      /\.(jpg|jpeg|png|webp|gif)/i.test(url) || url.includes('images.unsplash.com')
        ? url
        : 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=85';
  }

  const colors = await extractColorsFromImage(thumbnailUrl || url);

  return {
    url,
    title,
    restaurant,
    thumbnailUrl,
    canvasColor: colors.canvasColor,
    accentColor: colors.accentColor,
    rating: 9.6,
    genre,
    cravingLevel: 'Would travel 2 hrs just to eat this again! 🍷',
    orderItems: [
      `1x ${title}`,
      '2x House Special Drinks',
      '1x Sweet Dessert to Share ♡',
    ],
    platform,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch and extract metadata for a Memory Polaroid entry (Photo URL or YouTube video)
 */
export async function fetchMemoryMetadata(rawUrl: string): Promise<MemoryLogEntry> {
  const url = rawUrl.trim();
  const parsed = parseMusicUrl(url);

  let title = 'A moment we want to keep forever ♡';
  let location = 'Together • 2026';
  let thumbnailUrl = '';
  const genre = 'Core Memory';
  let platform: 'youtube' | 'link' = 'link';

  if (parsed.platform === 'youtube' && parsed.id) {
    platform = 'youtube';
    thumbnailUrl = `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`;
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${parsed.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.author_name) location = data.author_name;
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      }
    } catch {
      // Fallback
    }
  } else {
    thumbnailUrl =
      /\.(jpg|jpeg|png|webp|gif)/i.test(url) || url.includes('images.unsplash.com')
        ? url
        : 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=85';
  }

  const colors = await extractColorsFromImage(thumbnailUrl || url);

  return {
    url,
    title,
    location,
    thumbnailUrl,
    canvasColor: colors.canvasColor,
    accentColor: colors.accentColor,
    rating: 10.0,
    genre,
    washiStyle: 'rose',
    platform,
    updated_at: new Date().toISOString(),
  };
}
