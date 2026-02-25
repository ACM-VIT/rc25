/** @type {import('next').NextConfig} */
const config = {
    transpilePackages: ["next-mdx-remote"],
    experimental: {
        serverActions: {
            bodySizeLimit: "4mb", // or whatever limit you need
        },
    },
};

export default config;
