import type { Config } from "tailwindcss";

// Palet dibatasi 2 warna inti (slate + teal) + 1 aksen (amber), sesuai
// identitas "konsol dispatch": tenang, padat informasi, aksen dipakai
// hanya pada aksi utama dan status yang butuh perhatian.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#101826",
          soft: "#3c4759",
        },
        paper: {
          DEFAULT: "#f5f4ef",
          raised: "#ffffff",
        },
        line: "#dcdad0",
        brand: {
          50: "#eef6f5",
          100: "#d3e9e6",
          300: "#7ab8b0",
          500: "#2f7d73",
          600: "#256359",
          700: "#1c4a43",
        },
        accent: {
          100: "#fbe6c8",
          400: "#e2932f",
          500: "#c97812",
          600: "#a15f0c",
        },
        status: {
          baru: "#5b6472",
          diproses: "#2f7d73",
          diantar: "#c97812",
          selesai: "#2f8a4a",
        },
        danger: "#b3402f",
      },
      fontFamily: {
        sans: [
          "Public Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 38, 0.06), 0 1px 0 rgba(16, 24, 38, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
