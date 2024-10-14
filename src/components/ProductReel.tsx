"use client";

import { TQueryValidator } from "@/lib/validators/query-validator";
import { Product } from "@/payload-types";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import ProductListing from "./ProductListing";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  query: TQueryValidator;
}

const FALLBACK_LIMIT = 4;

const ProductReel = (props: ProductReelProps) => {
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { title, subtitle, href, query } = props;

  const { data: queryResults, isLoading } =
    trpc.getInfiniteProducts.useInfiniteQuery(
      {
        limit: query.limit ?? FALLBACK_LIMIT,
        query,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextPage,
        onError: (error) => {
          console.error('Failed to fetch more products:', error);
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      }
    );

  const products = queryResults?.pages.flatMap((page) => page.items);

  let map: (Product | null)[] = [];

  if (products && products.length) {
    map = products;
  } else if (isLoading) {
    map = new Array<null>(query.limit ?? FALLBACK_LIMIT).fill(null);
  }

  return (
    <section className="sm:py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
        {/* Title and subtitle */}
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
              className="mt-4 sm:mt-0 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Shop the collection <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : null}
        </div>

        {/* Product grid */}
        <div className="relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {map.map((product, i) => (
              <ProductListing
                key={`product-${i}`}
                product={product}
                index={i}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductReel;
