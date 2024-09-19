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

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("Environment: " + process.env.NODE_ENV)

// const db = (() => {
//   if (process.env.NODE_ENV === "development") {
//     console.log("Connecting to development database...")
//     return process.env.MONGODB_DEV!;
//   } else if (process.env.NODE_ENV === "production") {
//     console.log("Connecting to production database...")
//     return process.env.MONGODB_PROD!; // TODO: use production url
//   } else {
//     console.log("Connecting to default testing database...")
//     return process.env.MONGODB_URI!;
//   }
// })();

const db = process.env.MONGODB_URI!

export default buildConfig({
  cors: [process.env.NEXT_PUBLIC_SERVER_URL!],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL!],
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
  collections: [Users, Products, Media, ProductFiles, Orders],
  routes: {
    admin: "/sell",
  },
  admin: {
    user: "users",
    bundler: webpackBundler(),
    meta: {
      titleSuffix: "- esü",
      favicon: "/favicon.ico",
      ogImage: "/thumbnail.jpg",
    },
  },
  rateLimit: {
    max: 500, //TODO: reduce to 500 for production
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: db,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
});
