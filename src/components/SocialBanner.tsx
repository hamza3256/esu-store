import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";
import { useState, useEffect } from "react";

const SocialBanner = () => {
  const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dn20h4mis/image/upload/";
  const posts = [
    {
        id: "1", // This will only be shown on mobile
        public_id: "instagram_5",
        media_url:
          "https://res.cloudinary.com/dn20h4mis/image/upload/v1727751194/extra_instagram_post.jpg",
        permalink: "https://www.instagram.com/p/DAg_8U6tZ4Z/?igsh=MWVyZmZxbzd4ZzN1YQ==", // Replace with actual Instagram URL
        caption: "Turquoise Luxe",
    },
    {
      id: "2",
      public_id: "instagram_6",
      media_url:
        "https://res.cloudinary.com/dn20h4mis/image/upload/v1727751194/97545b9e-6201-4733-95c7-67b120631f08_whlkrx.jpg",
      permalink: "https://www.instagram.com/p/DAkl0wFNo_4/?igsh=bmZyMmFhMmZ6Mmhn", // Replace with actual Instagram URL
      caption: "Sunset Wave",
    },
    {
      id: "3",
      public_id: "instagram_3",
      media_url:
        "https://res.cloudinary.com/dn20h4mis/image/upload/v1727751467/Screenshot_2024-10-01_035639_zjmgii.png",
      permalink: "https://www.instagram.com/p/DAXAAriNnMl", // Replace with actual Instagram URL
      caption: "Crystal Blossom",
    },
    {
        id: "4",
        public_id: "instagram_1",
        media_url:
          "https://res.cloudinary.com/dn20h4mis/image/upload/v1727751466/Screenshot_2024-10-01_035552_ymhmjq.png",
        permalink: "https://www.instagram.com/p/DAbsYJktwUV", // Replace with actual Instagram URL
        caption: "Gold Zircon Ring",
    },
  ];

  // Function to get the Cloudinary URL
  const getCloudinaryUrl = (publicId: string, width: number, height: number) => {
    return `${CLOUDINARY_BASE_URL}w_${width},h_${height},c_fill,f_auto,q_auto:best,dpr_auto/${publicId}`;
  };

  const checkMobile = useMediaQuery("(max-width: 767px)");

  // Check if the device is mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkMobile); // Check if the screen is mobile-sized
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Render posts, including the 4th one only on mobile
  const visiblePosts = isMobile ? posts : posts.slice(0, 3); // Show 4 posts on mobile, 3 on larger screens

  return (
    <section className="instagram-feed py-12 bg-gray-100">
      <h2 className="text-3xl font-extrabold text-center tracking-wide text-gray-900 mb-8">
        Follow Us On Instagram
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 container mx-auto px-4">
        {visiblePosts.map((post) => (
          <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer">
            <div className="instagram-post relative overflow-hidden rounded-lg shadow-lg group">
              <Image
                src={getCloudinaryUrl(post.public_id, isMobile ? 400 : 600, isMobile ? 400 : 600)}
                alt={post.caption}
                width={isMobile ? 400 : 600}
                height={isMobile ? 400 : 600}
                className="transition-transform duration-500 transform object-cover group-hover:scale-110"
              />
              {/* Show caption differently for mobile users */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white py-2 text-center ${
                  isMobile ? "" : "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                }`}
              >
                <p className="text-xs md:text-sm font-medium">{post.caption}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default SocialBanner;
