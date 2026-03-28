import React, { createContext, useContext, useMemo, useState } from "react"
import { createTheme, ThemeProvider } from "@mui/material"

const ThemeModeContext = createContext(null)

const FONT_SCALES = { small: 0.9, medium: 1, large: 1.15 }

export const useThemeMode = () => useContext(ThemeModeContext)

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "light")
  const [fontScale, setFontScale] = useState(() => localStorage.getItem("fontScale") || "medium")

  const theme = useMemo(() => {
    const scale = FONT_SCALES[fontScale] ?? 1
    const base = createTheme({
      palette: {
        mode,
        primary: {
          main: mode === "dark" ? "#90caf9" : "#DB4444",
          light: mode === "dark" ? "#42a5f5" : "#eb5757",
          dark: "#DB4444",
          contrastText: "#ffffff",
          customBlack: mode === "dark" ? "#e0e0e0" : "#191919",
        },
        background: {
          default: mode === "dark" ? "#121212" : "#ffffff",
          paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
        },
        text: {
          primary: mode === "dark" ? "#ffffff" : "#000000",
          secondary: mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
        }
      },
      breakpoints: {
        values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
      },
      typography: {
        fontFamily: "Poppins, sans-serif",
        h1: { fontSize: `${6 * scale}rem` },
        h2: { fontSize: `${3.75 * scale}rem` },
        h3: { fontSize: `${3 * scale}rem` },
        h4: { fontSize: `${2.125 * scale}rem` },
        h5: { fontSize: `${1.5 * scale}rem` },
        h6: { fontSize: `${1.25 * scale}rem` },
        body1: { fontSize: `${1 * scale}rem` },
        body2: { fontSize: `${1 * scale}rem` },
      },
    })
    return base
  }, [mode, fontScale])

  const toggleMode = () => {
    const next = mode === "light" ? "dark" : "light"
    setMode(next)
    localStorage.setItem("themeMode", next)
  }

  const setFontSize = (s) => {
    if (["small", "medium", "large"].includes(s)) {
      setFontScale(s)
      localStorage.setItem("fontScale", s)
    }
  }

  const value = { mode, fontScale, toggleMode, setFontSize }

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
