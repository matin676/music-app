/**
 * useAlbums Hook
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { albumsApi } from "../../../services/api";
import toast from "react-hot-toast";

export const albumKeys = {
  all: ["albums"],
  detail: (id) => ["albums", id],
};

export const useAlbums = (options = {}) => {
  return useQuery({
    queryKey: albumKeys.all,
    queryFn: albumsApi.getAll,
    ...options,
  });
};

export const useAlbum = (id, options = {}) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumsApi.getOne(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: albumsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album created successfully");
    },
  });
};

export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => albumsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      toast.success("Album updated successfully");
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: albumsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album deleted successfully");
    },
  });
};
