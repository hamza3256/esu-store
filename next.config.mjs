import { withPayload } from "@payloadcms/next-payload";
import { fileURLToPath } from "url";
import path from "path";

// Derive the hostname from NEXT_PUBLIC_SERVER_URL, or use a default for production
const productionHostname = process.env.NEXT_PUBLIC_SERVER_URL
  ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname
  : "esustore.com";

// Determine the protocol based on NEXT_PUBLIC_SERVER_URL
const protocol = process.env.NEXT_PUBLIC_SERVER_URL?.startsWith('https') ? 'https' : 'http';

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
          protocol: protocol,
          hostname: productionHostname, // Dynamically set production hostname
          // port: process.env.PORT?.toString() || "8080",
          pathname: "/media/**",
        },
      ],
    },
    reactStrictMode: true,
    swcMinify: true,
  },
  {
    // Define the path to the Payload configuration
    configPath: path.resolve(
      fileURLToPath(new URL(".", import.meta.url)),
      process.env.PAYLOAD_CONFIG_PATH || "src/payload.config.ts"
    ),
  }
);

export default nextConfig;
