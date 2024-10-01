import Image from "next/image";

const SocialBanner = () => {
  const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dn20h4mis/image/upload/";
  const posts = [
    {
      id: "1",
      public_id: "instagram_1",
      media_url:
        "https://res.cloudinary.com/dn20h4mis/image/upload/v1727751466/Screenshot_2024-10-01_035552_ymhmjq.png",
      permalink: "https://www.instagram.com/p/DAbsYJktwUV", // Replace with actual Instagram URL
      caption: "Classic black suit for every occasion.",
    },
    {
      id: "2",
      public_id: "instagram_4",
      media_url:
        "https://res.cloudinary.com/dn20h4mis/image/upload/v1727751194/97545b9e-6201-4733-95c7-67b120631f08_whlkrx.jpg",
      permalink: "https://www.instagram.com/p/DAji9V_tibG", // Replace with actual Instagram URL
      caption: "Stylish brown leather shoes to complete your outfit.",
    },
    {
      id: "3",
      public_id: "instagram_3",
      media_url:
        "https://res.cloudinary.com/dn20h4mis/image/upload/v1727751467/Screenshot_2024-10-01_035639_zjmgii.png",
      permalink: "https://www.instagram.com/p/DAXAAriNnMl", // Replace with actual Instagram URL
      caption: "The perfect combination of style and comfort.",
    },
  ];

  const getCloudinaryUrl = (publicId: string, width: number, height: number) => {
    return `${CLOUDINARY_BASE_URL}w_${width},h_${height},c_fill,f_auto,q_auto:best,dpr_auto/${publicId}`;
  };

  return (
    <section className="instagram-feed py-16 bg-gray-100">
      <h2 className="text-4xl font-extrabold text-center tracking-wide text-gray-900 mb-12">
        Follow Us On Instagram
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 container mx-auto px-4">
        {posts.map((post) => (
          <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer">
            <div className="instagram-post relative overflow-hidden rounded-lg shadow-lg group">
              <Image
                src={getCloudinaryUrl(post.public_id, 600, 600)} // Larger size for better quality
                alt={post.caption}
                width={600}
                height={600}
                className="transition-transform duration-500 transform object-cover group-hover:scale-110"
              />
              {/* Caption at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white py-4 text-center transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                <p className="text-sm font-medium">{post.caption}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default SocialBanner;
