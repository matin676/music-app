/**
 * useArtists Hook
 *
 * React Query hook for fetching and managing artists data
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { artistsApi } from "../../../services/api";
import toast from "react-hot-toast";

export const artistKeys = {
  all: ["artists"],
  detail: (id) => ["artists", id],
};

export const useArtists = (options = {}) => {
  return useQuery({
    queryKey: artistKeys.all,
    queryFn: artistsApi.getAll,
    ...options,
  });
};

export const useArtist = (id, options = {}) => {
  return useQuery({
    queryKey: artistKeys.detail(id),
    queryFn: () => artistsApi.getOne(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistKeys.all });
      toast.success("Artist created successfully");
    },
  });
};

export const useUpdateArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => artistsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: artistKeys.all });
      queryClient.invalidateQueries({
        queryKey: artistKeys.detail(variables.id),
      });
      toast.success("Artist updated successfully");
    },
  });
};

export const useDeleteArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artistsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistKeys.all });
      toast.success("Artist deleted successfully");
    },
  });
};
