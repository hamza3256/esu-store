"use client";

import { ShoppingCartIcon, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { ScrollArea } from "./ui/scroll-area";
import CartItem from "./CartItem";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const Cart = ({
  isTransparent,
  isHovered,
}: {
  isTransparent: boolean;
  isHovered: boolean;
}) => {
  const { items, cartTotal } = useCart();
  const itemCount = items.length;
  const shippingFee = 1;
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset the loading state after navigation and close the cart
  useEffect(() => {
    if (pathname === "/cart") {
      setIsLoading(false);
      setIsOpen(false); // Close the cart after navigation
    }
  }, [pathname, isLoading]);

  const handleCheckoutClick = () => {
    setIsLoading(true);
    router.push("/cart"); // Manually navigate to cart
    setIsOpen(false); // Close the cart sheet only after navigating
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        onClick={() => setIsOpen(true)} // Open the cart when clicked
        className="group relative -m-2 flex items-center p-2"
      >
        <ShoppingCartIcon
          aria-hidden="true"
          className={cn(
            "h-6 w-6 flex-shrink-0 group-hover:text-gray-400",
            `${isTransparent && !isHovered ? "text-gray-400" : "text-gray-600"}`
          )}
        />
        {isMounted && itemCount > 0 && (
          <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-gray-700 px-1.5 py-0.8 text-xs font-medium text-white">
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {itemCount > 0 ? (
          <>
            <div className="flex w-full flex-col pr-6">
              <ScrollArea>
                {items.map(({ product, quantity }) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    quantity={quantity}
                  />
                ))}
              </ScrollArea>
            </div>

            <div className="space-y-4 pr-6">
              <Separator />
              <div className="space-t-1.5 pr-6">
                <div className="flex">
                  <span className="flex-1">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex">
                  <span className="flex-1">Transaction Fee</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex">
                  <span className="flex-1">Total</span>
                  <span>{formatPrice(cartTotal() + shippingFee)}</span>
                </div>
              </div>

              <div>
                <SheetFooter>
                  <button
                    className={buttonVariants({ className: "w-full" })}
                    onClick={handleCheckoutClick}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-1.5" />
                    ) : (
                      "Continue to checkout"
                    )}
                  </button>
                </SheetFooter>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-1">
            <div
              aria-hidden="true"
              className="relative mb-4 h-60 w-60 text-muted-foreground"
            >
              <Image
                src="/bear_empty_cart.png"
                fill
                alt="empty shopping cart bear"
              />
            </div>
            <div className="text-xl font-semibold">Your cart is empty</div>
            <SheetTrigger asChild>
              <Link
                href="/products"
                className={buttonVariants({
                  variant: "link",
                  size: "sm",
                  className: "text-sm text-muted-foreground",
                })}
              >
                Add items to your cart to checkout
              </Link>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
