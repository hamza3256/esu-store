import { withPayload } from "@payloadcms/next-payload";
import { fileURLToPath } from "url";
import path from "path";

const productionHostname = process.env.NEXT_PUBLIC_SERVER_URL
  ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname
  : "esustore.com";

const protocol = process.env.NEXT_PUBLIC_SERVER_URL?.startsWith('https') ? 'https' : 'http';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esustore.com https://res.cloudinary.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' https://esustore.com https://res.cloudinary.com data:;
      connect-src 'self' https://esustore.com;
      font-src 'self';
      frame-src https://esustore.com;
      trusted-types default;
      require-trusted-types-for 'script';
    `.replace(/\n/g, ''),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Feature-Policy',
    value: "camera 'none'; microphone 'none'; geolocation 'none'",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = withPayload(
  {
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          port: "3000",
          pathname: "/media/**",
        },
        {
          protocol: protocol,
          hostname: productionHostname,
          // pathname: "/media/**",
        },
        {
          protocol: "https",
          hostname: "res.cloudinary.com"
        }
      ],
    },
    reactStrictMode: true,
    swcMinify: true,
    // async headers() {
    //   return [
    //     {
    //       source: '/(.*)', // Apply to all routes
    //       headers: [
    //         {
    //           key: 'Access-Control-Allow-Origin',
    //           value: '*', // You can limit this to specific domains, e.g. 'https://www.facebook.com'
    //         },
    //         {
    //           key: 'Access-Control-Allow-Methods',
    //           value: 'GET, POST, OPTIONS',
    //         },
    //         {
    //           key: 'Access-Control-Allow-Headers',
    //           value: 'X-Requested-With, Content-Type, Accept',
    //         },
    //       ],
    //     },
    //   ]
    // },
    /*async headers() {
      return [
        {
          // Apply these headers to all routes
          source: "/(.*)",
          headers: securityHeaders,
        },
      ];
    },*/
  },
  {
    configPath: path.resolve(
      fileURLToPath(new URL(".", import.meta.url)),
      process.env.PAYLOAD_CONFIG_PATH || "src/payload.config.ts"
    ),
  }
);

export default nextConfig;
