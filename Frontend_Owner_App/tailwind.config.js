/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors : {
        primary: "#313030",
        secondary: "#1E1F26",
        tertiary: "#5E5C5C",
        accent: "#EA4444",
        violet: "#5147DE",
        green: "#76D09C"

      },  
      fontFamily: {
        keaniaOne_regular: ["KeaniaOne-Regular"], 
        poppins_regualr: ["Poppins-Regular"],
        spaceMono_regular: ["SpaceMono-Regular"],
      },
    },
  },
  plugins: [],
}

