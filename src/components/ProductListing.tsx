"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Product } from "@/payload-types";
import { cn, formatPrice } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/config";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ImageSlider from "@/components/ImageSlider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductListingProps {
  product: Product | null;
  index: number;
}

export default function ProductListing({ product, index }: ProductListingProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => clearTimeout(timer);
  }, [index]);

  if (!product || !isVisible) return <ProductPlaceholder />;

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

  const validUrls = product.images
    .map(({ image }) => (typeof image === "string" ? image : image.url))
    .filter(Boolean) as string[];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${quantity > 1 ? "items" : "item"} to cart`);
  };

  const handleQuantityChange = (action: "increment" | "decrement") => {
    setQuantity((prev) => {
      if (action === "increment") {
        return Math.min(prev + 1, product.inventory);
      }
      return Math.max(prev - 1, 1);
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "group w-full cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl relative bg-white",
          {
            "visible animate-in fade-in-5": isVisible,
          }
        )}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <ImageSlider urls={validUrls} />
          <Badge className="absolute top-2 left-2 z-10 text-xs bg-black text-white px-2 py-1 rounded-full">
            {label}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleFavorite}
                className={cn(
                  "absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors duration-300",
                  isFavorite
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-600 hover:text-gray-800"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className="w-5 h-5"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isFavorite ? "Remove from favorites" : "Add to favorites"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-6 lg:space-y-4 xl:space-y-4 md:space-y-2 sm:space-2">
          <div className="space-y-2">
            <Link href={`/product/${product.id}`} className="block">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 transition-colors duration-200">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 line-clamp-2 sm:hidden">{product.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn("xl:w-4 xl:h-4 lg:w-4 lg:h-4 sm:w-3 sm:h-3 md:h-3 md:w-3 h-3 w-3", {
                    "text-yellow-400 fill-yellow-400":
                      star <= Math.round(product.rating || 0),
                    "text-gray-300": star > Math.round(product.rating || 0),
                  })}
                />
              ))}
              <span className="ml-1 mr-2 text-sm text-gray-500">
                ({product.numReviews || 0})
              </span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center justify-between mt-4 space-x-2">
            <div className="flex items-center space-x-2 border border-gray-200 rounded-full">
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

              <span className="w-8 text-center font-medium text-gray-900">
                {quantity}
              </span>

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

            {/* Add to Bag Button for Mobile (without text) */}
            <Tooltip>
              <TooltipTrigger asChild>
              <Button
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
                className="flex-grow bg-black text-white hover:bg-gray-800 transition-colors duration-200"
              >
                <ShoppingBag className="lg:w-5 lg:h-5 xl:w-5 xl:h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 h-4 w-4" />
                <span className="hidden sm:inline ml-1 lg:ml-1">
                  {product.inventory === 0 ? "Out of Stock" : "Add to Bag"}
                </span>
              </Button>

              </TooltipTrigger>
              <TooltipContent>
                {product.inventory === 0 ? "Out of stock" : "Add to bag"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Inventory Status */}
          <p
            className={cn(
              "text-sm",
              product.inventory > 0
                ? product.inventory < 5
                  ? "text-orange-600"
                  : "text-green-600"
                : "text-red-600"
            )}
          >
            {product.inventory === 0
              ? "Out of stock"
              : product.inventory < 5
              ? `Only ${product.inventory} left in stock`
              : `${product.inventory} available`}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

function ProductPlaceholder() {
  return (
    <div className="flex flex-col w-full h-full rounded-xl overflow-hidden shadow-md bg-white">
      <div className="relative bg-gray-200 aspect-[3/4] w-full overflow-hidden flex-grow">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="w-3/4 h-6 rounded-lg" />
        <Skeleton className="w-full h-4 rounded-lg" />
        <div className="flex justify-between items-center">
          <Skeleton className="w-1/4 h-4 rounded-lg" />
          <Skeleton className="w-1/4 h-4 rounded-lg" />
        </div>
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
}
