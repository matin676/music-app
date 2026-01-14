import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { StateProvdier } from "./context/StateProvider";
import { initialState } from "./context/initialState";
import reducer from "./context/reducer";
import App from "./App";
import "./index.css";

import { HelmetProvider } from "@dr.pogodin/react-helmet";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <StateProvdier initialState={initialState} reducer={reducer}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </StateProvdier>
    </Router>
  </React.StrictMode>
);
