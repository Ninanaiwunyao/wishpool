/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans TC", "sans-serif"],
      },
      colors: {
        darkBlue: "#2F3061",
        lightBlue: "#6CA6C1",
        yellow: "#FFE66D",
        darkYellow: "#ffd405",
        jet: "#343434",
        cream: "#F7FFF7",
      },
      screens: {
        sm: "641px",
        msm: "860px",
        md: "1245px",
        lg: "1921px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      //   colors: {
      //     background: "hsl(var(--background))",
      //     foreground: "hsl(var(--foreground))",
      //     card: {
      //       DEFAULT: "hsl(var(--card))",
      //       foreground: "hsl(var(--card-foreground))",
      //     },
      //     popover: {
      //       DEFAULT: "hsl(var(--popover))",
      //       foreground: "hsl(var(--popover-foreground))",
      //     },
      //     primary: {
      //       DEFAULT: "hsl(var(--primary))",
      //       foreground: "hsl(var(--primary-foreground))",
      //     },
      //     secondary: {
      //       DEFAULT: "hsl(var(--secondary))",
      //       foreground: "hsl(var(--secondary-foreground))",
      //     },
      //     muted: {
      //       DEFAULT: "hsl(var(--muted))",
      //       foreground: "hsl(var(--muted-foreground))",
      //     },
      //     accent: {
      //       DEFAULT: "hsl(var(--accent))",
      //       foreground: "hsl(var(--accent-foreground))",
      //     },
      //     destructive: {
      //       DEFAULT: "hsl(var(--destructive))",
      //       foreground: "hsl(var(--destructive-foreground))",
      //     },
      //     border: "hsl(var(--border))",
      //     input: "hsl(var(--input))",
      //     ring: "hsl(var(--ring))",
      //     chart: {
      //       1: "hsl(var(--chart-1))",
      //       2: "hsl(var(--chart-2))",
      //       3: "hsl(var(--chart-3))",
      //       4: "hsl(var(--chart-4))",
      //       5: "hsl(var(--chart-5))",
      //     },
      //   },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
