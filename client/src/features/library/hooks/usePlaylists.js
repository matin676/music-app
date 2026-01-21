/**
 * usePlaylists Hook
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistsApi } from "../../../services/api";
import toast from "react-hot-toast";

export const playlistKeys = {
  all: ["playlists"],
  detail: (id) => ["playlists", id],
};

export const usePlaylists = (options = {}) => {
  return useQuery({
    queryKey: playlistKeys.all,
    queryFn: playlistsApi.getAll,
    ...options,
  });
};

export const usePlaylist = (id, options = {}) => {
  return useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: () => playlistsApi.getOne(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playlistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      toast.success("Playlist created successfully");
    },
  });
};

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => playlistsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(variables.id),
      });
      toast.success("Playlist updated successfully");
    },
  });
};

export const useAddToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }) =>
      playlistsApi.addSong(playlistId, songId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(variables.playlistId),
      });
      toast.success("Song added to playlist");
    },
  });
};

export const useRemoveFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }) =>
      playlistsApi.removeSong(playlistId, songId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(variables.playlistId),
      });
      toast.success("Song removed from playlist");
    },
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playlistsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      toast.success("Playlist deleted successfully");
    },
  });
};
