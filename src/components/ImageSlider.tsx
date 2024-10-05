"use client";

import { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import type SwiperType from "swiper";
import { Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ImageSliderProps {
  items: { type: 'image' | 'video'; url: string }[];
  productId: string;
}

export default function ImageSlider({ items, productId }: ImageSliderProps) {
  const [swiper, setSwiper] = useState<null | SwiperType>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderConfig, setSlideConfig] = useState({
    isBeginning: true,
    isEnd: activeIndex === (items.length ?? 0) - 1,
  });

  useEffect(() => {
    if (!swiper) return;
    swiper.on("slideChange", ({ activeIndex }) => {
      setActiveIndex(activeIndex);
      setSlideConfig({
        isBeginning: activeIndex === 0,
        isEnd: activeIndex === (items.length ?? 0) - 1,
      });
    });
  }, [swiper, items.length]);

  const activeStyles = "active:scale-[0.97] grid opacity-100 hover:scale-105 absolute top-1/2 -translate-y-1/2 aspect-square h-8 w-8 z-50 place-items-center rounded-full bg-white shadow-md";
  const inactiveStyles = "hidden text-gray-400";

  const handlePrev = useCallback(() => swiper?.slidePrev(), [swiper]);
  const handleNext = useCallback(() => swiper?.slideNext(), [swiper]);

  return (
    <div className="group relative bg-zinc-100 aspect-square overflow-hidden rounded-xl">
      {/* Chevron Navigation */}
      <div className="absolute z-10 inset-0 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={handleNext}
          className={cn(activeStyles, "right-3 transition", {
            [inactiveStyles]: sliderConfig.isEnd,
            "hover:bg-primary-300 text-primary-800 opacity-100": !sliderConfig.isEnd,
          })}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4 text-zinc-700" />
        </button>
        <button
          onClick={handlePrev}
          className={cn(activeStyles, "left-3 transition", {
            [inactiveStyles]: sliderConfig.isBeginning,
            "hover:bg-primary-300 text-primary-800 opacity-100": !sliderConfig.isBeginning,
          })}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-700" />
        </button>
      </div>

      <Swiper
        pagination={{
          renderBullet: (_, className) => {
            return `<span class="rounded-full transition ${className}"></span>`;
          },
        }}
        onSwiper={setSwiper}
        spaceBetween={50}
        slidesPerView={1}
        modules={[Pagination, Navigation]}
        className="h-full w-full"
      >
        {items.map((item, i) => (
          <SwiperSlide key={i} className="-z-10 relative h-full w-full">
            <Link href={`/product/${productId}`} className="block h-full w-full" passHref>
              {item.type === 'image' ? (
                <Image
                  fill
                  loading="eager"
                  className="object-cover object-center"
                  src={item.url}
                  alt={`Product image ${i + 1}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <video
                  src={item.url}
                  className="object-cover object-center w-full h-full"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
