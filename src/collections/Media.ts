import { User } from "@/payload-types";
import { Access, CollectionConfig } from "payload/types";
import cloudinary from "../lib/cloudinary";

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;

    if (!user) return false;
    if (user.role === "admin") return true;

    return {
      user: {
        equals: req.user.id,
      },
    };
  };

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        try {
          const file = req.files?.file;  // Get the file from the request
          
          if (file && (operation === 'create' || operation === 'update')) {
            console.log('Uploading file:', file.name, 'Size:', file.size || file.data?.length);
            
            // Upload the file to Cloudinary using the file's buffer data
            const result = await cloudinary.uploader.upload_stream(
              {
                folder: 'media',  // Organize files in a Cloudinary folder
              },
              (error, result) => {
                if (error) {
                  console.error('Error uploading to Cloudinary:', error);
                  throw new Error('Failed to upload media to Cloudinary');
                }
                if (result) {
                  // Attach the Cloudinary URL and public ID to the data
                  data.url = result.secure_url;
                  data.cloudinaryId = result.public_id;
                }
              }
            );

            // Create a stream from the file's buffer data and pipe it to Cloudinary
            const stream = require('stream');
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.data);  // Stream the file buffer
            bufferStream.pipe(result);  // Pipe the stream to Cloudinary's uploader
          }
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          throw new Error('Failed to upload media to Cloudinary');
        }

        return data;
      },
    ],
    // Hook to remove the file from Cloudinary after it's deleted from PayloadCMS
    afterDelete: [
      async ({ doc }) => {
        try {
          // Remove file from Cloudinary based on public_id
          if (doc.cloudinaryId) {
            await cloudinary.uploader.destroy(doc.cloudinaryId);
          }
        } catch (error) {
          console.error("Error deleting from Cloudinary:", error);
        }
      },
    ],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer;

      if (!req.user || !referer?.includes("sell")) {
        return true;
      }
      return await isAdminOrHasAccessToImages()({ req });
    },
    delete: isAdminOrHasAccessToImages(),
    update: isAdminOrHasAccessToImages(),
  },
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  upload: {
    staticURL: undefined, // Not required for cloud storage
    staticDir: undefined, // Not required for cloud storage
    mimeTypes: ["image/*", "video/*"],
  },
  fields: [
    {
      name: "cloudinaryId", // Store Cloudinary's public ID for future reference
      type: "text",
      required: false,  // Not required as it will be automatically populated after upload
      admin: {
        readOnly: true,  // Make this field read-only in the admin panel
      },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
  ],
};
