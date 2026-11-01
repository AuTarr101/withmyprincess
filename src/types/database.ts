export type CategorySlug = 'movie' | 'game' | 'food' | 'memory' | 'music';

export interface Category {
  slug: CategorySlug;
  name: string;
  icon: string;
}

export type UserId = 'google' | 'nami';

export interface UserProfile {
  id: UserId;
  name: string;
  partnerName: string;
  avatar: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

export interface UserCategoryPick {
  title: string;
  description?: string;
  image_url?: string;
  rating?: number; // 1-10
  thoughts?: string;
  updated_at?: string;
}

export interface MusicLogEntry {
  url: string;
  title?: string;
  artist?: string;
  thumbnailUrl?: string;
  canvasColor?: string; // Dominant tone for the widget outer canvas
  accentColor?: string;
  rating?: number; // 1-10
  views?: string; // e.g. "18.4M streams" or "42M views"
  duration?: string; // e.g. "3:42"
  durationSeconds?: number;
  genre?: string; // e.g. "Indie Pop", "Acoustic", etc.
  platform?: 'spotify' | 'youtube' | 'link';
  reason?: string; // Why this song was chosen for the month
  spotifyUrl?: string; // Optional Spotify link (used to generate a real Spotify Code for YouTube songs)
  updated_at?: string;
}

export interface MovieLogEntry {
  url: string;
  title?: string;
  director?: string;
  thumbnailUrl?: string;
  canvasColor?: string;
  accentColor?: string;
  rating?: number; // 1-10 (1 decimal)
  genre?: string; // Single genre badge e.g. "Romance / Drama"
  platform?: 'youtube' | 'imdb' | 'letterboxd' | 'link';
  reason?: string; // "Who cried first / favorite quote from the film"
  ticketUrl?: string; // Optional IMDb / Letterboxd URL for QR code
  year?: string; // Release year shown beside the poster title e.g. "2016"
  producer?: string; // "produced by" line on the minimalist poster
  starring?: string; // Comma-separated cast list e.g. "Emilia Clarke, Sam Claflin"
  stillUrl?: string; // Optional custom movie still image for the poster
  updated_at?: string;
}

export interface GameLogEntry {
  url: string;
  title?: string;
  developer?: string;
  thumbnailUrl?: string;
  canvasColor?: string;
  accentColor?: string;
  rating?: number; // 1-10 (1 decimal)
  genre?: string; // Single genre badge e.g. "Co-Op Adventure"
  hisRole?: string; // e.g. "Cody 🧸"
  herRole?: string; // e.g. "May 🐶"
  hoursPlayed?: string; // e.g. "24.5 hrs"
  completionStatus?: string; // e.g. "100% Completed ♡"
  platform?: 'youtube' | 'steam' | 'link';
  reason?: string; // "Funniest death or best teamwork moment"
  updated_at?: string;
}

export interface FoodLogEntry {
  url: string;
  title?: string;
  restaurant?: string;
  thumbnailUrl?: string;
  canvasColor?: string;
  accentColor?: string;
  rating?: number; // 1-10 (1 decimal)
  genre?: string; // Single cuisine badge e.g. "Italian Fine Dining"
  cravingLevel?: string; // e.g. "Would travel 2 hrs just to eat this again! 🍷"
  orderItems?: string[]; // Receipt line items
  mapsUrl?: string; // Optional Google Maps link for QR code
  platform?: 'youtube' | 'link';
  reason?: string; // "What were we laughing about over dinner?"
  updated_at?: string;
}

export interface MemoryLogEntry {
  url: string;
  title?: string; // Handwritten Polaroid caption
  location?: string; // e.g. "Tokyo • October 14, 2026"
  thumbnailUrl?: string;
  canvasColor?: string;
  accentColor?: string;
  rating?: number; // 1-10 (1 decimal Emotional Weight)
  genre?: string; // Single vibe badge e.g. "Late Night Walk"
  washiStyle?: 'rose' | 'gold' | 'sage';
  geotagUrl?: string; // Optional Google Maps pin for back QR
  platform?: 'youtube' | 'link';
  reason?: string; // "If we could pause time in this exact second, would we?"
  updated_at?: string;
}

export interface MonthCategoryRanking {
  category_slug: CategorySlug;
  google?: UserCategoryPick;
  nami?: UserCategoryPick;
  mutual_winner?: 'google' | 'nami' | 'both' | 'tie' | 'none';
}

export interface MonthData {
  id: string; // e.g. "2026-10"
  month: number; // 1-12
  year: number;
  monthName: string; // "October"
  cover_image?: string;
  categories: Record<CategorySlug, MonthCategoryRanking>;
  musicSong?: MusicLogEntry;
  movieLog?: MovieLogEntry;
  gameLog?: GameLogEntry;
  foodLog?: FoodLogEntry;
  memoryLog?: MemoryLogEntry;
  is_current?: boolean;
}
