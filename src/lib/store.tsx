'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Category,
  CategorySlug,
  MonthData,
  UserId,
  UserProfile,
  UserCategoryPick,
  MusicLogEntry,
  MovieLogEntry,
  GameLogEntry,
  FoodLogEntry,
  MemoryLogEntry,
} from '@/types/database';
import {
  CATEGORIES,
  INITIAL_MONTHS,
  MONTH_NAMES,
  USERS,
  getThailandNow,
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

export type Perspective = 'his' | 'her';

interface CoupleMonthlyLogRow {
  id?: string;
  perspective: Perspective;
  month_id: string;
  year: number;
  month: number;
  month_name: string;
  music_song?: MusicLogEntry | null;
  movie_log?: MovieLogEntry | null;
  game_log?: GameLogEntry | null;
  food_log?: FoodLogEntry | null;
  memory_log?: MemoryLogEntry | null;
  categories?: MonthData['categories'] | null;
  updated_at?: string;
}

function rowToMonthData(row: CoupleMonthlyLogRow): MonthData {
  return {
    id: row.month_id,
    month: row.month,
    year: row.year,
    monthName: row.month_name || MONTH_NAMES[row.month - 1] || 'Month',
    ...(row.music_song?.url ? { musicSong: row.music_song } : {}),
    ...(row.movie_log?.url ? { movieLog: row.movie_log } : {}),
    ...(row.game_log?.url ? { gameLog: row.game_log } : {}),
    ...(row.food_log?.url ? { foodLog: row.food_log } : {}),
    ...(row.memory_log?.url ? { memoryLog: row.memory_log } : {}),
    categories: row.categories || {
      movie: { category_slug: 'movie' },
      game: { category_slug: 'game' },
      food: { category_slug: 'food' },
      memory: { category_slug: 'memory' },
      music: { category_slug: 'music' },
    },
  };
}

function monthDataToRow(perspective: Perspective, m: MonthData): CoupleMonthlyLogRow {
  return {
    perspective,
    month_id: m.id,
    year: m.year,
    month: m.month,
    month_name: m.monthName || MONTH_NAMES[m.month - 1] || 'Month',
    music_song: m.musicSong?.url ? m.musicSong : null,
    movie_log: m.movieLog?.url ? m.movieLog : null,
    game_log: m.gameLog?.url ? m.gameLog : null,
    food_log: m.foodLog?.url ? m.foodLog : null,
    memory_log: m.memoryLog?.url ? m.memoryLog : null,
    categories: m.categories,
    updated_at: new Date().toISOString(),
  };
}

function createBlankMonth(year: number, month: number): MonthData {
  const id = `${year}-${String(month).padStart(2, '0')}`;
  return {
    id,
    month,
    year,
    monthName: MONTH_NAMES[month - 1] || `Month ${month}`,
    categories: {
      movie: { category_slug: 'movie' },
      game: { category_slug: 'game' },
      food: { category_slug: 'food' },
      memory: { category_slug: 'memory' },
      music: { category_slug: 'music' },
    },
  };
}

interface AppContextType {
  currentUser: UserProfile;
  otherUser: UserProfile;
  switchUser: (id: UserId) => void;
  categories: Category[];
  months: MonthData[];
  hisMonths: MonthData[];
  herMonths: MonthData[];
  currentMonth: MonthData;
  getMonth: (year: number, month: number) => MonthData;
  getPerspectiveMonth: (perspective: Perspective, year: number, month: number) => MonthData;
  activePerspective: Perspective;
  setActivePerspective: (p: Perspective) => void;
  isSupabaseConnected: boolean;
  updateUserPick: (
    monthId: string,
    categorySlug: CategorySlug,
    userId: UserId,
    pick: UserCategoryPick
  ) => void;
  saveMonthSong: (monthId: string, song: MusicLogEntry | string) => void;
  updateMonthSongRating: (monthId: string, rating: number) => void;
  updateMonthSongReason: (monthId: string, reason: string) => void;
  updateMonthSongSpotify: (monthId: string, spotifyUrl: string) => void;
  updateMonthSongDetails: (monthId: string, details: Partial<MusicLogEntry>) => void;
  deleteMonthSong: (monthId: string) => void;
  saveMonthMovie: (monthId: string, movie: MovieLogEntry | string) => void;
  updateMonthMovieRating: (monthId: string, rating: number) => void;
  updateMonthMovieReason: (monthId: string, reason: string) => void;
  updateMonthMovieDetails: (monthId: string, details: Partial<MovieLogEntry>) => void;
  deleteMonthMovie: (monthId: string) => void;
  saveMonthGame: (monthId: string, game: GameLogEntry | string) => void;
  updateMonthGameDetails: (monthId: string, details: Partial<GameLogEntry>) => void;
  deleteMonthGame: (monthId: string) => void;
  saveMonthFood: (monthId: string, food: FoodLogEntry | string) => void;
  updateMonthFoodDetails: (monthId: string, details: Partial<FoodLogEntry>) => void;
  deleteMonthFood: (monthId: string) => void;
  saveMonthMemory: (monthId: string, memory: MemoryLogEntry | string) => void;
  updateMonthMemoryDetails: (monthId: string, details: Partial<MemoryLogEntry>) => void;
  deleteMonthMemory: (monthId: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_LEGACY_MONTHS = 'ever_together_months_v3';
const STORAGE_KEY_HIS_MONTHS = 'ever_together_months_his_v4';
const STORAGE_KEY_HER_MONTHS = 'ever_together_months_her_v4';
const STORAGE_KEY_PERSPECTIVE = 'ever_together_perspective_v3';
const STORAGE_KEY_THEME = 'ever_together_theme';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activePerspective, setActivePerspectiveState] = useState<Perspective>('his');
  const [hisMonths, setHisMonths] = useState<MonthData[]>(INITIAL_MONTHS);
  const [herMonths, setHerMonths] = useState<MonthData[]>(INITIAL_MONTHS);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const currentUserKey: UserId = activePerspective === 'his' ? 'google' : 'nami';

  // Debounce timers & local edit timestamps so rapid edits don't spam Supabase or get overwritten by Realtime echoes
  const supabaseDebounceMapRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastLocalEditTimeMapRef = useRef<Map<string, number>>(new Map());

  const setActivePerspective = (p: Perspective) => {
    setActivePerspectiveState(p);
  };

  const switchUser = (id: UserId) => {
    setActivePerspectiveState(id === 'google' ? 'his' : 'her');
  };

  // Debounced sync of a single month entry for a given perspective to Supabase (if configured)
  const syncMonthToSupabase = useCallback((perspective: Perspective, monthData: MonthData) => {
    if (!isSupabaseConfigured || !supabase) return;
    const key = `${perspective}:${monthData.id}`;
    lastLocalEditTimeMapRef.current.set(key, Date.now());

    const existingTimer = supabaseDebounceMapRef.current.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(async () => {
      supabaseDebounceMapRef.current.delete(key);
      if (!supabase) return;
      try {
        lastLocalEditTimeMapRef.current.set(key, Date.now());
        const payload = monthDataToRow(perspective, monthData);
        const { error } = await supabase
          .from('couple_monthly_logs')
          .upsert(payload, { onConflict: 'perspective,month_id' });
        if (error) {
          console.warn('Supabase upsert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase sync error:', err);
      }
    }, 450);

    supabaseDebounceMapRef.current.set(key, timer);
  }, []);

  // 1. Load initial state from localStorage + fetch from Supabase if configured
  useEffect(() => {
    let loadedHis = INITIAL_MONTHS;
    let loadedHer = INITIAL_MONTHS;

    try {
      const savedPerspective = localStorage.getItem(STORAGE_KEY_PERSPECTIVE) as Perspective | null;
      if (savedPerspective === 'his' || savedPerspective === 'her') {
        setActivePerspectiveState(savedPerspective);
      }

      const rawHis = localStorage.getItem(STORAGE_KEY_HIS_MONTHS);
      const rawHer = localStorage.getItem(STORAGE_KEY_HER_MONTHS);
      const rawLegacy = localStorage.getItem(STORAGE_KEY_LEGACY_MONTHS);

      if (rawHis) {
        loadedHis = JSON.parse(rawHis);
      } else if (rawLegacy) {
        loadedHis = JSON.parse(rawLegacy);
      }

      if (rawHer) {
        loadedHer = JSON.parse(rawHer);
      } else if (rawLegacy) {
        loadedHer = JSON.parse(rawLegacy);
      }

      setHisMonths(loadedHis);
      setHerMonths(loadedHer);

      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error('Failed to load local storage', e);
    } finally {
      setIsLoaded(true);
    }

    // Fetch & subscribe to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      (async () => {
        try {
          const { data, error } = await client
            .from('couple_monthly_logs')
            .select('*');

          if (error) {
            console.warn('Supabase initial fetch error:', error.message);
            return;
          }

          setIsSupabaseConnected(true);
          const rows = (data || []) as CoupleMonthlyLogRow[];

          if (rows.length === 0) {
            // Seed current local His & Hers data into Supabase on first connect
            const seedRows: CoupleMonthlyLogRow[] = [
              ...loadedHis.map((m) => monthDataToRow('his', m)),
              ...loadedHer.map((m) => monthDataToRow('her', m)),
            ];
            await client
              .from('couple_monthly_logs')
              .upsert(seedRows, { onConflict: 'perspective,month_id' });
          } else {
            const remoteHis = rows
              .filter((r) => r.perspective === 'his')
              .map(rowToMonthData);
            const remoteHer = rows
              .filter((r) => r.perspective === 'her')
              .map(rowToMonthData);

            if (remoteHis.length > 0) {
              setHisMonths((prev) => {
                const map = new Map(prev.map((m) => [m.id, m]));
                remoteHis.forEach((rm) => map.set(rm.id, rm));
                return Array.from(map.values());
              });
            }
            if (remoteHer.length > 0) {
              setHerMonths((prev) => {
                const map = new Map(prev.map((m) => [m.id, m]));
                remoteHer.forEach((rm) => map.set(rm.id, rm));
                return Array.from(map.values());
              });
            }
          }
        } catch (err) {
          console.warn('Supabase connection failed:', err);
        }
      })();

      // Realtime subscription for live His & Hers sync
      const channel = client
        .channel('couple_monthly_logs_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'couple_monthly_logs' },
          (payload) => {
            const row = payload.new as CoupleMonthlyLogRow | undefined;
            if (!row || !row.month_id || !row.perspective) return;
            const key = `${row.perspective}:${row.month_id}`;
            const lastEdit = lastLocalEditTimeMapRef.current.get(key) || 0;
            // Ignore self-echo payloads arriving right after a local edit
            if (Date.now() - lastEdit < 2200) return;

            const converted = rowToMonthData(row);
            const setter = row.perspective === 'his' ? setHisMonths : setHerMonths;
            setter((prev) => {
              const exists = prev.some((m) => m.id === converted.id);
              if (!exists) return [converted, ...prev];
              return prev.map((m) => (m.id === converted.id ? converted : m));
            });
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_HIS_MONTHS, JSON.stringify(hisMonths));
      } catch (e) {
        console.error('Failed to save hisMonths', e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [hisMonths, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_HER_MONTHS, JSON.stringify(herMonths));
      } catch (e) {
        console.error('Failed to save herMonths', e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [herMonths, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PERSPECTIVE, activePerspective);
    } catch (e) {
      console.error('Failed to save perspective', e);
    }
  }, [activePerspective, isLoaded]);

  // Active months array for the currently selected perspective ('his' or 'her')
  const months = activePerspective === 'his' ? hisMonths : herMonths;

  // Helper that mutates the active perspective's month and syncs that month to Supabase
  const mutateMonth = useCallback(
    (monthId: string, updater: (target: MonthData) => MonthData) => {
      const perspective = activePerspective;
      const setter = perspective === 'his' ? setHisMonths : setHerMonths;
      const [yrStr, mnStr] = monthId.split('-');
      const yr = parseInt(yrStr, 10) || 2026;
      const mn = parseInt(mnStr, 10) || 11;

      setter((prev) => {
        const existing = prev.find((m) => m.id === monthId) || createBlankMonth(yr, mn);
        const updated = updater(existing);
        void syncMonthToSupabase(perspective, updated);

        if (!prev.some((m) => m.id === monthId)) {
          return [updated, ...prev];
        }
        return prev.map((m) => (m.id === monthId ? updated : m));
      });
    },
    [activePerspective, syncMonthToSupabase]
  );

  const currentUser = USERS[currentUserKey];
  const otherUser = USERS[currentUserKey === 'google' ? 'nami' : 'google'];

  const thailandNow = getThailandNow();
  const currentMonth =
    months.find((m) => m.id === thailandNow.monthId) ||
    months.find((m) => m.is_current) ||
    months[0];

  const getPerspectiveMonth = (
    perspective: Perspective,
    year: number,
    month: number
  ): MonthData => {
    const id = `${year}-${String(month).padStart(2, '0')}`;
    const list = perspective === 'his' ? hisMonths : herMonths;
    return list.find((m) => m.id === id) || createBlankMonth(year, month);
  };

  const getMonth = (year: number, month: number): MonthData => {
    return getPerspectiveMonth(activePerspective, year, month);
  };

  const updateUserPick = (
    monthId: string,
    categorySlug: CategorySlug,
    userId: UserId,
    pick: UserCategoryPick
  ) => {
    mutateMonth(monthId, (target) => {
      const currentCat = target.categories[categorySlug] || { category_slug: categorySlug };
      return {
        ...target,
        categories: {
          ...target.categories,
          [categorySlug]: {
            ...currentCat,
            [userId]: { ...pick, updated_at: new Date().toISOString() },
          },
        },
      };
    });
  };

  // ==================== MUSIC HELPERS ====================
  const saveMonthSong = (monthId: string, songInput: MusicLogEntry | string) => {
    mutateMonth(monthId, (target) => ({
      ...target,
      musicSong:
        typeof songInput === 'string'
          ? { url: songInput, updated_at: new Date().toISOString() }
          : { ...songInput, updated_at: new Date().toISOString() },
    }));
  };

  const updateMonthSongRating = (monthId: string, rating: number) => {
    mutateMonth(monthId, (target) =>
      target.musicSong
        ? { ...target, musicSong: { ...target.musicSong, rating, updated_at: new Date().toISOString() } }
        : target
    );
  };

  const updateMonthSongReason = (monthId: string, reason: string) => {
    mutateMonth(monthId, (target) =>
      target.musicSong
        ? { ...target, musicSong: { ...target.musicSong, reason, updated_at: new Date().toISOString() } }
        : target
    );
  };

  const updateMonthSongSpotify = (monthId: string, spotifyUrl: string) => {
    mutateMonth(monthId, (target) =>
      target.musicSong
        ? { ...target, musicSong: { ...target.musicSong, spotifyUrl, updated_at: new Date().toISOString() } }
        : target
    );
  };

  const updateMonthSongDetails = (monthId: string, details: Partial<MusicLogEntry>) => {
    mutateMonth(monthId, (target) =>
      target.musicSong
        ? {
            ...target,
            musicSong: { ...target.musicSong, ...details, updated_at: new Date().toISOString() },
          }
        : target
    );
  };

  const deleteMonthSong = (monthId: string) => {
    mutateMonth(monthId, (target) => {
      const updated = { ...target };
      delete updated.musicSong;
      return updated;
    });
  };

  // ==================== MOVIE HELPERS ====================
  const saveMonthMovie = (monthId: string, movieInput: MovieLogEntry | string) => {
    mutateMonth(monthId, (target) => ({
      ...target,
      movieLog:
        typeof movieInput === 'string'
          ? { url: movieInput, updated_at: new Date().toISOString() }
          : { ...movieInput, updated_at: new Date().toISOString() },
    }));
  };

  const updateMonthMovieRating = (monthId: string, rating: number) => {
    mutateMonth(monthId, (target) =>
      target.movieLog
        ? { ...target, movieLog: { ...target.movieLog, rating, updated_at: new Date().toISOString() } }
        : target
    );
  };

  const updateMonthMovieReason = (monthId: string, reason: string) => {
    mutateMonth(monthId, (target) =>
      target.movieLog
        ? { ...target, movieLog: { ...target.movieLog, reason, updated_at: new Date().toISOString() } }
        : target
    );
  };

  const updateMonthMovieDetails = (monthId: string, details: Partial<MovieLogEntry>) => {
    mutateMonth(monthId, (target) =>
      target.movieLog
        ? {
            ...target,
            movieLog: { ...target.movieLog, ...details, updated_at: new Date().toISOString() },
          }
        : target
    );
  };

  const deleteMonthMovie = (monthId: string) => {
    mutateMonth(monthId, (target) => ({ ...target, movieLog: { url: '' } }));
  };

  // ==================== GAME HELPERS ====================
  const saveMonthGame = (monthId: string, gameInput: GameLogEntry | string) => {
    mutateMonth(monthId, (target) => ({
      ...target,
      gameLog:
        typeof gameInput === 'string'
          ? { url: gameInput, updated_at: new Date().toISOString() }
          : { ...gameInput, updated_at: new Date().toISOString() },
    }));
  };

  const updateMonthGameDetails = (monthId: string, details: Partial<GameLogEntry>) => {
    mutateMonth(monthId, (target) =>
      target.gameLog
        ? {
            ...target,
            gameLog: { ...target.gameLog, ...details, updated_at: new Date().toISOString() },
          }
        : target
    );
  };

  const deleteMonthGame = (monthId: string) => {
    mutateMonth(monthId, (target) => ({ ...target, gameLog: { url: '' } }));
  };

  // ==================== FOOD HELPERS ====================
  const saveMonthFood = (monthId: string, foodInput: FoodLogEntry | string) => {
    mutateMonth(monthId, (target) => ({
      ...target,
      foodLog:
        typeof foodInput === 'string'
          ? { url: foodInput, updated_at: new Date().toISOString() }
          : { ...foodInput, updated_at: new Date().toISOString() },
    }));
  };

  const updateMonthFoodDetails = (monthId: string, details: Partial<FoodLogEntry>) => {
    mutateMonth(monthId, (target) =>
      target.foodLog
        ? {
            ...target,
            foodLog: { ...target.foodLog, ...details, updated_at: new Date().toISOString() },
          }
        : target
    );
  };

  const deleteMonthFood = (monthId: string) => {
    mutateMonth(monthId, (target) => ({ ...target, foodLog: { url: '' } }));
  };

  // ==================== MEMORY HELPERS ====================
  const saveMonthMemory = (monthId: string, memoryInput: MemoryLogEntry | string) => {
    mutateMonth(monthId, (target) => ({
      ...target,
      memoryLog:
        typeof memoryInput === 'string'
          ? { url: memoryInput, updated_at: new Date().toISOString() }
          : { ...memoryInput, updated_at: new Date().toISOString() },
    }));
  };

  const updateMonthMemoryDetails = (monthId: string, details: Partial<MemoryLogEntry>) => {
    mutateMonth(monthId, (target) =>
      target.memoryLog
        ? {
            ...target,
            memoryLog: { ...target.memoryLog, ...details, updated_at: new Date().toISOString() },
          }
        : target
    );
  };

  const deleteMonthMemory = (monthId: string) => {
    mutateMonth(monthId, (target) => ({ ...target, memoryLog: { url: '' } }));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        otherUser,
        switchUser,
        categories: CATEGORIES,
        months,
        hisMonths,
        herMonths,
        currentMonth,
        getMonth,
        getPerspectiveMonth,
        activePerspective,
        setActivePerspective,
        isSupabaseConnected,
        updateUserPick,
        saveMonthSong,
        updateMonthSongRating,
        updateMonthSongReason,
        updateMonthSongSpotify,
        updateMonthSongDetails,
        deleteMonthSong,
        saveMonthMovie,
        updateMonthMovieRating,
        updateMonthMovieReason,
        updateMonthMovieDetails,
        deleteMonthMovie,
        saveMonthGame,
        updateMonthGameDetails,
        deleteMonthGame,
        saveMonthFood,
        updateMonthFoodDetails,
        deleteMonthFood,
        saveMonthMemory,
        updateMonthMemoryDetails,
        deleteMonthMemory,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
