import { Category, MonthData, UserId, UserProfile } from '@/types/database';

export const USERS: Record<UserId, UserProfile> = {
  google: {
    id: 'google',
    name: 'Google',
    partnerName: 'Nami',
    avatar: 'G',
    color: '#7E3B4D',
    bgLight: '#FAF0F2',
    borderColor: '#E8CCD2',
  },
  nami: {
    id: 'nami',
    name: 'Nami',
    partnerName: 'Google',
    avatar: 'N',
    color: '#4B6B58',
    bgLight: '#EEF3EE',
    borderColor: '#C8D8CC',
  },
};

export const CATEGORIES: Category[] = [
  { slug: 'movie', name: 'Movie', icon: 'Film' },
  { slug: 'game', name: 'Game', icon: 'Gamepad2' },
  { slug: 'food', name: 'Food', icon: 'Utensils' },
  { slug: 'memory', name: 'Memory', icon: 'Camera' },
  { slug: 'music', name: 'Music', icon: 'Music' },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns the real-time date components in Thailand Time (Asia/Bangkok, UTC+7).
 */
export function getThailandNow(): {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthId: string;
} {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(now);

    const year = Number(parts.find((p) => p.type === 'year')?.value) || now.getFullYear();
    const month = Number(parts.find((p) => p.type === 'month')?.value) || now.getMonth() + 1;
    const day = Number(parts.find((p) => p.type === 'day')?.value) || now.getDate();
    const monthName = MONTH_NAMES[month - 1] || 'November';
    const monthId = `${year}-${String(month).padStart(2, '0')}`;

    return { year, month, day, monthName, monthId };
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const monthName = MONTH_NAMES[month - 1] || 'November';
    const monthId = `${year}-${String(month).padStart(2, '0')}`;
    return { year, month, day, monthName, monthId };
  }
}

export const INITIAL_MONTHS: MonthData[] = [
  {
    id: '2026-10',
    month: 10,
    year: 2026,
    monthName: 'October',
    is_current: false,
    musicSong: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      artist: 'Rick Astley',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      canvasColor: '#2D2235',
      accentColor: '#D4A373',
      rating: 9.8,
      views: '1.5B views',
      duration: '3:32',
      durationSeconds: 212,
      genre: 'Synth-Pop / 80s Classics',
      platform: 'youtube',
    },
    movieLog: {
      url: 'https://www.youtube.com/watch?v=0pdqf4P9MB8',
      title: 'La La Land',
      year: '2016',
      director: 'Damien Chazelle',
      producer: 'Fred Berger',
      starring: 'Ryan Gosling, Emma Stone, John Legend, J.K. Simmons',
      thumbnailUrl: 'https://i.ytimg.com/vi/0pdqf4P9MB8/hqdefault.jpg',
      canvasColor: '#1E162B',
      accentColor: '#F4C95D',
      rating: 9.8,
      genre: 'Romance / Musical',
      platform: 'youtube',
      reason: '“Here’s to the ones who dream, foolish as they may seem.” — Watching the planetarium waltz together with the lights dimmed ♡',
    },
    gameLog: {
      url: 'https://www.youtube.com/watch?v=ohClxMmNLQQ',
      title: 'It Takes Two',
      developer: 'Hazelight Studios',
      thumbnailUrl: 'https://i.ytimg.com/vi/ohClxMmNLQQ/hqdefault.jpg',
      canvasColor: '#5F3514',
      accentColor: '#D9AD4E',
      rating: 9.9,
      genre: 'Co-Op Adventure',
      hisRole: 'Cody',
      herRole: 'May',
      hoursPlayed: '24.5 hrs',
      completionStatus: '100% Completed ♡',
      platform: 'youtube',
      reason: 'We laughed so hard during the magnet puzzle and the snowglobe village! Best co-op teamwork ever ♡',
    },
    foodLog: {
      url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=85',
      title: 'Truffle Cream Tagliolini & Wagyu',
      restaurant: 'Bistro Milano',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=85',
      canvasColor: '#2B1B17',
      accentColor: '#F5B895',
      rating: 9.6,
      genre: 'Italian Fine Dining',
      cravingLevel: 'Would travel 2 hrs just to eat this again! 🍷',
      orderItems: [
        '1x Truffle Cream Tagliolini',
        '1x A5 Wagyu Striploin Medium-Rare',
        '2x Sparkling Peach Bellini',
        '1x Warm Tiramisu for Two ♡',
      ],
      platform: 'link',
      reason: 'Sitting at our corner table by the window, stealing bites of each other’s pasta and laughing until closing time ♡',
    },
    memoryLog: {
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=85',
      title: 'Rainy midnight walk under one umbrella ♡',
      location: 'Tokyo • October 14, 2026',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=85',
      canvasColor: '#1B2420',
      accentColor: '#A7E8BD',
      rating: 10.0,
      genre: 'Late Night Walk',
      washiStyle: 'rose',
      platform: 'link',
      reason: 'The neon streetlights reflecting on the wet pavement, warm convenience store cocoa in our hands, and wishing the walk home would never end ♡',
    },
    categories: {
      movie: { category_slug: 'movie' },
      game: { category_slug: 'game' },
      food: { category_slug: 'food' },
      memory: { category_slug: 'memory' },
      music: { category_slug: 'music' },
    },
  },
  {
    id: '2026-11',
    month: 11,
    year: 2026,
    monthName: 'November',
    is_current: true,
    categories: {
      movie: { category_slug: 'movie' },
      game: { category_slug: 'game' },
      food: { category_slug: 'food' },
      memory: { category_slug: 'memory' },
      music: { category_slug: 'music' },
    },
  },
  {
    id: '2026-12',
    month: 12,
    year: 2026,
    monthName: 'December',
    categories: {
      movie: { category_slug: 'movie' },
      game: { category_slug: 'game' },
      food: { category_slug: 'food' },
      memory: { category_slug: 'memory' },
      music: { category_slug: 'music' },
    },
  },
];
