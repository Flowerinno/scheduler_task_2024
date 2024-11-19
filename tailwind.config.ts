import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [\n          "Inter",\n          "ui-sans-serif",\n          "system-ui",\n          "sans-serif",\n          "Apple Color Emoji",\n          "Segoe UI Emoji",\n          "Segoe UI Symbol",\n          "Noto Color Emoji",\n        ]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
