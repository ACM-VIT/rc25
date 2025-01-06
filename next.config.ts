import type { NextConfig } from "next";

const config: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: "4mb", // or whatever limit you need
		},
	},
};

export default config;
