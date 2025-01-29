module.exports = {
  mode: 'jit',
  darkMode: 'class',
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
      },
    },
  },
  daisyui: {
    //themes: ['corporate'],
    themes: [
      'dark',
      'corporate',
      // {
      //   unicis: {
      //     primary: '#0052cc',
      //     secondary: '#3578e5',
      //     accent: '#538ce9',
      //     neutral: '#c7e3fb',
      //     'base-100': '#FFFFFF',
      //     info: '#3ABFF8',
      //     success: '#36D399',
      //     warning: '#FBBD23',
      //     error: '#F87272',
      //   },
      // },
    ],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  safelist: [
    'bg-risk-extreme-low',
    'bg-risk-low',
    'bg-risk-medium',
    'bg-risk-high',
    'bg-risk-extreme'
  ]
};
