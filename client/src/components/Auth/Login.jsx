import { React, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { validateUser } from "../../api";
import { app } from "../../config/firebase.config";
import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";
import { LoginBg } from "../../assets/video";

export default function Login({ setAuth }) {
  const firebaseAuth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const navigate = useNavigate();

  const [{ user }, dispatch] = useStateValue();

  const loginWithGoogle = async () => {
    await signInWithPopup(firebaseAuth, provider).then((userCred) => {
      if (userCred) {
        setAuth(true);
        window.localStorage.setItem("auth", "true");
        // Navigation and validation will be handled by useAuth's onAuthStateChanged listener
      }
    });
  };

  useEffect(() => {
    if (window.localStorage.getItem("auth") === "true") {
      navigate("/", { replace: true });
    }
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <video
        src={LoginBg}
        type="video/mp4"
        autoPlay
        loop
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="w-full md:w-[400px] p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-3xl font-bold text-white tracking-wide">
              Welcome Back
            </h2>
            <p className="text-gray-200 text-sm">
              Sign in to continue to music app
            </p>
          </div>

          <div
            className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-xl bg-white cursor-pointer hover:bg-gray-100 hover:scale-105 duration-200 ease-in-out transition-all shadow-lg group"
            onClick={loginWithGoogle}
          >
            <FcGoogle className="text-2xl" />
            <p className="text-lg font-semibold text-gray-800">
              Sign in with Google
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
