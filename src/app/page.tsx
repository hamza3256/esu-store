"use client";

import { useState, useEffect, useRef } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProductReel from "@/components/ProductReel";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowDownToLine, CheckCircle, Leaf } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const perks = [
  {
    name: "Instant Delivery",
    Icon: ArrowDownToLine,
    description: "Next day delivery available to home or free to store.",
  },
  {
    name: "Guaranteed Quality",
    Icon: CheckCircle,
    description:
      "Every product on our platform is verified by our team to ensure our highest quality standards.",
  },
  {
    name: "For the Planet",
    Icon: Leaf,
    description:
      "We've pledged 1% of sales to the preservation and restoration of the natural environment.",
  },
];

export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentVideoRef = videoRef.current; // Save ref to a local variable

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && currentVideoRef) {
            currentVideoRef.play(); // Play the video when it comes into view
          } else if (currentVideoRef) {
            currentVideoRef.pause(); // Pause video when out of view to save resources
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
  }, []); // Empty dependency array to ensure this effect only runs once

  return (
    <>
      <div className="relative h-screen overflow-hidden -mt-16">
        {/* Fallback image until video is loaded */}
        {!videoLoaded && (
          <Image
            src="/background.png"
            alt="Loading video background"
            fill
            className="absolute top-0 left-0 w-full h-full object-cover -z-20"
            loading="lazy"
          />
        )}

        {/* Lazy load the video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover -z-20"
          preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
          playsInline
          poster="/background.png"
        >
          <source
            src="/desktop-morocco.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          <source
            src="/mobile-morocco.webm"
            type="video/webm"
            media="(max-width: 767px)"
          />
          {/* Fallback for browsers that don't support video formats */}
          <p>Your browser does not support the video tag.</p>
        </video>

        {/* Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 -z-10"></div>

        {/* Content Section */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white">
          <MaxWidthWrapper>
            <div className="py-20 mx-auto flex flex-col items-center max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Your marketplace for high-quality{" "}
                <span className="text-gray-800">products</span>.
              </h1>
              <p className="mt-6 text-lg max-w-prose">
                Welcome to <span className="font-bold">esü</span>. Every product
                on our platform is verified by our team to ensure our highest
                quality standards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/products" className={buttonVariants()}>
                  Browse Trending &rarr;
                </Link>
                {/* <Button variant="ghost">Our quality promise &rarr;</Button> */}
              </div>
            </div>
          </MaxWidthWrapper>
        </div>
      </div>

      {/* Perks Section */}
      <section className="border border-gray-200 bg-gray-50">
        <MaxWidthWrapper>
          <ProductReel
            title="Brand New"
            href="/products"
            query={{ sort: "desc", limit: 4 }}
          />
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {perks.map((perk) => (
              <div
                key={perk.name}
                className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
              >
                <div className="md:flex-shrink-0 flex justify-center">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-900">
                    <perk.Icon className="w-1/3 h-1/3" />
                  </div>
                </div>
                <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                  <h3 className="text-base font-medium text-gray-900">
                    {perk.name}
                  </h3>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
