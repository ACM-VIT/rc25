import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(date-picker|button|ripple|spinner|calendar|date-input|form|popover).js"
  ],
	theme: {
		screens: {
			'phone':{'min':'220px','max':'480px'},
			'xs':'480px',
			'sm': '640px',
			// => @media (min-width: 640px) { ... }

			'md': '768px',
			'lg-sm':'950px',
			// => @media (min-width: 768px) { ... }
			'lg-md':"1000px",
			'lg': '1024px',
			// => @media (min-width: 1024px) { ... }

			'xl': '1280px',
			// => @media (min-width: 1280px) { ... }

			'2xl': '1536px',
			// => @media (min-width: 1536px) { ... }
		},
		extend: {
			fontFamily: {
				custom: ['deathstar', 'sans-serif'], // Register your custom font
			  },
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
                text: "#FEFEFE",
                primary: "#9B52E0",
                rcgrey: "#808080",
                secondary: "#3F2A54",
                accent: "#F8CC22",
                rcred: "#EA5757",
                rcgreen: "#27AE60",
                rcorange: "#F2994A",
			},
            backgroundImage: {
                'background-gradient': 'radial-gradient(110.8% 70.71% at 50% 50%, #0B0014 35.41%, #18181B 100%)',
            },

			boxShadow: {
				"sharp-sm": "0 2px 0 0 rgba(0,0,0,0.25)",
				"sharp-lg": "0 4px 0 0 rgba(0,0,0,0.25)",
			},
			keyframes: {
				float: {
				  '0%, 100%': { transform: 'translateY(0)' },
				  '50%': { transform: 'translateY(-28px)' },
				  
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				  },
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				  },
				  "accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				  },
			},
			animation: {
				'spin-slow': 'spin 30s linear infinite',
				float: 'float 1.5s ease-in-out infinite',
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				fadeIn: "fadeIn 1.5s ease-in-out",
			},
		},
		plugins: [
			require('tailwindcss-motion'), 
		],
	},
	
  plugins: [nextui()],
};
export default config;
