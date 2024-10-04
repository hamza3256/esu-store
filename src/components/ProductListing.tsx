"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import { Media, Product } from "@/payload-types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "./ui/card";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";

interface ProductListingProps {
  product: Product | null;
  index: number;
  isMobile: boolean;
  isTablet: boolean;
}

export default function ProductListing({
  product,
  index,
  isMobile,
  isTablet,
}: ProductListingProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addItem } = useCart();



  const handlePrevImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  }, [product?.images]);

  const handleNextImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  }, [product?.images]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePrevImage,
    trackMouse: true,
  });

  const productUrl = `\product\\${product?.id}`

  const handleQuantityChange = useCallback(
    (action: "increment" | "decrement") => {
      setQuantity((prev) => {
        if (action === "increment") {
          return Math.min(prev + 1, product?.inventory ?? 1);
        }
        return Math.max(prev - 1, 1);
      });
    },
    [product?.inventory]
  );

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} ${
        quantity > 1 ? "items" : "item"
      } added to your cart`,
      className: "animate-toast-slide-in",
    });
  }, [addItem, product, quantity]);

  const toggleFavorite = useCallback(() => {
    if (!product) return;
    setIsFavorite((prev) => !prev);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${product.name} has been ${
        isFavorite ? "removed from" : "added to"
      } your favorites`,
    });
  }, [isFavorite, product?.name]);

  const displayPrice = product?.discountedPrice ?? product?.price ?? 0;
  const discount = product?.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100)
    : 0;

  const getImageUrl = useCallback(
    (image: string | Media): string => {
      if (typeof image === "string") return image;
      if (isMobile && image.sizes?.thumbnail?.url) return image.sizes.thumbnail.url;
      if (isTablet && image.sizes?.tablet?.url) return image.sizes.tablet.url;
      if (image.sizes?.card?.url) return image.sizes.card.url;
      return image.url || "";
    },
    [isMobile, isTablet]
  );

  const currentImage = product?.images?.[currentImageIndex]?.image;
  const imageUrl = useMemo(() => {
    if (!currentImage) return '';
    return getImageUrl(currentImage);
  }, [currentImage, isMobile, isTablet]);
  
  const isVideo =
    typeof currentImage !== "string" && currentImage?.resourceType === "video";

  if (!product) {
    return <ProductPlaceholder />;
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-sm mx-auto overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square" {...swipeHandlers}>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {isVideo ? (
              <video
                key={imageUrl}
                src={imageUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="rounded-t-lg object-cover"
                loading="lazy"
              />
            )}
          </motion.div>
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 mb-2 bg-white/80 text-gray-800"
          >
            {product.category}
          </Badge>
          <button
            onClick={toggleFavorite}
            className={cn(
              "absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors duration-300",
              isFavorite
                ? "text-red-500 hover:text-red-600"
                : "text-gray-600 hover:text-gray-800"
            )}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className="w-4 h-4"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>

          {/* Chevron Navigation */}
          {product.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-5 h-5 z-10"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-4 w-4 text-zinc-700" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-5 h-5 z-10"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4 text-zinc-700" />
              </Button>
            </>
          )}

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {product.images.map((_, index) => (product.images.length > 1 &&
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white/50"
                )}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-4">
          <Link href={productUrl}>
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 h-12 line-clamp-2">
              {product.name}
            </h2>
          </Link>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.round(product.rating)
                      ? "fill-yellow-400"
                      : "fill-gray-200"
                  )}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                ({product.numReviews})
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {discount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {discount}% OFF
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Quantity and Cart Button */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange("decrement")}
                disabled={quantity === 1 || product.inventory === 0}
                className="text-gray-600 hover:text-gray-800 px-2"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold mx-2 text-gray-800 w-8 text-center">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange("increment")}
                disabled={quantity === product.inventory || product.inventory === 0}
                className="text-gray-600 hover:text-gray-800 px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-300"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.inventory === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </motion.div>
          </div>
          {product.inventory > 0 && product.inventory <= 5 && (
            <p className="text-sm text-red-500 font-semibold">
              Only {product.inventory} left in stock!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductPlaceholder() {
  return (
    <Card className="w-full max-w-xs sm:max-w-sm mx-auto overflow-hidden bg-white shadow-md rounded-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="p-3 sm:p-4 space-y-3">
          <Skeleton className="w-3/4 h-6 rounded-md" />
          <div className="flex justify-between items-center">
            <Skeleton className="w-1/3 h-4 rounded-md" />
            <Skeleton className="w-1/4 h-6 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-1/3 h-10 rounded-md" />
            <Skeleton className="w-2/3 h-10 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
