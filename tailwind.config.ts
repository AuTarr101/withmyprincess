import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F5EFE5',
          300: '#EFE7DB',
          400: '#E2D5C3',
          500: '#CFC0AA',
        },
        wine: {
          50: '#FDF4F5',
          100: '#F9E5E8',
          200: '#F2CDD3',
          300: '#E5A5B1',
          400: '#CE6E83',
          500: '#9E3C52',
          600: '#7E3B4D', // primary button from spec & image
          700: '#6E2D3B', // heading from image
          800: '#5A2430',
          900: '#461B25',
        },
        dusty: {
          50: '#FCF9F9',
          100: '#F5ECEB',
          200: '#EFE5E2', // badge background from image
          300: '#DFCFCD',
          400: '#C2ACAB',
          500: '#855F68', // badge text from image
        },
        sage: {
          50: '#F5F7F5',
          100: '#E8ECE8',
          200: '#D5DFD5',
          500: '#6E8171',
          700: '#4E5F51',
        },
        warmText: {
          light: '#8F7D7A',
          muted: '#70605E',
          body: '#5A4846',
          heading: '#332426',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        scrapbook: '0 4px 20px -2px rgba(110, 45, 59, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        polaroid: '0 8px 30px rgba(78, 59, 63, 0.12)',
        warmButton: '0 4px 14px rgba(126, 59, 77, 0.28)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
export default config;
