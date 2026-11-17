import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        destructive: "hsl(var(--destructive))",
      },
      boxShadow: {
        card: "0 2px 12px rgba(15, 23, 42, 0.035)",
        float: "0 16px 44px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.1rem",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "IBM Plex Sans Arabic",
          "Noto Sans Arabic",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
