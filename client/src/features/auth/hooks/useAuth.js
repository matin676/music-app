/**
 * useAuth Hook
 *
 * Manages Firebase authentication and syncs with Zustand store
 */
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { usersApi } from "../../../services/api";
import { app } from "../../../config/firebase.config";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isAuthLoading,
    setUser,
    logout: storeLogout,
    setAuthLoading,
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: usersApi.login,
    onSuccess: (userData) => {
      setUser(userData.user);
      if (window.location.pathname === "/login") {
        navigate("/", { replace: true });
      }
    },
    onError: (error) => {
      setAuthLoading(false);
    },
  });

  // Listen for Firebase auth state changes
  useEffect(() => {
    const auth = getAuth(app);
    setAuthLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - validate with backend
        loginMutation.mutate();
      } else {
        // User is signed out
        storeLogout();
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      const auth = getAuth(app);
      await auth.signOut();
      storeLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    logout,
    isLoggingIn: loginMutation.isPending,
  };
};
