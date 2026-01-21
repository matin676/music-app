import { useState, useEffect, Suspense, lazy } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Loader } from "./components";
import { ErrorBoundary } from "./shared/components";
import { app } from "./config/firebase.config";
import { useStateValue } from "./context/StateProvider";
import { actionType } from "./context/reducer";
import "./App.css";

// Lazy Loaded Components
const Home = lazy(() => import("./components/Home/Home"));
const Login = lazy(() => import("./components/Auth/Login"));
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const UserProfile = lazy(() => import("./components/Profile/UserProfile"));
const EditProfile = lazy(() => import("./components/Profile/EditProfile"));
const Favourite = lazy(() => import("./components/Profile/Favourite"));
const Library = lazy(() => import("./components/Library/Library"));
const AddNewPlaylist = lazy(
  () => import("./components/Library/AddNewPlaylist"),
);
const PlaylistSongs = lazy(() => import("./components/Library/PlaylistSongs"));

// Using the polished react-h5-audio-player based MusicPlayer
const MusicPlayer = lazy(() => import("./components/Player/MusicPlayer"));

import { useAuth } from "./hooks/useAuth";
import { useData } from "./hooks/useData";

function App() {
  const { isLoading, setAuth } = useAuth();
  const { fetchSongs } = useData();
  const [{ user, allSongs, songIndex, isSongPlaying, miniPlayer }, dispatch] =
    useStateValue();

  useEffect(() => {
    fetchSongs();

    // Global favourites sync from user object
    if (user?.user?.favourites) {
      dispatch({
        type: actionType.SET_FAVOURITES,
        favourites: user.user.favourites,
      });
    }
  }, [user, dispatch, fetchSongs]);

  return (
    <AnimatePresence mode="wait">
      <div className="h-auto w-full min-h-screen flex flex-col bg-primary">
        {isLoading && (
          <div className="fixed inset-0 bg-loaderOverlay backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader />
          </div>
        )}

        <ErrorBoundary message="Something went wrong loading this page.">
          <Suspense
            fallback={
              <div className="h-screen w-full flex items-center justify-center bg-primary">
                <Loader />
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<Login setAuth={setAuth} />} />
              <Route path="/home/*" element={<Home />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/userprofile/*" element={<UserProfile />} />
              <Route
                path="/userprofile/editprofile/*"
                element={<EditProfile />}
              />
              <Route path="/favourite" element={<Favourite />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/newPlaylist" element={<AddNewPlaylist />} />
              <Route
                path="/library/playlistSongs/:id"
                element={<PlaylistSongs />}
              />
              {/* Catch-all redirect to home */}
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>

        {isSongPlaying && (
          <Suspense fallback={<Loader />}>
            <MusicPlayer />
          </Suspense>
        )}
      </div>
    </AnimatePresence>
  );
}

export default App;
