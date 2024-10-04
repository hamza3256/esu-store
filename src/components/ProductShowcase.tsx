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
import { Pointer} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  query: TQueryValidator;
}

const FALLBACK_LIMIT = 4;

const ProductShowcase = (props: ProductReelProps) => {
  const { title, subtitle, href, query } = props;

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);

  const { data: queryResults, isLoading } =
    trpc.getInfiniteProducts.useInfiniteQuery(
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

  const handleSwipe = useCallback(() => {
    setShowSwipeIndicator(false);
    localStorage.setItem('hasSwipedProductReel', 'true');
  }, []);

  useEffect(() => {
    const hasSwipedBefore = localStorage.getItem('hasSwipedProductReel');
    if (hasSwipedBefore) {
      setShowSwipeIndicator(false);
    }
  }, []);

  return (
    <section className="sm:py-4">
      <div className="container px-4 sm:px-6 lg:px-8">
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
            <Carousel className="w-full overflow-hidden" onPointerLeave={handleSwipe}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {map.map((product, i) => (
                  product && (
                    <CarouselItem key={`product-${i}`} className="pl-2 md:pl-4 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
                      <div className="h-full">
                        <ProductListing
                          product={product}
                          index={i}
                          isMobile={isMobile}
                          isTablet={isTablet}
                        />
                      </div>
                    </CarouselItem>
                  )
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
              {showSwipeIndicator && isMobile && (
                <div className="absolute right-4 top-1/2   animate-swipe-indicator">
                  <Pointer className="w-6 h-6 text-muted-foreground animate-swipe-gesture" />
                </div>
              )}
            </Carousel>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {map.map((product, i) => (
                product && (
                  <ProductListing
                    key={`product-${i}`}
                    product={product}
                    index={i}
                    isMobile={isMobile}
                    isTablet={isTablet}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;