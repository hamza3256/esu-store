import { PRODUCT_CATEGORIES } from "@/config";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/payload-types";
import { ImageIcon, X, Minus, Plus, Star } from "lucide-react";
import Image from "next/image";

const CartItem = ({ product, quantity }: { product: Product; quantity: number }) => {
  const { image } = product.images[0];
  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

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

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded">
            {typeof image !== "string" && image.url ? (
              <Image
                src={image.url}
                alt={product.name}
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
                {formatPrice(product.price)}
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
