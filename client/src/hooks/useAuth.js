import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { app } from "../config/firebase.config";
import { validateUser } from "../api";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";

export const useAuth = () => {
  const firebaseAuth = getAuth(app);
  const navigate = useNavigate();
  const [{ user }, dispatch] = useStateValue();
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState(
    false || window.localStorage.getItem("auth") === "true"
  );

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred) {
        userCred.getIdToken().then((token) => {
          window.localStorage.setItem("auth", "true");
          validateUser(token).then((data) => {
            dispatch({
              type: actionType.SET_USER,
              user: data,
            });
            setIsLoading(false);
            // Only redirect to home if we are currently on the login page
            if (window.location.pathname === "/login") {
              navigate("/", { replace: true });
            }
          });
        });
      } else {
        setAuth(false);
        dispatch({
          type: actionType.SET_USER,
          user: null,
        });
        setIsLoading(false);
        window.localStorage.setItem("auth", "false");
        window.localStorage.setItem("auth", "false");
        // Do not redirect to login automatically. Allow guest access.
        // if (window.location.pathname !== "/login") {
        //   navigate("/login");
        // }
      }
    });

    return () => unsubscribe();
  }, [navigate, dispatch]);

  return { isLoading, setAuth };
};
