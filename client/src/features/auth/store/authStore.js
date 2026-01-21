/**
 * Auth Store (Zustand)
 *
 * Manages user authentication state:
 * - Current user
 * - Favourites
 * - Auth loading state
 */
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const initialState = {
  user: null,
  favourites: [],
  isAuthLoading: true,
  isAuthenticated: false,
};

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Set user data after login
         * @param {Object} userData - User data from API
         */
        setUser: (userData) =>
          set({
            user: userData,
            isAuthenticated: !!userData,
            isAuthLoading: false,
            favourites: userData?.favourites || [],
          }),

        /**
         * Clear user data on logout
         */
        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            favourites: [],
          }),

        /**
         * Set auth loading state
         * @param {boolean} isLoading
         */
        setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),

        /**
         * Set favourites (from user data or after toggle)
         * @param {string[]} favourites - Array of song IDs
         */
        setFavourites: (favourites) => set({ favourites }),

        /**
         * Toggle a song in favourites (optimistic update)
         * @param {string} songId
         */
        toggleFavourite: (songId) => {
          const { favourites } = get();
          const isFavorited = favourites.includes(songId);

          if (isFavorited) {
            set({ favourites: favourites.filter((id) => id !== songId) });
          } else {
            set({ favourites: [...favourites, songId] });
          }

          return !isFavorited; // Return new state for API sync
        },

        /**
         * Check if a song is in favourites
         * @param {string} songId
         * @returns {boolean}
         */
        isFavourite: (songId) => get().favourites.includes(songId),

        /**
         * Update user profile data
         * @param {Object} updates - Fields to update
         */
        updateProfile: (updates) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          })),
      }),
      {
        name: "auth-storage",
        // Only persist essential auth data
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: "AuthStore" },
  ),
);
