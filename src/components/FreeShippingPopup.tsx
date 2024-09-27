"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from "@/components/ui/progress"
import { X, ShoppingBag, Truck } from 'lucide-react'
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

const FREE_SHIPPING_THRESHOLD = 2000 // Set your free shipping threshold here

export default function FreeShippingPopup() {
  const { items, cartTotal } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasItems = items.length > 0
    const isQualified = cartTotal() >= FREE_SHIPPING_THRESHOLD
    setIsVisible(hasItems && !isQualified)
  }, [items, cartTotal])

  const progress = Math.min((cartTotal() / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remainingAmount = FREE_SHIPPING_THRESHOLD - cartTotal()

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full z-50"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>
        <div className="flex items-center mb-3">
          <ShoppingBag className="text-primary mr-2" size={24} />
          <h3 className="text-lg font-semibold">Unlock Free Shipping!</h3>
        </div>
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          You&apos;re so close! Add just {formatPrice(remainingAmount)} more to your cart for FREE shipping.
        </p>
        <div className="flex items-center text-sm text-primary">
          <Truck size={16} className="mr-1" />
          <span>Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
        </div>
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-3"
        >
          <a
            href="/products"
            className="block w-full text-center bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors duration-200"
          >
            Shop Now & Save!
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}