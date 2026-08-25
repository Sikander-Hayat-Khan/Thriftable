"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({
  theme: "dark",
  previousTheme: "dark",
  targetTheme: "dark",
  isTransitioning: false,
  toggleTheme: () => {},
  setTheme: () => {},
  onTransitionEnd: () => {},
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousTheme, setPreviousTheme] = useState("dark");
  const [targetTheme, setTargetTheme] = useState("dark");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("thriftable-theme");
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      setPreviousTheme(stored);
      setTargetTheme(stored);
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setThemeState(initial);
      setPreviousTheme(initial);
      setTargetTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return;
    const next = theme === "dark" ? "light" : "dark";
    setPreviousTheme(theme);
    setTargetTheme(next);
    setIsTransitioning(true);

    applyTheme(next);
    setThemeState(next);
    localStorage.setItem("thriftable-theme", next);
  }, [theme, isTransitioning]);

  const setTheme = (newTheme) => {
    if (newTheme === theme || isTransitioning) return;
    setPreviousTheme(theme);
    setTargetTheme(newTheme);
    setIsTransitioning(true);

    applyTheme(newTheme);
    setThemeState(newTheme);
    localStorage.setItem("thriftable-theme", newTheme);
  };

  // Auto-reset transition state after fluid animation duration (1250ms)
  // Ensures the home page fluid background animation completes its full 1.2s flow smoothly
  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setPreviousTheme(targetTheme);
    }, 1250);
    return () => clearTimeout(timer);
  }, [isTransitioning, targetTheme]);

  const onTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    setPreviousTheme(targetTheme);
  }, [targetTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        previousTheme,
        targetTheme,
        isTransitioning,
        toggleTheme,
        setTheme,
        onTransitionEnd,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
