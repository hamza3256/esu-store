"use client";

import { useState } from "react";
import { Check, Minus, Plus, Star, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/client";
import PageLoader from "@/components/PageLoader";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ImageSlider from "@/components/ImageSlider";
import { formatPrice, cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/config";
import ProductReel from "@/components/ProductReel";
import Link from "next/link";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@/payload-types";

interface PageProps {
  params: {
    productId: string;
  };
}

const BREADCRUMBS = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Products", href: "/products" },
];

const Page = ({ params }: PageProps) => {
  const { productId } = params;
  const [quantity, setQuantity] = useState(1);
  const { addItem, getItemCount } = useCart();

  const { data: product, isLoading, error } = trpc.getProductById.useQuery({
    id: productId,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !product) {
    return notFound();
  }

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

  const validUrls: string[] = product.images
    ?.map(({ image }) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean) as string[];

  // Store cart item count in a variable to avoid multiple calls to getItemCount
  const cartItemCount = getItemCount(product.id);

  const handleQuantityChange = (action: "increment" | "decrement") => {
    setQuantity((prev) => {
      if (action === "increment") {
        return Math.min(prev + 1, product.inventory);
      }
      return Math.max(prev - 1, 1);
    });
  };

  const handleAddToCart = () => {
    if (quantity <= product.inventory) {
      addItem(product, quantity);
      toast.success(`Added ${quantity} ${quantity > 1 ? "items" : "item"} to cart`);
    } else {
      toast.error(`Cannot add more than ${product.inventory} items`);
    }
  };

  return (
    <TooltipProvider>
      <MaxWidthWrapper className="bg-white">
        <div className="bg-white">
          {/* Product details */}
          <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-12 lg:px-8">
            <div className="lg:max-w-lg lg:self-end">
              <ol className="flex items-center space-x-2 text-xs sm:text-sm">
                {BREADCRUMBS.map((breadcrumb, i) => (
                  <li key={breadcrumb.href}>
                    <div className="flex items-center">
                      <Link
                        href={breadcrumb.href}
                        className="font-medium text-gray-500 hover:text-gray-900"
                      >
                        {breadcrumb.name}
                      </Link>
                      {i !== BREADCRUMBS.length - 1 ? (
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          className="ml-2 h-4 w-4 flex-shrink-0 text-gray-300"
                        >
                          <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {product.name}
                </h1>
              </div>

              <section className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg sm:text-xl font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                  <div className="ml-4 border-l text-gray-500 pl-4 text-sm sm:text-base">
                    {label}
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-1 sm:space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        star <= Math.round(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500">
                    ({product.numReviews} reviews)
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600 sm:text-base">
                    {product.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4 sm:h-5 sm:w-5 text-green-500"
                  />
                  <p className="ml-2 text-xs sm:text-sm text-gray-600">
                    Eligible for delivery
                  </p>
                </div>
              </section>
            </div>

            {/* Product images */}
            <div className="mt-8 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                <ImageSlider urls={validUrls} />
              </div>
            </div>

            {/* Add to cart section */}
            <div className="mt-8 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
              <div className="border-t pt-6 mt-6 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleQuantityChange("decrement")}
                          disabled={quantity <= 1}
                          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Decrease quantity</TooltipContent>
                    </Tooltip>

                    <Input
                      type="number"
                      min="1"
                      max={product.inventory as number}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-12 text-center text-sm sm:w-16 sm:text-base"
                    />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleQuantityChange("increment")}
                          disabled={quantity >= product.inventory}
                          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Increase quantity</TooltipContent>
                    </Tooltip>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    {product.inventory} available
                  </p>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.inventory === 0}
                      className="flex items-center justify-center w-full py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-200"
                    >
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="ml-2 sm:ml-3">
                        {product.inventory === 0
                          ? "Out of Stock"
                          : "Add to Bag"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {product.inventory === 0 ? "Out of stock" : "Add to bag"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky cart button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAddToCart}
              disabled={product.inventory === 0 || cartItemCount >= (product.inventory as number)}
              className="fixed bottom-4 right-4 z-50 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 focus:outline-none sm:hidden transition-transform hover:scale-105"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {product.inventory === 0 ? "Out of stock" : "Add to bag"}
          </TooltipContent>
        </Tooltip>

        {/* Product details tabs */}
        <div className="mt-12 lg:mt-20 lg:max-w-7xl lg:mx-auto lg:px-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-gray-600 text-sm sm:text-base">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="specifications" className="mt-4">
              <ul className="list-disc pl-4 sm:pl-5 text-gray-600 text-sm sm:text-base">
                <li>High-quality materials</li>
                <li>Adjustable height and tilt</li>
                <li>Breathable mesh back</li>
                <li>Padded armrests</li>
                <li>360-degree swivel</li>
              </ul>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <p className="text-gray-600 text-sm sm:text-base">
                No reviews yet.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar products */}
        <ProductReel
          href="/products"
          query={{ category: product.category, limit: 4 }}
          title={`Similar ${label}`}
          subtitle={`Browse similar ${label} like '${product.name}'`}
        />
      </MaxWidthWrapper>
    </TooltipProvider>
  );
};

export default Page;
