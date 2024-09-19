import { withPayload } from "@payloadcms/next-payload";
import { fileURLToPath } from "url";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

const productionHostname = process.env.NEXT_PUBLIC_SERVER_URL
  ? process.env.NEXT_PUBLIC_SERVER_URL.replace(/^https?:\/\//, '')
  : "esustore.com";

const protocol = (() => {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    if (process.env.NEXT_PUBLIC_SERVER_URL.startsWith('https')) {
      return 'https';
    } else if (process.env.NEXT_PUBLIC_SERVER_URL.startsWith('http')) {
      return 'http';
    }
  }
  return 'https';
})();

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
