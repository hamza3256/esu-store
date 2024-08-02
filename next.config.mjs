import { withPayload } from "@payloadcms/next-payload";
import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = withPayload(
  {
    // output: "standalone",
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          port: "3000",
          pathname: "/media/**",
        },
        {
          protocol: "https",
          hostname: "esu-store.vercel.app",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: process.env.NEXT_PUBLIC_SERVER_URL
            ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname
            : "",
          pathname: "/**",
        },
      ],
    },
  },
  {
    configPath: path.resolve(
      fileURLToPath(new URL(".", import.meta.url)),
      process.env.PAYLOAD_CONFIG_PATH
        ? process.env.PAYLOAD_CONFIG_PATH
        : "src/payload.config.ts"
    ),
  }
);

export default nextConfig;
