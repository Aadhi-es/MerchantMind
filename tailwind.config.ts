import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#fbfbf9",
        surface: {
          DEFAULT: "#fbfbf9",
          bright: "#ffffff",
          container: "#f3f2ee",
          "container-low": "#f8f7f5",
          "container-high": "#ebe9e5",
          "container-highest": "#e2dfd9",
          "container-lowest": "#ffffff",
          variant: "#eae8e3",
          dim: "#eae8e4",
        },
        primary: {
          DEFAULT: "#094cb2",
          hover: "#073e94",
          container: "#e8eefb",
          fixed: "#d9e2ff",
          "fixed-dim": "#b1c5ff",
        },
        secondary: {
          DEFAULT: "#5a5f63",
          container: "#f0f2f5",
          fixed: "#dfe3e8",
        },
        "on-surface": {
          DEFAULT: "#1b1c1d",
          variant: "#4b5563",
        },
        outline: {
          DEFAULT: "#8a909d",
          variant: "#e2e4e8",
        },
        status: {
          success: "#059669",
          successBg: "#ecfdf5",
          error: "#ba1a1a",
          errorBg: "#ffdad6",
          warning: "#d97706",
          warningBg: "#fef3c7",
        },
      },
      fontFamily: {
        sans: ["Consolas", "Courier New", "monospace"],
        headline: ["Consolas", "Courier New", "monospace"],
        display: ["Consolas", "Courier New", "monospace"],
        body: ["Consolas", "Courier New", "monospace"],
        label: ["Consolas", "Courier New", "monospace"],
        code: ["Consolas", "Courier New", "monospace"],
        mono: ["Consolas", "Courier New", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        xs: "0.125rem",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
