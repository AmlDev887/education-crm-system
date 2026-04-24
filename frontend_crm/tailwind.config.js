/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        bg: {
          0: '#0a0a0d',
          1: '#0f0f14',
          2: '#14141a',
          3: '#1a1a22',
          4: '#20202a',
        },
        border: {
          DEFAULT: '#1e1e28',
          2: '#282835',
          3: '#323244',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          dim: 'rgba(124,58,237,0.15)',
          border: 'rgba(124,58,237,0.35)',
        },
        txt: {
          DEFAULT: '#eae8e3',
          muted: '#696874',
          dim: '#35353f',
        },
        success: { DEFAULT: '#10b981', dim: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
        danger:  { DEFAULT: '#f43f5e', dim: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.28)' },
        warn:    { DEFAULT: '#f59e0b', dim: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
        info:    { DEFAULT: '#38bdf8', dim: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.28)' },
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
  },
  plugins: [],
}
