/**
 * UI Store (Zustand)
 *
 * Manages global UI state:
 * - Filters (artist, album, language, category)
 * - Search term
 * - Modal states
 * - Alerts/notifications
 *
 * This replaces filter and UI-related actions from the old reducer
 */
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialState = {
  // Search and Filter
  searchTerm: "",
  filterTerm: null, // Category filter
  artistFilter: null,
  albumFilter: null,
  languageFilter: null,

  // Modal states
  activeModal: null, // 'addToPlaylist' | 'editProfile' | etc.
  modalData: null, // Data passed to modal

  // Alert state (for legacy support during migration)
  alert: null, // { type: 'success' | 'error', message: string }
};

export const useUIStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // ===== SEARCH =====

      /**
       * Set search term
       * @param {string} term
       */
      setSearchTerm: (term) => set({ searchTerm: term }),

      /**
       * Clear search term
       */
      clearSearch: () => set({ searchTerm: "" }),

      // ===== FILTERS =====

      /**
       * Set category filter
       * @param {string|null} category
       */
      setFilterTerm: (category) => set({ filterTerm: category }),

      /**
       * Set artist filter
       * @param {string|null} artist
       */
      setArtistFilter: (artist) => set({ artistFilter: artist }),

      /**
       * Set album filter
       * @param {string|null} album
       */
      setAlbumFilter: (album) => set({ albumFilter: album }),

      /**
       * Set language filter
       * @param {string|null} language
       */
      setLanguageFilter: (language) => set({ languageFilter: language }),

      /**
       * Clear all filters at once (single state update, no multiple re-renders)
       */
      clearAllFilters: () =>
        set({
          filterTerm: null,
          artistFilter: null,
          albumFilter: null,
          languageFilter: null,
          searchTerm: "",
        }),

      /**
       * Check if any filter is active
       * @returns {boolean}
       */
      hasActiveFilters: () => {
        const state = get();
        return !!(
          state.searchTerm ||
          state.filterTerm ||
          state.artistFilter ||
          state.albumFilter ||
          state.languageFilter
        );
      },

      // ===== MODALS =====

      /**
       * Open a modal with optional data
       * @param {string} modalName
       * @param {any} data
       */
      openModal: (modalName, data = null) =>
        set({
          activeModal: modalName,
          modalData: data,
        }),

      /**
       * Close any open modal
       */
      closeModal: () =>
        set({
          activeModal: null,
          modalData: null,
        }),

      // ===== ALERTS (for legacy support) =====

      /**
       * Show an alert
       * @param {'success' | 'error'} type
       * @param {string} message
       */
      showAlert: (type, message) => {
        set({ alert: { type, message } });
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          set({ alert: null });
        }, 4000);
      },

      /**
       * Clear alert
       */
      clearAlert: () => set({ alert: null }),

      /**
       * Reset all UI state
       */
      reset: () => set(initialState),
    }),
    { name: "UIStore" },
  ),
);
