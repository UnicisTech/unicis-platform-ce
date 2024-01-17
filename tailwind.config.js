module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
  ],
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
};
