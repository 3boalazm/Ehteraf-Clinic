import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        teal: "var(--teal)",
        "teal-deep": "var(--teal-deep)",
        "teal-soft": "var(--teal-soft)",
        clay: "var(--clay)",
        "clay-soft": "var(--clay-soft)",
        brass: "var(--brass)",
        "brass-soft": "var(--brass-soft)",
        blue: "var(--blue)",
        "blue-soft": "var(--blue-soft)",
        success: "var(--success)",
        "success-soft": "var(--success-soft)",
        warning: "var(--warning)",
        "warning-soft": "var(--warning-soft)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
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
          "IBM Plex Sans Arabic",
          "Inter Variable",
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
