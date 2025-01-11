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
			// => @media (min-width: 768px) { ... }

			'lg': '1024px',
			// => @media (min-width: 1024px) { ... }

			'xl': '1280px',
			// => @media (min-width: 1280px) { ... }

			'2xl': '1536px',
			// => @media (min-width: 1536px) { ... }
		},
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			boxShadow: {
				"sharp-sm": "0 2px 0 0 rgba(0,0,0,0.25)",
				"sharp-lg": "0 4px 0 0 rgba(0,0,0,0.25)",
			},
			fontFamily:{
				title: ['Audiowide'],
				subtitle: ['PT Sans']
			}
		},
	},
  plugins: [nextui()],
};
export default config;
