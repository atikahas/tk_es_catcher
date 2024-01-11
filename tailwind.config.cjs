/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        // primary: {
        //   50: '#FFF5F2',
        //   100: '#FFF1EE',
        //   200: '#FFE4DE',
        //   300: '#FFD5CC',
        //   400: '#FFBCAD',
        //   500: '#FE795D',
        //   600: '#EF562F',
        //   700: '#EB4F27',
        //   800: '#CC4522',
        //   900: '#A5371B'
        // },

        // slate
        primary: {
          "50":"#f8fafc",
          "100":"#f1f5f9",
          "200":"#e2e8f0",
          "300":"#cbd5e1",
          "400":"#94a3b8",
          "500":"#64748b",
          "600":"#475569",
          "700":"#334155",
          "800":"#1e293b",
          "900":"#0f172a"
        }
      }
    }
  }
};

module.exports = config;
