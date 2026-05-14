/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      'var(--bg)',
        surface: 'var(--surface)',
        card:    'var(--card)',
        border:  'var(--border)',
        accent:  'var(--accent)',
        accent2: 'var(--accent2)',
        neon:    'var(--accent2)',
        danger:  '#ef4444',
        warn:    '#f59e0b',
        muted:   'var(--muted)',
        primary: 'var(--primary)',
      },
      fontFamily: {
        mono: ['Space Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        pulseRing: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(0,229,255,.4)' },
          '50%':     { boxShadow: '0 0 0 6px rgba(0,229,255,0)' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1s infinite',
        spin:      'spin 0.8s linear infinite',
        fadeIn:    'fadeIn 0.3s ease both',
      },
    },
  },
  plugins: [],
}
