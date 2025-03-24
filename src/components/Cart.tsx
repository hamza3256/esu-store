"use client";

import { ShoppingCartIcon, Loader2, TruckIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import CartItem from "./CartItem";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/config";

const Cart = ({
  isTransparent,
  isHovered,
}: {
  isTransparent: boolean;
  isHovered: boolean;
}) => {
  const { items, cartTotal } = useCart();
  const itemCount = items.length;
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();

  const progress = Math.min((cartTotal() / FREE_SHIPPING_THRESHOLD) * 100, 100);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (pathname === "/cart") {
      setIsLoading(false);
      setIsOpen(false);
    }
  }, [pathname, isLoading]);

  const handleCheckoutClick = () => {
    setIsLoading(true);
    router.push("/cart");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        onClick={() => setIsOpen(true)}
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
              <AnimatePresence>
                {progress < 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress to Free Shipping</span>
                      <span>{formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal())} away</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>
              {progress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center space-x-2 text-sm text-green-600"
                >
                  <TruckIcon className="h-5 w-5" />
                  <span>You&apos;ve qualified for free shipping!</span>
                </motion.div>
              )}
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="flex-1">Shipping</span>
                  <span>{progress >= 100 ? 'Free' : formatPrice(SHIPPING_FEE)}</span>
                </div>
                <div className="flex font-semibold">
                  <span className="flex-1">Total</span>
                  <span>{formatPrice(cartTotal() + (progress >= 100 ? 0 : SHIPPING_FEE))}</span>
                </div>
              </div>

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