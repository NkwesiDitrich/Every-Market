import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1A1A1A", // True black for a premium feel
      light: "#4A4A4A",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#DB4444", // Keeping the brand red for CTAs/Flash sales
      light: "#E57373",
      dark: "#AF2D2D",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8F9FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#666666",
      hint: "#999999",
    },
    action: {
      hover: "rgba(0, 0, 0, 0.04)",
      selected: "rgba(0, 0, 0, 0.08)",
    },
  },

  shape: {
    borderRadius: 8, // Softer edges for a modern look
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  typography: {
    fontFamily: "'Inter', 'Poppins', sans-serif", // Inter is more modern for UI
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontSize: "3.5rem",
      "@media (max-width:600px)": { fontSize: "2.5rem" },
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
      fontSize: "2.5rem",
      "@media (max-width:600px)": { fontSize: "2rem" },
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
      "@media (max-width:600px)": { fontSize: "1.75rem" },
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      "@media (max-width:600px)": { fontSize: "1.25rem" },
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      "@media (max-width:600px)": { fontSize: "1.1rem" },
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
      "@media (max-width:600px)": { fontSize: "1rem" },
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#1A1A1A",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#666666",
    },
    button: {
      textTransform: "none", // Avoid all-caps buttons for better accessibility
      fontWeight: 600,
    },
    caption: {
      fontSize: "0.75rem",
      letterSpacing: "0.01em",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
        containedPrimary: {
          backgroundColor: "#1A1A1A",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
          border: "1px solid #EDEDED",
        },
      },
    },
  },
});

export default theme;