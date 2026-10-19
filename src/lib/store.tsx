'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from './mock-data';

interface AppContextType {
  currentUser: UserProfile;
  otherUser: UserProfile;
  switchUser: (id: UserId) => void;
  categories: Category[];
  months: MonthData[];
  currentMonth: MonthData;
  getMonth: (year: number, month: number) => MonthData;
  activePerspective: 'his' | 'her';
  setActivePerspective: (side: 'his' | 'her') => void;
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

const STORAGE_KEY_MONTHS = 'ever_together_months_v3';
const STORAGE_KEY_PERSPECTIVE = 'ever_together_perspective_v3';
const STORAGE_KEY_THEME = 'ever_together_theme';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUserKey, setCurrentUserKey] = useState<UserId>('google');
  const [activePerspective, setActivePerspective] = useState<'his' | 'her'>('his');
  const [months, setMonths] = useState<MonthData[]>(INITIAL_MONTHS);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedPerspective = localStorage.getItem(STORAGE_KEY_PERSPECTIVE) as 'his' | 'her' | null;
      if (savedPerspective && (savedPerspective === 'his' || savedPerspective === 'her')) {
        setActivePerspective(savedPerspective);
      }
      const savedMonths = localStorage.getItem(STORAGE_KEY_MONTHS);
      if (savedMonths) {
        const parsed: MonthData[] = JSON.parse(savedMonths);
        const migrated = parsed.map((m) => {
          if (m.id === '2026-10' && INITIAL_MONTHS[0]) {
            const updated = { ...m };
            if (!('movieLog' in updated) && INITIAL_MONTHS[0].movieLog) {
              updated.movieLog = INITIAL_MONTHS[0].movieLog;
            }
            if (!('gameLog' in updated) && INITIAL_MONTHS[0].gameLog) {
              updated.gameLog = INITIAL_MONTHS[0].gameLog;
            }
            if (!('foodLog' in updated) && INITIAL_MONTHS[0].foodLog) {
              updated.foodLog = INITIAL_MONTHS[0].foodLog;
            }
            if (!('memoryLog' in updated) && INITIAL_MONTHS[0].memoryLog) {
              updated.memoryLog = INITIAL_MONTHS[0].memoryLog;
            }
            return updated;
          }
          return m;
        });
        setMonths(migrated);
      }
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error('Failed to load local storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_MONTHS, JSON.stringify(months));
    } catch (e) {
      console.error('Failed to save months', e);
    }
  }, [months, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PERSPECTIVE, activePerspective);
    } catch (e) {
      console.error('Failed to save perspective', e);
    }
  }, [activePerspective, isLoaded]);

  const switchUser = (id: UserId) => {
    setCurrentUserKey(id);
  };

  const currentUser = USERS[currentUserKey];
  const otherUser = USERS[currentUserKey === 'google' ? 'nami' : 'google'];

  // Current month (October 2026 or month marked current)
  const currentMonth = months.find((m) => m.is_current) || months[0];

  const getMonth = (year: number, month: number): MonthData => {
    const id = `${year}-${String(month).padStart(2, '0')}`;
    const found = months.find((m) => m.id === id);
    if (found) return found;

    // Return blank month structure if not yet initialized
    const blankMonth: MonthData = {
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
    return blankMonth;
  };

  const updateUserPick = (
    monthId: string,
    categorySlug: CategorySlug,
    userId: UserId,
    pick: UserCategoryPick
  ) => {
    setMonths((prev) => {
      const existing = prev.find((m) => m.id === monthId);
      if (!existing) {
        const [yr, mn] = monthId.split('-').map(Number);
        const newMonth: MonthData = {
          id: monthId,
          month: mn,
          year: yr,
          monthName: MONTH_NAMES[mn - 1] || 'Month',
          categories: {
            movie: { category_slug: 'movie' },
            game: { category_slug: 'game' },
            food: { category_slug: 'food' },
            memory: { category_slug: 'memory' },
            music: { category_slug: 'music' },
            [categorySlug]: {
              category_slug: categorySlug,
              [userId]: { ...pick, updated_at: new Date().toISOString() },
            },
          },
        };
        return [newMonth, ...prev];
      }

      return prev.map((m) => {
        if (m.id === monthId) {
          const currentCat = m.categories[categorySlug] || { category_slug: categorySlug };
          return {
            ...m,
            categories: {
              ...m.categories,
              [categorySlug]: {
                ...currentCat,
                [userId]: { ...pick, updated_at: new Date().toISOString() },
              },
            },
          };
        }
        return m;
      });
    });
  };

  const saveMonthSong = (monthId: string, songInput: MusicLogEntry | string) => {
    setMonths((prev) => {
      const existing = prev.find((m) => m.id === monthId);
      const [yr, mn] = monthId.split('-').map(Number);

      const targetMonth: MonthData = existing || {
        id: monthId,
        month: mn,
        year: yr,
        monthName: MONTH_NAMES[mn - 1] || 'Month',
        categories: {
          movie: { category_slug: 'movie' },
          game: { category_slug: 'game' },
          food: { category_slug: 'food' },
          memory: { category_slug: 'memory' },
          music: { category_slug: 'music' },
        },
      };

      const newSongData: MusicLogEntry =
        typeof songInput === 'string'
          ? {
              url: songInput,
              updated_at: new Date().toISOString(),
            }
          : {
              ...songInput,
              updated_at: new Date().toISOString(),
            };

      const updatedMonth: MonthData = {
        ...targetMonth,
        musicSong: newSongData,
      };

      if (!existing) {
        return [updatedMonth, ...prev];
      }
      return prev.map((m) => (m.id === monthId ? updatedMonth : m));
    });
  };

  const updateMonthSongRating = (monthId: string, rating: number) => {
    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId && m.musicSong) {
          return {
            ...m,
            musicSong: {
              ...m.musicSong,
              rating,
              updated_at: new Date().toISOString(),
            },
          };
        }
        return m;
      })
    );
  };

  const updateMonthSongReason = (monthId: string, reason: string) => {
    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId && m.musicSong) {
          return {
            ...m,
            musicSong: {
              ...m.musicSong,
              reason,
              updated_at: new Date().toISOString(),
            },
          };
        }
        return m;
      })
    );
  };

  const updateMonthSongSpotify = (monthId: string, spotifyUrl: string) => {
    setMonths((prev) =>
      prev.map((m) =>
        m.id === monthId && m.musicSong
          ? { ...m, musicSong: { ...m.musicSong, spotifyUrl, updated_at: new Date().toISOString() } }
          : m
      )
    );
  };

  const deleteMonthSong = (monthId: string) => {
    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId) {
          const updated = { ...m };
          delete updated.musicSong;
          return updated;
        }
        return m;
      })
    );
  };

  const saveMonthMovie = (monthId: string, movieInput: MovieLogEntry | string) => {
    setMonths((prev) => {
      const existing = prev.find((m) => m.id === monthId);
      const [yearStr, monthStr] = monthId.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      const targetMonth: MonthData = existing || {
        id: monthId,
        month,
        year,
        monthName: MONTH_NAMES[month - 1] || 'Unknown',
        categories: {
          movie: { category_slug: 'movie' },
          game: { category_slug: 'game' },
          food: { category_slug: 'food' },
          memory: { category_slug: 'memory' },
          music: { category_slug: 'music' },
        },
      };

      const newMovieData: MovieLogEntry =
        typeof movieInput === 'string'
          ? {
              url: movieInput,
              updated_at: new Date().toISOString(),
            }
          : {
              ...movieInput,
              updated_at: new Date().toISOString(),
            };

      const updatedMonth: MonthData = {
        ...targetMonth,
        movieLog: newMovieData,
      };

      if (!existing) {
        return [updatedMonth, ...prev];
      }
      return prev.map((m) => (m.id === monthId ? updatedMonth : m));
    });
  };

  const updateMonthMovieRating = (monthId: string, rating: number) => {
    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId && m.movieLog) {
          return {
            ...m,
            movieLog: {
              ...m.movieLog,
              rating,
              updated_at: new Date().toISOString(),
            },
          };
        }
        return m;
      })
    );
  };

  const updateMonthMovieReason = (monthId: string, reason: string) => {
    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId && m.movieLog) {
          return {
            ...m,
            movieLog: {
              ...m.movieLog,
              reason,
              updated_at: new Date().toISOString(),
            },
          };
        }
        return m;
      })
    );
  };

  const updateMonthMovieDetails = (monthId: string, details: Partial<MovieLogEntry>) => {
    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId && m.movieLog) {
          return {
            ...m,
            movieLog: {
              ...m.movieLog,
              ...details,
              updated_at: new Date().toISOString(),
            },
          };
        }
        return m;
      })
    );
  };

  const deleteMonthMovie = (monthId: string) => {
    setMonths((prev) =>
      prev.map((m) => {
        if (m.id === monthId) {
          return {
            ...m,
            movieLog: { url: '' },
          };
        }
        return m;
      })
    );
  };

  // ==================== GAME HELPERS ====================
  const saveMonthGame = (monthId: string, gameInput: GameLogEntry | string) => {
    setMonths((prev) => {
      const existing = prev.find((m) => m.id === monthId);
      const [yearStr, monthStr] = monthId.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      const targetMonth: MonthData = existing || {
        id: monthId,
        month,
        year,
        monthName: MONTH_NAMES[month - 1] || 'Unknown',
        categories: {
          movie: { category_slug: 'movie' },
          game: { category_slug: 'game' },
          food: { category_slug: 'food' },
          memory: { category_slug: 'memory' },
          music: { category_slug: 'music' },
        },
      };

      const newGameData: GameLogEntry =
        typeof gameInput === 'string'
          ? { url: gameInput, updated_at: new Date().toISOString() }
          : { ...gameInput, updated_at: new Date().toISOString() };

      const updatedMonth: MonthData = {
        ...targetMonth,
        gameLog: newGameData,
      };

      if (!existing) return [updatedMonth, ...prev];
      return prev.map((m) => (m.id === monthId ? updatedMonth : m));
    });
  };

  const updateMonthGameDetails = (monthId: string, details: Partial<GameLogEntry>) => {
    setMonths((prev) =>
      prev.map((m) =>
        m.id === monthId && m.gameLog
          ? {
              ...m,
              gameLog: {
                ...m.gameLog,
                ...details,
                updated_at: new Date().toISOString(),
              },
            }
          : m
      )
    );
  };

  const deleteMonthGame = (monthId: string) => {
    setMonths((prev) =>
      prev.map((m) => (m.id === monthId ? { ...m, gameLog: { url: '' } } : m))
    );
  };

  // ==================== FOOD HELPERS ====================
  const saveMonthFood = (monthId: string, foodInput: FoodLogEntry | string) => {
    setMonths((prev) => {
      const existing = prev.find((m) => m.id === monthId);
      const [yearStr, monthStr] = monthId.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      const targetMonth: MonthData = existing || {
        id: monthId,
        month,
        year,
        monthName: MONTH_NAMES[month - 1] || 'Unknown',
        categories: {
          movie: { category_slug: 'movie' },
          game: { category_slug: 'game' },
          food: { category_slug: 'food' },
          memory: { category_slug: 'memory' },
          music: { category_slug: 'music' },
        },
      };

      const newFoodData: FoodLogEntry =
        typeof foodInput === 'string'
          ? { url: foodInput, updated_at: new Date().toISOString() }
          : { ...foodInput, updated_at: new Date().toISOString() };

      const updatedMonth: MonthData = {
        ...targetMonth,
        foodLog: newFoodData,
      };

      if (!existing) return [updatedMonth, ...prev];
      return prev.map((m) => (m.id === monthId ? updatedMonth : m));
    });
  };

  const updateMonthFoodDetails = (monthId: string, details: Partial<FoodLogEntry>) => {
    setMonths((prev) =>
      prev.map((m) =>
        m.id === monthId && m.foodLog
          ? {
              ...m,
              foodLog: {
                ...m.foodLog,
                ...details,
                updated_at: new Date().toISOString(),
              },
            }
          : m
      )
    );
  };

  const deleteMonthFood = (monthId: string) => {
    setMonths((prev) =>
      prev.map((m) => (m.id === monthId ? { ...m, foodLog: { url: '' } } : m))
    );
  };

  // ==================== MEMORY HELPERS ====================
  const saveMonthMemory = (monthId: string, memoryInput: MemoryLogEntry | string) => {
    setMonths((prev) => {
      const existing = prev.find((m) => m.id === monthId);
      const [yearStr, monthStr] = monthId.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      const targetMonth: MonthData = existing || {
        id: monthId,
        month,
        year,
        monthName: MONTH_NAMES[month - 1] || 'Unknown',
        categories: {
          movie: { category_slug: 'movie' },
          game: { category_slug: 'game' },
          food: { category_slug: 'food' },
          memory: { category_slug: 'memory' },
          music: { category_slug: 'music' },
        },
      };

      const newMemoryData: MemoryLogEntry =
        typeof memoryInput === 'string'
          ? { url: memoryInput, updated_at: new Date().toISOString() }
          : { ...memoryInput, updated_at: new Date().toISOString() };

      const updatedMonth: MonthData = {
        ...targetMonth,
        memoryLog: newMemoryData,
      };

      if (!existing) return [updatedMonth, ...prev];
      return prev.map((m) => (m.id === monthId ? updatedMonth : m));
    });
  };

  const updateMonthMemoryDetails = (monthId: string, details: Partial<MemoryLogEntry>) => {
    setMonths((prev) =>
      prev.map((m) =>
        m.id === monthId && m.memoryLog
          ? {
              ...m,
              memoryLog: {
                ...m.memoryLog,
                ...details,
                updated_at: new Date().toISOString(),
              },
            }
          : m
      )
    );
  };

  const deleteMonthMemory = (monthId: string) => {
    setMonths((prev) =>
      prev.map((m) => (m.id === monthId ? { ...m, memoryLog: { url: '' } } : m))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        otherUser,
        switchUser,
        categories: CATEGORIES,
        months,
        currentMonth,
        getMonth,
        activePerspective,
        setActivePerspective,
        updateUserPick,
        saveMonthSong,
        updateMonthSongRating,
        updateMonthSongReason,
        updateMonthSongSpotify,
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
