import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { StateProvdier } from "./context/StateProvider";
import { initialState } from "./context/initialState";
import reducer from "./context/reducer";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <StateProvdier initialState={initialState} reducer={reducer}>
        <App />
      </StateProvdier>
    </Router>
  </React.StrictMode>
);
