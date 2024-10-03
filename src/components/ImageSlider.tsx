"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import type SwiperType from "swiper";
import { useEffect, useState } from "react";
import { Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ImageSliderProps {
  urls: string[];
  productId: string;
}

const ImageSlider = ({ urls, productId }: ImageSliderProps) => {
  const [swiper, setSwiper] = useState<null | SwiperType>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderConfig, setSlideConfig] = useState({
    isBeginning: true,
    isEnd: activeIndex === (urls.length ?? 0) - 1,
  });

  useEffect(() => {
    if (!swiper) return;

    const onSlideChange = ({ activeIndex }: { activeIndex: number }) => {
      setActiveIndex(activeIndex);
      setSlideConfig({
        isBeginning: activeIndex === 0,
        isEnd: activeIndex === (urls.length ?? 0) - 1,
      });
    };

    swiper.on("slideChange", onSlideChange);

    return () => {
      swiper.off("slideChange", onSlideChange);
    };
  }, [swiper, urls.length]);

  const activeStyles =
    "active:scale-[0.97] grid opacity-100 hover:scale-105 absolute top-1/2 -translate-y-1/2 aspect-square h-8 w-8 z-50 place-items-center rounded-full border-2 bg-white border-zinc-300";

  const inactiveStyles = "hidden text-gray-400";

  return (
    <div className="group relative bg-zinc-100 aspect-square overflow-hidden rounded-xl">
      <div className="absolute z-10 inset-0 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.preventDefault();
            swiper?.slideNext();
          }}
          className={cn(activeStyles, "right-3 transition", {
            [inactiveStyles]: sliderConfig.isEnd,
            "hover:bg-primary-300 text-primary-800 opacity-100":
              !sliderConfig.isEnd,
          })}
          aria-label="Next image"
        >
          <ChevronRight
            className="h-4 w-4 text-zinc-700"
            aria-label="next image"
          />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            swiper?.slidePrev();
          }}
          className={cn(activeStyles, "left-3 transition", {
            [inactiveStyles]: sliderConfig.isBeginning,
            "hover:bg-primary-300 text-primary-800 opacity-100":
              !sliderConfig.isBeginning,
          })}
          aria-label="Previous image"
        >
          <ChevronLeft
            className="h-4 w-4 text-zinc-700"
            aria-label="previous image"
          />
        </button>
      </div>
      <Swiper
        pagination={{
          clickable: true,
          renderBullet: (_, className) => {
            return `<span class="rounded-full transition ${className}"></span>`;
          },
          bulletClass: "swiper-pagination-bullet",
          bulletActiveClass: "swiper-pagination-bullet-active",
        }}
        onSwiper={(swiperInstance) => setSwiper(swiperInstance)}
        spaceBetween={50}
        slidesPerView={1}
        modules={[Pagination, Navigation]}
        className="h-full w-full"
        touchEventsTarget="container"
      >
        {urls.map((url, i) => {
          const isVideo = url.endsWith(".mp4") || url.endsWith(".webm"); // Check if it's a video
          return (
            <SwiperSlide key={i} className="-z-10 relative h-full w-full">
              <Link href={`/product/${productId}`} className="block" passHref>
                {isVideo ? (
                  <video
                    autoPlay
                    muted
                    loop
                    className="h-full w-full object-cover object-center"
                    style={{
                      objectFit: "cover", // Ensures the video fills the container
                      width: "100%",
                      height: "100%",
                      aspectRatio: "1 / 1", // Keeps the aspect ratio consistent
                    }}
                  >
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="eager"
                    className="-z-10 h-full w-full object-cover object-center"
                    src={url}
                    alt={`Product image ${i + 1}`}
                    priority={i === 0}
                  />
                )}
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
