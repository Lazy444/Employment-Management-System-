// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    // 1) from localStorage (if saved before)
    const stored = window.localStorage.getItem("ems-dark-mode");
    if (stored !== null) return stored === "true";

    // 2) otherwise follow system preference
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;

    if (darkMode) {
      root.classList.add("dark");       // for Tailwind "class" dark mode
    } else {
      root.classList.remove("dark");
    }

    window.localStorage.setItem("ems-dark-mode", darkMode ? "true" : "false");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const value = {
    darkMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook you import everywhere
export const useTheme = () => useContext(ThemeContext);