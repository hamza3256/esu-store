import { User } from "@/payload-types";
import { Access, CollectionConfig } from "payload/types";
import cloudinary from "../lib/cloudinary";
import { mediaCache } from "../lib/redis";

// Access function to check if the user is an admin or has access to images
const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;
    const allowedRoles = ["admin", "seller", "employee"];

    if (!user) return false;
    if (allowedRoles.includes(user.role!)) return true;

    return {
      user: {
        equals: req.user.id,
      },
    };
  };

// Helper function to generate Cloudinary URLs based on media type (image or video)
const generateCloudinaryUrl = (publicId: string, size: { width?: number; height?: number } = {}, resourceType: string) => {
  if (resourceType === "image") {
    return cloudinary.url(publicId, {
      width: size.width,
      height: size.height,
      crop: "fill",
      gravity: "center",
      quality: "auto",
      fetch_format: "auto",
    });
  }

  return cloudinary.url(publicId, {
    resource_type: "video",
    fetch_format: "auto",
    quality: "auto:good",   // Optimize quality automatically
    video_bitrate: "500k",  // Use a lower bitrate for optimized delivery
    dpr: "auto",            // Adjust for device pixel ratio automatically
    width: size.width,      // Optional: Specify width if needed
    crop: "fill"            // Ensure video fills container
  });
};

// Helper function to upload files to Cloudinary and return the result
const uploadToCloudinary = (file: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'media', resource_type: file.mimetype.startsWith("video") ? "video" : "image" }, // Specify resource type
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create a buffer stream to pipe the file's data to Cloudinary
    const bufferStream = new (require('stream')).PassThrough();
    bufferStream.end(file.data); // Stream the file buffer
    bufferStream.pipe(stream);
  });
};

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        try {
          const file = req.files?.file;

          if (file && (operation === 'create' || operation === 'update')) {
            console.log('Uploading file:', file.name, 'Size:', file.size || file.data?.length);

            const result = await uploadToCloudinary(file);

            if (result && result.secure_url && result.public_id) {
              console.log("Cloudinary secure URL:", result.secure_url);
              console.log("Cloudinary public ID:", result.public_id);

              data.url = result.secure_url;
              data.cloudinaryId = result.public_id;
              data.resourceType = result.resource_type;

              if (result.resource_type === "image") {
                const sizes = {
                  thumbnail: {
                    width: 400,
                    height: 300,
                    mimeType: result.resource_type,
                    filesize: result.bytes,
                    url: generateCloudinaryUrl(result.public_id, { width: 400, height: 300 }, "image"),
                  },
                  card: {
                    width: 768,
                    height: 1024,
                    mimeType: result.resource_type,
                    filesize: result.bytes,
                    url: generateCloudinaryUrl(result.public_id, { width: 768, height: 1024 }, "image"),
                  },
                  tablet: {
                    width: 1024,
                    height: undefined,
                    mimeType: result.resource_type,
                    filesize: result.bytes,
                    url: generateCloudinaryUrl(result.public_id, { width: 1024 }, "image"),
                  },
                };

                data.sizes = sizes;

                // Cache each size URL
                await Promise.all(
                  Object.entries(sizes).map(([size, data]) =>
                    mediaCache.setMediaUrl(result.public_id, data.url, size)
                  )
                );
              } else if (result.resource_type === "video") {
                const videoData = {
                  width: result.width,
                  height: result.height,
                  mimeType: result.resource_type,
                  filesize: result.bytes,
                  url: generateCloudinaryUrl(result.public_id, {}, "video"),
                };

                data.sizes = {
                  video: videoData,
                };

                // Cache video URL
                await mediaCache.setMediaUrl(result.public_id, videoData.url, 'video');
              }
            } else {
              throw new Error("Cloudinary upload failed: missing required result fields.");
            }
          }
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          throw new Error('Failed to upload media to Cloudinary');
        }

        return { ...data, user: req.user.id };
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          if (doc.cloudinaryId) {
            // Delete from Cloudinary
            await cloudinary.uploader.destroy(doc.cloudinaryId, {
              resource_type: doc.resourceType || 'image',
            });

            // Invalidate Redis cache
            await mediaCache.invalidateMedia(doc.cloudinaryId);
          }
        } catch (error) {
          console.error("Error deleting media:", error);
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
    staticURL: undefined,
    staticDir: undefined,
    mimeTypes: ["image/*", "video/*"], // Allowed file types (including videos)
  },
  fields: [
    {
      name: "cloudinaryId", 
      type: "text",
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "resourceType", // Store the media type (image or video)
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "sizes", 
      label: "Media Sizes",
      type: "group",
      fields: [
        {
          name: "thumbnail",
          label: "Thumbnail Size",
          type: "group",
          fields: [
            { name: "width", type: "number" },
            { name: "height", type: "number" },
            { name: "mimeType", type: "text" },
            { name: "filesize", type: "number" },
            { name: "url", type: "text" },
          ],
        },
        {
          name: "card",
          label: "Card Size",
          type: "group",
          fields: [
            { name: "width", type: "number" },
            { name: "height", type: "number" },
            { name: "mimeType", type: "text" },
            { name: "filesize", type: "number" },
            { name: "url", type: "text" },
          ],
        },
        {
          name: "tablet",
          label: "Tablet Size",
          type: "group",
          fields: [
            { name: "width", type: "number" },
            { name: "height", type: "number" },
            { name: "mimeType", type: "text" },
            { name: "filesize", type: "number" },
            { name: "url", type: "text" },
          ],
        },
        {
          name: "video", // Handle video properties
          label: "Video Size",
          type: "group",
          fields: [
            { name: "width", type: "number" },
            { name: "height", type: "number" },
            { name: "mimeType", type: "text" },
            { name: "filesize", type: "number" },
            { name: "url", type: "text" },
          ],
        },
      ],
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
