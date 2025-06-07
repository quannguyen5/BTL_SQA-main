/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        tablet: { max: "799px" },
        // => @media (max-width: 799px) { ... }
        mobile: { max: "477px" },
        // => @media (max-width: 477px) { ... }
      },
    },
    screens: {
      sm: "576px",
      md: "799px",
      lg: "992px",
      xl: "1200px",
    },
    boxShadow: {
        'custom-dark': '0px 0px 7px 1px rgba(0, 0, 0, 0.55)', // tương đương với #0000008c
        'custom-slate': '0 4px 6px rgba(15, 23, 42, 0.1)',
      },
      
    // borderWidth: {
    //     '10': '10px',
    //   },
    // borderColor: {
    //     'custom-color': 'rgba(36, 105, 92, 0.2)',
    //   },
  
  },
  plugins: [],
};