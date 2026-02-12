import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const config: NextConfig = {
    basePath: "/portal",
    transpilePackages: ["next-mdx-remote"],
    async redirects() {
        return [
            {
                source: "/",
                destination: "/portal",
                permanent: false,
                basePath: false,
            },
            {
                source: "/api/auth/:path*",
                destination: "/portal/api/auth/:path*",
                permanent: false,
                basePath: false,
            },
            {
                source: "/api/realtime",
                destination: "/portal/api/realtime",
                permanent: false,
                basePath: false,
            },
            {
                source: "/:path((?!portal(?:/|$)|_next(?:/|$)|api(?:/|$)|\\.well-known(?:/|$)).*)",
                destination: "/portal/:path",
                permanent: false,
                basePath: false,
            },
        ];
    },
};

export default withWorkflow(config);
