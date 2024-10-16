'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatRupees } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/config'

const bannerMessages = [
  `Free delivery on orders over ${formatRupees(FREE_SHIPPING_THRESHOLD)}`,
  "Pink October Sale: Up to 30% off selected items",
  "New arrivals every week",
  "Delivering all over Pakistan"
]

export default function TopBanner() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % bannerMessages.length)
    }, 7000) 

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-black text-white py-2 relative">
      <div className="flex items-center justify-center h-5">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-light tracking-wide uppercase text-center"
          >
            {bannerMessages[currentMessageIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}