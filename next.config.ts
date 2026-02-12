import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const config: NextConfig = {
    transpilePackages: ["next-mdx-remote"],
};

export default withWorkflow(config);
