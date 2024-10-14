"use client"

import { useState, useCallback } from "react"
import { Heart, ShoppingCart, Minus, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@/payload-types"
import { cn, formatPrice } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import ImageSlider from "./ImageSlider"
import { Badge } from "@/components/ui/badge"

interface ProductListingProps {
  product: Product | null
}

export default function ProductListing({ product }: ProductListingProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAddToCart = useCallback(() => {
    if (!product) return
    addItem(product, quantity)
    setQuantity(1) // Reset quantity after adding to cart
  }, [addItem, product, quantity])

  const handleQuantityChange = useCallback((action: "increment" | "decrement") => {
    setQuantity((prev) => {
      if (action === "increment") {
        return Math.min(prev + 1, product?.inventory ?? 1)
      }
      return Math.max(prev - 1, 1)
    })
  }, [product?.inventory])

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev)
  }, [])

  if (!product) {
    return <ProductPlaceholder />
  }

  const validUrls = product.images
    ?.map(({ image }) => {
      if (typeof image === "object" && image?.url) {
        return { 
          type: image.resourceType === "video" ? 'video' : 'image', 
          url: image.resourceType === "video" ? image.sizes?.video?.url : image.sizes?.card?.url 
        }
      }
      return null
    })
    .filter(Boolean) as { type: 'image' | 'video'; url: string }[]

  return (
    <div className="w-full max-w-sm mx-auto bg-white">
      <div className="relative">
        <ImageSlider items={validUrls} productId={product.id} />
        {product.discountedPrice && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 z-10">
            {Math.round((1 - product.discountedPrice / product.price) * 100)}% OFF
          </Badge>
        )}
        {/* <button 
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
        >
          <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 text-red-500" : "text-gray-400")} />
        </button> */}
      </div>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h2 className="text-lg font-medium text-gray-900 mb-2 line-clamp-1">{product.name}</h2>
        </Link>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.discountedPrice ?? product.price)}
          </span>
          {product.discountedPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-300"
            onClick={handleAddToCart}
            disabled={product.inventory === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.inventory === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductPlaceholder() {
  return (
    <div className="w-full max-w-sm mx-auto bg-gray-100 animate-pulse">
      <div className="aspect-square w-full bg-gray-200" />
      <div className="p-4 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  )
}