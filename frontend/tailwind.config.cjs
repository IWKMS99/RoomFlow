/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      borderRadius: {
        xl: 'var(--radius-xl)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          foreground: 'hsl(var(--danger-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
      },
      boxShadow: {
        soft: '0 12px 36px -22px hsl(var(--shadow-depth) / 0.76)',
        focus: '0 0 0 2px hsl(var(--ring) / 0.45)',
        glow: '0 22px 65px -28px hsl(var(--glow-2) / 0.72)',
        glass:
          'inset 0 1px 0 hsl(var(--text-hi) / 0.16), 0 30px 70px -42px hsl(var(--shadow-depth) / 0.95), 0 0 0 1px hsl(var(--glow-2) / 0.14)',
        trench:
          'inset 0 1px 0 hsl(var(--text-hi) / 0.08), inset 0 -1px 0 hsl(var(--text-hi) / 0.04), inset 0 0 0 1px hsl(var(--shadow-depth) / 0.55)',
      },
      backgroundImage: {
        hatch:
          'repeating-linear-gradient(135deg, hsl(var(--text-hi) / 0.03) 0, hsl(var(--text-hi) / 0.03) 2px, transparent 2px, transparent 7px)',
      },
    },
  },
  plugins: [],
};
