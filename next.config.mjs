/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // remotePatterns: [
    //   {
    //     hostname: "localhost",
    //     pathname: "**",
    //     port: "3000",
    //     protocol: "http",
    //   },
    // ],
    domains: ["localhost", "esu-store.vercel.app", "esustore.com"],
  },
};

export default nextConfig;
