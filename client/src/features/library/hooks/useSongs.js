/**
 * useSongs Hook
 *
 * React Query hook for fetching and managing songs data
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { songsApi } from "../../../services/api";
import toast from "react-hot-toast";

// Query keys for consistency
export const songKeys = {
  all: ["songs"],
  detail: (id) => ["songs", id],
};

/**
 * Fetch all songs
 */
/**
 * Fetch all songs with optional filters
 * @param {Object} filters - Search, genre, sorting, etc.
 * @param {Object} options - React Query options
 */
export const useSongs = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: [...songKeys.all, filters],
    queryFn: () => songsApi.getAll(filters),
    keepPreviousData: true, // Keep old data while fetching new filter results
    ...options,
  });
};

/**
 * Fetch a single song by ID
 */
export const useSong = (id, options = {}) => {
  return useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => songsApi.getOne(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Create a new song (Admin)
 */
export const useCreateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: songsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: songKeys.all });
      toast.success("Song created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create song");
    },
  });
};

/**
 * Update a song (Admin)
 */
export const useUpdateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => songsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: songKeys.all });
      queryClient.invalidateQueries({
        queryKey: songKeys.detail(variables.id),
      });
      toast.success("Song updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update song");
    },
  });
};

/**
 * Delete a song (Admin)
 */
export const useDeleteSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: songsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.all });
      toast.success("Song deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete song");
    },
  });
};
