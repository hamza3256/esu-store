"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import ProductListing from "@/components/ProductListing";

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.searchProducts.useQuery({
    query,
    limit: 12,
    page,
  });

  useEffect(() => {
    if (!query) {
      router.push("/"); // Redirect to home if no query is entered
    }
  }, [query, router]);

  const handleNextPage = () => {
    if (data?.totalPages && page < data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-12 w-12 text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>An error occurred while searching. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Search Results for <span className="text-blue-600">"{query}"</span>
          </h1>
          <p className="text-gray-500 mt-2">
            {data?.totalDocs ?? 0} products found
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data?.items.map((item: any) => (
            <Link key={item.id} href={`/product/${item.id}`}>
              <ProductListing index={item.id} product={item}/>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        {data?.totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={buttonVariants({
                className:
                  "bg-gray-200 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-300 transition disabled:opacity-50",
              })}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg text-gray-600">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === data.totalPages}
              className={buttonVariants({
                className:
                  "bg-gray-200 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-300 transition disabled:opacity-50",
              })}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
