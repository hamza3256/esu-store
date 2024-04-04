// /** @type {import('next').NextConfig} */
// const nextConfig = {
// 	images: {
// 		remotePatterns: [
// 			{
// 				protocol: "http",
// 				hostname: "localhost",
// 			},
// 			{
// 				protocol: "https",
// 				hostname: "esu-store.vercel.app",
// 			},
// 		],
// 	},
// };

import { withPayload } from "@payloadcms/next-payload";
import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = withPayload(
  {
    images: {
      domains: [
        "localhost",
        "esu-store.vercel.app",
        process.env.NEXT_PUBLIC_SERVER_URL
          ? process.env.NEXT_PUBLIC_SERVER_URL
          : "",
      ],
    },
  },
  {
    // Convert the URL to a file path and then resolve the path
    configPath: path.resolve(
      fileURLToPath(new URL(".", import.meta.url)),
      "src/payload.config.ts"
    ),
  }
);

export default nextConfig;
