"use client";

import { useState, useEffect, useRef } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProductReel from "@/components/ProductReel";
import { buttonVariants } from "@/components/ui/button";
import { ArrowDownToLine, CheckCircle, Leaf, ShieldCheck, Gem, Truck, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SocialBanner from "@/components/SocialBanner"; // Import the updated SocialBanner

const perks = [
  {
    name: "Crafted with Precision",
    Icon: Gem,
    description: "Every piece of jewelry is meticulously crafted by skilled artisans.",
  },
  {
    name: "Nationwide Delivery",
    Icon: Truck,
    description: "We deliver anywhere in Pakistan, ensuring fast and secure delivery.",
  },
  {
    name: "Certified Quality",
    Icon: ShieldCheck,
    description: "All our jewelry is certified for authenticity and quality.",
  },
  {
    name: "Sustainable Luxury",
    Icon: Leaf,
    description: "Our jewelry is made with eco-friendly materials and processes.",
  },
];

export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  
  // Ref for the featured products section
  const featuredProductsRef = useRef<HTMLDivElement>(null);

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

  // Show the scroll indicator after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Function to scroll to the next section
  const scrollToNextSection = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
          <p>Your browser does not support the video tag.</p>
        </video>

        {/* Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 -z-10"></div>

        {/* Content Section */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white">
          <MaxWidthWrapper>
            <div className="py-16 mx-auto flex flex-col items-center max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
                Luxury <span className="text-gray-300">Jewelry</span> for Every Occasion.
              </h1>
              <p className="mt-4 text-lg max-w-prose text-gray-200">
                Welcome to <span className="font-bold">esü</span>. Discover timeless pieces,
                handcrafted with care, delivered to your doorstep across Pakistan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/products" className={buttonVariants({ variant: "default" })}>
                  Shop Now &rarr;
                </Link>
              </div>
            </div>
          </MaxWidthWrapper>

          {/* Scroll Down Indicator */}
          {showScrollIndicator && (
            <div className="absolute bottom-8 animate-bounce cursor-pointer" onClick={scrollToNextSection}>
              <ChevronDown className="h-6 w-6 ml-6 text-white" />
              <p className="text-sm text-white">Scroll Down</p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="bg-white py-10" ref={featuredProductsRef}>
        <MaxWidthWrapper>
          <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900">Featured Products</h2>
          <ProductReel title="Just Arrived" href="/products" query={{ sort: "desc", limit: 4 }} />
        </MaxWidthWrapper>
      </section>

      {/* Perks Section */}
      <section className="border border-gray-200 bg-gray-50 py-8">
        <MaxWidthWrapper>
          <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900">Why Choose Us?</h2>
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
            {perks.map((perk) => (
              <div
                key={perk.name}
                className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
              >
                <div className="md:flex-shrink-0 flex justify-center">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gold-100 text-gold-900">
                    <perk.Icon className="w-1/3 h-1/3 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 md:ml-4 md:mt-0 lg:ml-0 lg:mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">{perk.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Social Media Banner */}
      <SocialBanner />

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-10">
        <MaxWidthWrapper>
          <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Example testimonials */}
            <div className="bg-white p-6 shadow-md rounded-lg">
              <p className="text-gray-700 italic">
                "Absolutely stunning! The craftsmanship is incredible. I love how unique my piece is."
              </p>
              <div className="mt-4">
                <p className="font-bold text-gray-900">- Sarah A.</p>
                <p className="text-sm text-gray-600">Lahore, Pakistan</p>
              </div>
            </div>
            <div className="bg-white p-6 shadow-md rounded-lg">
              <p className="text-gray-700 italic">
                "Fast delivery and exceptional quality. Highly recommend!"
              </p>
              <div className="mt-4">
                <p className="font-bold text-gray-900">- Ahmed R.</p>
                <p className="text-sm text-gray-600">Karachi, Pakistan</p>
              </div>
            </div>
            <div className="bg-white p-6 shadow-md rounded-lg">
              <p className="text-gray-700 italic">
                "The perfect gift! I can't wait to buy more from this collection."
              </p>
              <div className="mt-4">
                <p className="font-bold text-gray-900">- Fatima K.</p>
                <p className="text-sm text-gray-600">Islamabad, Pakistan</p>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
