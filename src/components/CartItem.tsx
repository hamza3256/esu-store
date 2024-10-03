import { PRODUCT_CATEGORIES } from "@/config";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Media, Product } from "@/payload-types";
import { ImageIcon, X, Minus, Plus, Star } from "lucide-react";
import Image from "next/image";

const CartItem = ({ product, quantity }: { product: Product; quantity: number }) => {
  const { removeItem, updateQuantity } = useCart();

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.inventory) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  // Use discounted price if available, otherwise use the original price
  const price = product.discountedPrice ?? product.price;

  // Find the first image from the product.images that is actually an image (filter out videos)
  const image = product.images.find(({ image }) => {
    return typeof image === "object" && image.mimeType?.startsWith("image/");
  })?.image as Media;

  const label = PRODUCT_CATEGORIES.find(({ value }) => value === product.category)?.label;

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded">
            {/* Display the image only if it's valid, otherwise show the fallback */}
            {image && image.url ? (
              <Image
                src={image.url as string}
                alt={`${product.name} image`}
                fill
                className="absolute object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-secondary">
                <ImageIcon aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex flex-col self-start">
            <span className="line-clamp-1 text-sm font-medium mb-1">
              {product.name}
            </span>
            <span className="line-clamp-1 text-xs capitalize text-muted-foreground">
              {label}
            </span>

            <div className="mt-1 flex items-center">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="ml-1 text-xs text-gray-500">
                {product.rating} ({product.numReviews} reviews)
              </span>
            </div>

            {/* Quantity controls */}
            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={handleDecrement}
                className="flex items-center justify-center w-5 h-5 border rounded-md text-gray-500"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="flex items-center justify-center w-5 h-5 border rounded-md text-gray-500"
                disabled={quantity >= product.inventory}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              <button
                onClick={() => removeItem(product.id)}
                className="flex items-center gap-0.5"
              >
                <X className="w-3 h-4" /> Remove
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1 font-medium">
          <div className="ml-auto line-clamp-1 text-sm">
            {/* Display original price if there's a discount */}
            {product.discountedPrice && (
              <span className="line-through text-gray-500 mr-2">
                {formatPrice(product.price * quantity)}
              </span>
            )}
            {formatPrice(price * quantity)} {/* Total for the item */}
          </div>
          <span className="text-xs text-gray-500">
            {product.inventory > 0
              ? `In stock: ${product.inventory}`
              : "Out of stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
