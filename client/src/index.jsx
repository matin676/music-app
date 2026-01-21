/**
 * Application Entry Point
 *
 * Sets up all providers:
 * - React Router (routing)
 * - React Query (data fetching/caching)
 * - React Hot Toast (notifications)
 * - Helmet (SEO)
 *
 * NOTE: The old StateProvider (useReducer) is kept temporarily
 * for backwards compatibility during migration. Components should
 * gradually migrate to use Zustand stores and React Query hooks.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "@dr.pogodin/react-helmet";

import { QueryProvider } from "./app/providers";

// Legacy context (for gradual migration)
import { StateProvdier } from "./context/StateProvider";
import { initialState } from "./context/initialState";
import reducer from "./context/reducer";

import App from "./App";
import "./styles/tokens.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <QueryProvider>
        <StateProvdier initialState={initialState} reducer={reducer}>
          <HelmetProvider>
            <App />
            {/* Toast container for notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--color-bg-elevated)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                },
                success: {
                  iconTheme: {
                    primary: "var(--color-success)",
                    secondary: "var(--color-bg-elevated)",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "var(--color-error)",
                    secondary: "var(--color-bg-elevated)",
                  },
                },
              }}
            />
          </HelmetProvider>
        </StateProvdier>
      </QueryProvider>
    </Router>
  </React.StrictMode>,
);
