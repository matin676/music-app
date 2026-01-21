/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Design System Fonts (UI UX Pro Max)
      fontFamily: {
        heading: ["Righteous", "cursive"],
        body: ["Poppins", "sans-serif"],
      },
      width: {
        150: "150px",
        190: "190px",
        225: "225px",
        275: "275px",
        300: "300px",
        340: "340px",
        350: "350px",
        375: "375px",
        460: "460px",
        656: "656px",
        880: "880px",
        508: "508px",
      },
      zIndex: {
        100: "100",
        120: "120",
        200: "200",
        9999: "9999",
      },
      height: {
        80: "80px",
        150: "150px",
        225: "225px",
        300: "300px",
        340: "340px",
        370: "370px",
        420: "420px",
        510: "510px",
        600: "600px",
        650: "650px",
        685: "685px",
        800: "800px",
        "90vh": "90vh",
      },
      minWidth: {
        210: "210px",
        350: "350px",
        620: "620px",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        // Design System Colors (UI UX Pro Max)
        primary: "#F8FAFC",
        secondary: "#60A5FA",
        accent: "#3B82F6",
        cta: "#F97316",

        // Legacy colors (kept for backwards compatibility)
        headingColor: "#1E293B",
        textColor: "#475569",
        mutedColor: "#64748B",

        // UI colors
        cartNumBg: "#F97316",
        cardOverlay: "rgba(255, 255, 255, 0.4)",
        darkOverlay: "rgba(0, 0, 0, 0.5)",
        lightOverlay: "rgba(255, 255, 255, 0.2)",
        lighttextGray: "#94A3B8",
        card: "rgba(255, 255, 255, 0.8)",
        cartBg: "#1E293B",
        cartItem: "#334155",
        cartTotal: "#475569",
        loaderOverlay: "rgba(255, 255, 255, 0.1)",

        // Borders
        border: "#E2E8F0",
      },
      // Design System Transitions
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      // Design System Shadows
      boxShadow: {
        "ds-sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
        "ds-md": "0 4px 6px rgba(0, 0, 0, 0.1)",
        "ds-lg": "0 10px 15px rgba(0, 0, 0, 0.1)",
        "ds-xl": "0 20px 25px rgba(0, 0, 0, 0.15)",
      },
      // Design System Border Radius
      borderRadius: {
        "ds-sm": "0.375rem",
        "ds-md": "0.5rem",
        "ds-lg": "0.75rem",
        "ds-xl": "1rem",
        "ds-2xl": "1.5rem",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
