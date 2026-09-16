/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sjc: {
          maroon: {
            DEFAULT: '#8A1538', // SJC Qatar Maroon (العنابي)
            50: '#FDF2F4',
            100: '#FBE6EB',
            200: '#F5C2CD',
            300: '#EE9EAE',
            400: '#E05672',
            500: '#C72548',
            600: '#A6173B',
            700: '#8A1538', // Primary
            800: '#6D0F2B',
            900: '#520B20',
            950: '#340614',
          },
          gold: {
            DEFAULT: '#C5A059', // SJC Gold / Bronze Accent
            50: '#FAF8F3',
            100: '#F4EFE3',
            200: '#E7DCBF',
            300: '#D9C89A',
            400: '#CCA96B',
            500: '#C5A059', // Primary Accent
            600: '#B08A42',
            700: '#8F6E32',
            800: '#6E5427',
            900: '#4D3B1B',
          },
          slate: {
            dark: '#0F172A',
            card: '#1E293B',
            border: '#334155'
          }
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        sans: ['Cairo', 'Tajawal', 'Inter', 'sans-serif']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
