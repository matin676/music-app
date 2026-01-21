/**
 * Users React Query Hooks
 *
 * Provides data fetching and mutations for user management (Admin only)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../../services/api/users";

// Query keys for cache management
export const userKeys = {
  all: ["users"],
  detail: (id) => ["users", id],
};

/**
 * Fetch all users (Admin only)
 */
export const useUsers = (options = {}) => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.data || response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Update user role mutation (Admin only)
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => usersApi.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

/**
 * Delete user mutation (Admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
