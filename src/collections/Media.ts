import { User } from "@/payload-types";
import { Access, CollectionConfig } from "payload/types";
import cloudinary from "../lib/cloudinary";

// Access function for checking if the user has admin access or access to images
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

// Helper function to generate Cloudinary URLs based on image sizes
const generateCloudinaryUrl = (publicId: string, size: { width: number; height?: number }) => {
  return cloudinary.url(publicId, {
    width: size.width,
    height: size.height,
    crop: "fill",
    gravity: "center",
    quality: "auto",
    fetch_format: "auto",
  });
};

// Helper function to promisify the upload_stream method
const uploadToCloudinary = (file: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'media', // Folder to store files in Cloudinary
      },
      (error, result) => {
        if (error) {
          reject(error); // Reject the promise if there's an error
        } else {
          resolve(result); // Resolve the promise with the result
        }
      }
    );

    // Create a buffer stream to pipe the file's data to Cloudinary
    const bufferStream = new (require('stream')).PassThrough();
    bufferStream.end(file.data);  // Stream the file buffer
    bufferStream.pipe(stream);    // Pipe the stream to Cloudinary's uploader
  });
};

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    // Hook to handle file uploads before the change is saved to the database
    beforeChange: [
      async ({ req, data, operation }) => {
        try {
          const file = req.files?.file; // Get the file from the request
          
          if (file && (operation === 'create' || operation === 'update')) {
            console.log('Uploading file:', file.name, 'Size:', file.size || file.data?.length);

            // Use the promisified upload function to upload the file to Cloudinary
            const result = await uploadToCloudinary(file);

            // Check if the result from Cloudinary is valid
            if (result) {
              console.log("secure url: " + result.secure_url);
              console.log("url: " + result.url);
              console.log("public id: " + result.public_id);

              // Attach the Cloudinary URL and public ID to the data
              data.url = result.secure_url;
              data.cloudinaryId = result.public_id;

              // Generate Cloudinary URLs for different sizes
              data.sizes = {
                thumbnail: generateCloudinaryUrl(result.public_id, { width: 400, height: 300 }),
                card: generateCloudinaryUrl(result.public_id, { width: 768, height: 1024 }),
                tablet: generateCloudinaryUrl(result.public_id, { width: 1024 }),
              };
            }
          }
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          throw new Error('Failed to upload media to Cloudinary');
        }

        return data; // Return the modified data to save it in the database
      },
    ],
    // Hook to handle deleting a file from Cloudinary after it is deleted in PayloadCMS
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
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre", // different spelling in CMS docs
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: undefined,
        position: "centre",
      },
    ],
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
        condition: () => false, // Hide this field in the admin panel
      },
    },
  ],
};
