import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#030506",
        "bg-secondary": "#050708",
        "bg-tertiary": "#080b0d",
        surface: "#0d1113",
        card: "#111518",
        cyan: {
          DEFAULT: "#00d9f5",
          bright: "#33e3ff",
        },
        "text-primary": "#f2f7f8",
        "text-muted": "#7d888d",
        danger: "#ef4b4b",
        success: "#35d399",
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      transitionTimingFunction: {
        "out-smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-smooth": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
