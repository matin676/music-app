import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  AddNewPlaylist,
  Dashboard,
  EditProfile,
  Favourite,
  Home,
  Library,
  Loader,
  Login,
  MusicPlayer,
  UserProfile,
} from "./components";
import { app } from "./config/firebase.config";
import { getAuth } from "firebase/auth";
import { getAllSongs, validateUser } from "./api";
import { useStateValue } from "./context/StateProvider";
import { actionType } from "./context/reducer";
import "./App.css";
import PlaylistSongs from "./components/PlaylistSongs";

function App() {
  const firebaseAuth = getAuth(app);
  const navigate = useNavigate();

  const [{ user, allSongs, songIndex, isSongPlaying, miniPlayer }, dispatch] =
    useStateValue();
  const [isLoading, setIsLoading] = useState(false);

  const [auth, setAuth] = useState(
    false || window.localStorage.getItem("auth") === "true"
  );

  useEffect(() => {
    setIsLoading(true);
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred) {
        userCred.getIdToken().then((token) => {
          // console.log(token);
          window.localStorage.setItem("auth", "true");
          validateUser(token).then((data) => {
            dispatch({
              type: actionType.SET_USER,
              user: data,
            });
          });
        });
        setIsLoading(false);
      } else {
        setAuth(false);
        dispatch({
          type: actionType.SET_USER,
          user: null,
        });
        setIsLoading(false);
        window.localStorage.setItem("auth", "false");
        navigate("/login");
      }
    });
  }, []);

  useEffect(() => {
    if (!allSongs && user) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.song,
        });
      });
    }
  }, []);

  return (
    // <AnimatePresence mode="wait">
    <AnimatePresence>
      <div className="h-auto min-w-[680px]  flex justify-center items-center">
        {isLoading ||
          (!user && (
            <div className="fixed inset-0 bg-loaderOverlay backdrop-blur-sm">
              <Loader />
            </div>
          ))}
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/*" element={<Home />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/userprofile/*" element={<UserProfile />} />
          <Route path="/userprofile/editprofile/*" element={<EditProfile />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/newPlaylist" element={<AddNewPlaylist />} />
          <Route
            path="/library/playlistSongs/:id"
            element={<PlaylistSongs />}
          />
        </Routes>

        {isSongPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed min-w-[700px] h-26 inset-x-0 bottom-0 bg-cardOverlay drop-shadow-2xl backdrop-blur-md flex items-center justify-center`}
          >
            <MusicPlayer />
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

export default App;
