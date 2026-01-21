/**
 * useFavourites Hook
 *
 * Manages user favourites with optimistic updates
 */
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { usersApi } from "../../../services/api";
import toast from "react-hot-toast";

export const useFavourites = () => {
  const {
    user,
    favourites,
    toggleFavourite: storeToggle,
    isFavourite,
  } = useAuthStore();

  const mutation = useMutation({
    mutationFn: ({ userId, songId }) =>
      usersApi.toggleFavourite(userId, songId),
    onError: (error, { songId }) => {
      // Rollback on error
      storeToggle(songId);
      toast.error(error.message || "Failed to update favourites");
    },
  });

  const toggleFavourite = async (songId) => {
    if (!user) {
      toast.error("Please login to manage favourites");
      return;
    }

    // Optimistic update
    storeToggle(songId);

    // Sync with backend
    mutation.mutate({ userId: user._id, songId });
  };

  return {
    favourites,
    toggleFavourite,
    isFavourite,
    isUpdating: mutation.isPending,
  };
};
