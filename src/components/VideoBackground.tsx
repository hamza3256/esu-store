"use client";

import { useEffect, useRef, useState } from "react";

export const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrlDesktop = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best/f_auto,dpr_auto,w_1920/desktop.webm`;
  const videoUrlMobile = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:low/f_auto,dpr_auto,w_768/mobile.webm`;

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && currentVideoRef) {
            currentVideoRef.play();
          } else if (currentVideoRef) {
            currentVideoRef.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      className="absolute top-0 left-0 w-full h-full object-cover -z-20"
      preload="auto"
      playsInline
      poster="/background.png"
    >
      <source src={videoUrlDesktop} type="video/webm" media="(min-width: 768px)" />
      <source src={videoUrlMobile} type="video/webm" media="(max-width: 767px)" />
      Your browser does not support the video tag.
    </video>
  );
};
