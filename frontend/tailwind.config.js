/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        },
        secondary: '#7c3aed',
        accent: '#2dd4bf',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      }
    },
  },
  plugins: [],
}
