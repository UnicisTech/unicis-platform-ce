module.exports = {
  mode: 'jit',
  darkMode: ['class', 'class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'risk-extreme-low': 'rgba(211, 211, 211, 0.5)',
        'risk-low': 'rgba(0, 255, 0, 0.3)',
        'risk-medium': 'rgba(255, 255, 0, 0.3)',
        'risk-high': 'rgba(255, 165, 0, 0.3)',
        'risk-extreme': 'rgba(255, 0, 0, 0.3)',
        'risk-extreme-low-dark': 'rgba(161, 161, 170, 1)',
        'risk-low-dark': 'rgba(52, 211, 153, 1)',
        'risk-medium-dark': 'rgba(251, 146, 60, 1)',
        'risk-high-dark': 'rgba(251, 146, 60, 1)',
        'risk-extreme-dark': 'rgba(239, 68, 68, 1)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  safelist: [
    'bg-risk-extreme-low',
    'bg-risk-low',
    'bg-risk-medium',
    'bg-risk-high',
    'bg-risk-extreme',
    'bg-risk-extreme-low-dark',
    'bg-risk-low-dark',
    'bg-risk-medium-dark',
    'bg-risk-high-dark',
    'bg-risk-extreme-dark',
  ],
};
