import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],

	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			boxShadow: {
				"sharp-sm": "0 2px 0 0 rgba(0,0,0,0.25)",
				"sharp-lg": "0 4px 0 0 rgba(0,0,0,0.25)",
			},
		},
	},
	plugins: [],
};
export default config;
