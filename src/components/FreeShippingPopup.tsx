"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { X, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

const POPUP_DELAY = 5500; 

export default function FreeShippingPopup() {
  const { items, cartTotal } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasItems = items.length > 0;
    const isQualified = cartTotal() >= FREE_SHIPPING_THRESHOLD;

    const timer = setTimeout(() => {
      setIsVisible(hasItems && !isQualified);
    }, POPUP_DELAY);

    // Cleanup the timer when the component unmounts or when `items`/`cartTotal` change
    return () => clearTimeout(timer);
  }, [items, cartTotal]);

  const progress = Math.min((cartTotal() / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingAmount = FREE_SHIPPING_THRESHOLD - cartTotal();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs w-full z-50"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close popup"
        >
          <X size={24} />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center mb-3 space-x-2">
          <ShoppingBag className="text-primary" size={28} />
          <h3 className="text-base font-semibold text-gray-900">
            Unlock Free Shipping!
          </h3>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mb-3 rounded-md bg-gray-200" />

        {/* Remaining Amount Text */}
        <p className="text-sm text-gray-700 mb-3 leading-tight">
          Add <span className="font-semibold">{formatPrice(remainingAmount)}</span> more for
          FREE shipping.
        </p>

        {/* Free Shipping Info */}
        <div className="flex items-center text-sm font-medium text-primary mb-3">
          <Truck size={20} className="mr-2" />
          <span>Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
        </div>

        {/* Shop Now Button */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-2"
        >
          <a
            href="/products"
            className="block w-full text-center bg-primary text-white py-3 rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors duration-300"
          >
            Shop Now & Save!
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
