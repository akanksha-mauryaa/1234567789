/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#050508',
        surface: '#0e0e16',
        card:    '#13131f',
        border:  '#1e1e30',
        accent:  '#00e5ff',
        accent2: '#7c3aed',
        neon:    '#00ff88',
        danger:  '#ff4757',
        warn:    '#ffd32a',
        muted:   '#6b6b8a',
        primary: '#e8e8f0',
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
