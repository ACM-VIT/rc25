import type { NextConfig } from "next";

const config: NextConfig = {
    transpilePackages: ["next-mdx-remote"],
    experimental: {
        serverActions: {
            bodySizeLimit: "4mb", // or whatever limit you need
        },
    },
};

export default config;
