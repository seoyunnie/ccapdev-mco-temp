import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "pink",
  fontFamily: "'Nunito', 'Quicksand', sans-serif",
  headings: {
    fontWeight: "800",
    sizes: {
      h1: { fontSize: "2.5rem", lineHeight: "1.15" },
      h2: { fontSize: "1.75rem", lineHeight: "1.25" },
      h3: { fontSize: "1.375rem", lineHeight: "1.3" },
      h4: { fontSize: "1.125rem", lineHeight: "1.35" },
    },
  },
  radius: { xs: "6px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  defaultRadius: "md",
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
    sm: "0 2px 8px rgba(0, 0, 0, 0.06)",
    md: "0 4px 16px rgba(0, 0, 0, 0.06)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.08)",
    xl: "0 16px 48px rgba(0, 0, 0, 0.1)",
  },
  other: { transitionDuration: "0.25s" },
});
