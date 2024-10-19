"use client";

import { TQueryValidator } from "@/lib/validators/query-validator";
import { Product } from "@/payload-types";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import ProductListing from "./ProductListing";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useEffect, useCallback, useRef } from "react";

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  query: TQueryValidator;
}

const FALLBACK_LIMIT = 6;
const INTERVAL = 5000; 

const ProductShowcase = (props: ProductReelProps) => {
  const { title, subtitle, href, query } = props;

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");

  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const { data: queryResults, isLoading } = trpc.getInfiniteProducts.useInfiniteQuery(
    {
      limit: query.limit ?? FALLBACK_LIMIT,
      query,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );

  const products = queryResults?.pages.flatMap((page) => page.items);

  let map: (Product | null)[] = [];

  if (products && products.length) {
    map = products;
  } else if (isLoading) {
    map = new Array<null>(query.limit ?? FALLBACK_LIMIT).fill(null);
  }

  // Looping and current slide logic
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(0); // Ensure current is set to the first slide.

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0); // Reset progress whenever a new slide is selected.
    });
  }, [api]);

  // Auto-scroll logic, loops back to the first slide when reaching the end
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      if (current === count - 1) {
        api?.scrollTo(0); // Scroll back to the first slide.
      } else {
        api?.scrollNext(); // Move to the next slide.
      }
      setProgress(0); // Reset progress on every slide change.
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [api, current, count, autoPlay]);

  // Progress bar logic
  useEffect(() => {
    const progressTimer = setInterval(() => {
      if (autoPlay) {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + (100 / (INTERVAL / 100));
          return newProgress >= 100 ? 100 : newProgress;
        });
      }
    }, 100); // Increment progress more frequently.

    return () => clearInterval(progressTimer);
  }, [autoPlay]);

  // Pause autoplay when the carousel is not in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAutoPlay(true);
        } else {
          setAutoPlay(false);
        }
      },
      {
        threshold: 0.5, // 50% of the carousel should be visible to trigger autoplay
      }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, [carouselRef]);

  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  
  return (
    <section className="sm:py-4">
      <div className="container px-4 sm:px-6 lg:px-8" ref={carouselRef}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="max-w-2xl">
            {title ? (
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          {href ? (
            <Link
              href={href}
              className="mt-4 sm:mt-0 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors duration-200"
            >
              Shop the collection <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : null}
        </div>

        <div className="relative">
          {isMobile ? (
            <div>
              <Carousel
                className="w-full overflow-hidden"
                setApi={setApi}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {map.map(
                    (product, i) =>
                      product && (
                        <CarouselItem
                          key={`product-${i}`}
                          className="pl-2 md:pl-4 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
                        >
                          <div
                            className="h-full"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          >
                            <ProductListing
                              product={product}
                              index={i}
                              isMobile={isMobile}
                              isTablet={isTablet}
                            />
                          </div>
                        </CarouselItem>
                      )
                  )}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>

              {/* Progress Bar and Slide Indicator */}
              <div className="mt-6 relative">
                <div className="flex justify-between mb-2">
                  {map.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 mx-0.5 rounded-full overflow-hidden ${
                        index === current ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      {index === current && (
                        <div
                          className="h-full bg-primary-foreground transition-all duration-100 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {map.map(
                (product, i) =>
                  product && (
                    <ProductListing
                      key={`product-${i}`}
                      product={product}
                      index={i}
                      isMobile={isMobile}
                      isTablet={isTablet}
                    />
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;