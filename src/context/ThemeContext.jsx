import { createContext, useContext, useState, useEffect } from "react";

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if there's a saved theme preference in localStorage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("ecoride-admin-theme");
    return savedTheme || "dark"; // Default to dark theme if no preference is saved
  });

  // Update the theme in localStorage and apply the theme class to the document
  useEffect(() => {
    localStorage.setItem("ecoride-admin-theme", theme);
    
    // Apply the theme class to the document element
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
  };

  // Theme context value
  const value = {
    theme,
    isDarkMode: theme === "dark",
    toggleTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
