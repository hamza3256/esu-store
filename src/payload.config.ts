import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import { buildConfig } from "payload/config";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import path from "path";
import { Users } from "./collections/Users";
import dotenv from "dotenv";
import { Products } from "./collections/Products/Products";
import { Media } from "./collections/Media";
import { ProductFiles } from "./collections/ProductFile";
import { Orders } from "./collections/Orders";
import { Configuration as WebpackConfig } from 'webpack';
import { PromoCodes } from "./collections/PromoCodes";
import AdminLogo from "./components/AdminLogo";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("Environment: " + process.env.NODE_ENV)

const db = process.env.MONGODB_URI!

export default buildConfig({
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL!,
    'https://esu.london',
  ],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL!, 
    'https://esu.london'
  ],
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
  collections: [Users, Products, Media, ProductFiles, Orders, PromoCodes],
  routes: {
    admin: "/sell",
  },
  admin: {
    user: "users",
    bundler: webpackBundler(),
    components: {
      graphics: {
        Logo: AdminLogo,
      },
    },
    webpack: (config: WebpackConfig): WebpackConfig => {
      const isServer = config.target === 'node';  // Determine if it's server or client

      if (!isServer) {
        config.resolve!.fallback = {
          ...config.resolve?.fallback,
          fs: false, // Cloudinary's SDK shouldn't need `fs` in client-side
          stream: require.resolve('stream-browserify'),
          querystring: require.resolve('querystring-es3'),
          url: require.resolve('url/'),
        };
      }

      return config;
    },
    meta: {
      titleSuffix: "- esü",
      favicon: "/favicon.ico",
      ogImage: "/esu-official.jpg",
    },
  },
  rateLimit: {
    max: 500,
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: db,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
});
