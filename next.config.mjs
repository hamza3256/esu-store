import { withPayload } from "@payloadcms/next-payload";
import { fileURLToPath } from "url";
import path from "path";

const productionHostname = process.env.NEXT_PUBLIC_SERVER_URL
  ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname
  : "esustore.com";

const protocol = process.env.NEXT_PUBLIC_SERVER_URL?.startsWith('https') ? 'https' : 'http';

/** @type {import('next').NextConfig} */
const nextConfig = withPayload(
  {
    images: {
      remotePatterns: [
        {
          protocol: protocol,
          hostname: productionHostname,
        },
        {
          protocol: "https",
          hostname: "res.cloudinary.com"
        }
      ],
    },
    reactStrictMode: true,
    swcMinify: true,
  },
  {
    configPath: path.resolve(
      fileURLToPath(new URL(".", import.meta.url)),
      process.env.PAYLOAD_CONFIG_PATH || "src/payload.config.ts"
    ),
  }
);

export default nextConfig;
