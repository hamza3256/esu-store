"use client";

import { Product } from "@/payload-types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import ImageSlider from "./ImageSlider";
import { useCart } from "@/hooks/use-cart";

interface ProductListingProps {
  product: Product | null;
  index: number;
}

const ProductListing = ({ product, index }: ProductListingProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart(); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => clearTimeout(timer);
  }, [index]);

  if (!product || !isVisible) return <ProductPlaceHolder />;

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

  const validUrls = product.images
    .map(({ image }) => (typeof image === "string" ? image : image.url))
    .filter(Boolean) as string[];

    const handleAddToCart = () => {
      addItem(product, quantity);
      toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`);
    };

  const handleQuantityChange = (action: "increment" | "decrement") => {
    setQuantity((prev) => {
      if (action === "increment") {
        return Math.min(prev + 1, product.inventory); // Max quantity is based on product inventory
      }
      return Math.max(prev - 1, 1); // Minimum is 1
    });
  };

  return (
    <div
      className={cn(
        "group h-full w-full cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl relative",
        {
          "visible animate-in fade-in-5": isVisible,
        }
      )}
    >
      {/* Image with "Add to Cart" Icon on Hover */}
      <div className="relative aspect-square overflow-hidden">
        <ImageSlider urls={validUrls} />
        {/* "Add to Cart" Icon */}
        <Badge className="absolute top-2 left-2 z-10">{label}</Badge>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 z-10 hover:text-red transition-opacity duration-300"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Product Info Below the Image */}
      <div className="p-4 bg-white space-y-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn("w-4 h-4", {
                  "text-yellow-400 fill-yellow-400":
                    star <= Math.round(product.rating || 0),
                  "text-gray-300": star > Math.round(product.rating || 0),
                })}
              />
            ))}
            <span className="ml-2 text-sm text-gray-500">
              ({product.numReviews || 0})
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Compact Quantity Selector */}
        <div className="flex items-center justify-between mt-4 space-x-2">
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleQuantityChange("decrement")}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium text-gray-900">
              {quantity}
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleQuantityChange("increment")}
              disabled={quantity >= product.inventory}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={product.inventory === 0}
            className="flex-grow"
          >
            {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>

        {/* Inventory Status */}
        <p
          className={cn("text-sm mt-2", product.inventory > 0 ? "text-green-600" : "text-red-600")}
        >
          {product.inventory > 0 ? `${product.inventory} available` : `Out of stock`}
        </p>
      </div>
    </div>
  );
};

const ProductPlaceHolder = () => {
  return (
    <div className="flex flex-col w-full h-full rounded-xl overflow-hidden shadow-md bg-white/10 backdrop-blur-md">
      <div className="relative bg-zinc-100 aspect-square w-full overflow-hidden flex-grow">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4">
        <Skeleton className="w-2/3 h-6 rounded-lg mb-2" />
        <Skeleton className="w-full h-4 rounded-lg mb-2" />
        <Skeleton className="w-1/4 h-4 rounded-lg mb-3" />
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
};

export default ProductListing;
