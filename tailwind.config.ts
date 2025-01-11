import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],

	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
                text: "#FEFEFE",
                primary: "#9B52E0",
                rcgrey: "#808080",
                secondary: "#3F2A54",
                accent: "#F8CC22"
			},
            backgroundImage: {
                'background-gradient': 'radial-gradient(110.8% 70.71% at 50% 50%, #0B0014 55.41%, #18181B 100%)',
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
	plugins: [],
};
export default config;
