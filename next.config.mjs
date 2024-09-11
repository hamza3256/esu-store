import { withPayload } from "@payloadcms/next-payload";
import { fileURLToPath } from "url";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";
const productionHostname = process.env.NEXT_PUBLIC_SERVER_URL
  ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname
  : "esustore.com"; // Default production hostname if environment variable is not set

/** @type {import('next').NextConfig} */
const nextConfig = withPayload(
  {
    images: {
      remotePatterns: [
        // For local development (localhost)
        {
          protocol: "http",
          hostname: "localhost",
          port: "3000",
          pathname: "/media/**",
        },
        // For production
        {
          protocol: "https",
          hostname: productionHostname, // Dynamically set production hostname
          pathname: "/media/**",
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
