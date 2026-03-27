import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B",
        ivory: "#F9F8F5",
        gold: {
          100: "#F7E7B4",
          200: "#EFD58E",
          300: "#D8B86A",
          400: "#B8913C",
          500: "#9A731C"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        "luxury-soft": "0 20px 60px rgba(0, 0, 0, 0.25)",
        "luxury-card": "0 18px 40px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(1200px circle at 20% 20%, rgba(247,231,180,0.18), transparent 55%)",
        "gold-sheen":
          "linear-gradient(135deg, rgba(247,231,180,0.35), rgba(184,145,60,0.1) 55%, rgba(11,11,11,0) 80%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        }
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s ease-out both",
        shimmer: "shimmer 8s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
