"use client"

import { useState } from "react"
import { trpc } from "@/trpc/client"
import { formatPrice, formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { CalendarIcon, SearchIcon, PackageIcon, TruckIcon, CreditCardIcon } from "lucide-react"
import Image from "next/image"
import PageLoader from "@/components/PageLoader"
import { Media, Order, Product } from "@/payload-types"

const statusColors: { [key in NonNullable<Order['status']>]: string } = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-green-100 text-green-800",
  delivered: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

interface StatusType { 
  pending: string; 
  processing: string; 
  shipped: string; 
  delivered: string; 
  cancelled: string; 
}

interface ProductItem {
  product: string | Product;
  quantity: number;
  id?: string | null;
};

const getThumbnailUrl = (product: Product): string => {
  const imageCheck = product.images.find(({ image } : {image: Media | string}) => {
    return typeof image === "object" && (image.resourceType?.startsWith("image") || image.mimeType?.startsWith("image"));
  })?.image
  
  const firstImage = imageCheck as Media
  if (firstImage?.sizes?.thumbnail?.url) {
    return firstImage.sizes.thumbnail.url
  }
  if (firstImage?.sizes?.card?.url) {
    return firstImage.sizes.card.url
  }
  if (firstImage?.url) {
    return firstImage.url
  }
  return '/placeholder.svg'
}

export default function OrderViewer() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterRange, setFilterRange] = useState<string>("1_week")
  const [selectedTab, setSelectedTab] = useState<string>("all")

  const { data: orders, isLoading } = trpc.order.getOrders.useQuery({
    range: filterRange,
  })

  const filteredOrders = orders?.filter((order: any) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedTab === "all" || order.status === selectedTab)
  ) || []

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  if (isLoading) {
    return (
      <PageLoader />
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-8"
      >
        Your Orders
      </motion.h1>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by Order ID"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search orders"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
            </div>
            <Select value={filterRange} onValueChange={setFilterRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1_week">Last Week</SelectItem>
                <SelectItem value="3_months">Last 3 Months</SelectItem>
                <SelectItem value="6_months">Last 6 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-6 rounded-xl bg-gray-200 p-1">
          <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg">Pending</TabsTrigger>
          <TabsTrigger value="processing" className="rounded-lg">Processing</TabsTrigger>
          <TabsTrigger value="shipped" className="rounded-lg">Shipped</TabsTrigger>
          <TabsTrigger value="delivered" className="rounded-lg">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence>
        {filteredOrders.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {filteredOrders.map((order: any) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Order #{(order.orderNumber as string)}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          {formatDate((order.createdAt as string))}
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof StatusType || 'pending']}`}>
                          {order.status || 'Pending'}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                        <Link
                          href={`/order-confirmation?orderId=${order.id}`}
                          className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                        >
                          <PackageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          View Details
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
                        <span>{order._isPaid ? 'Paid' : 'Payment Pending'}</span>
                      </div>
                      {order.trackingInfo?.trackingNumber && (
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
                          <a
                            href={`https://www.trackingmore.com/track/en/${order.trackingInfo.trackingNumber}?express=postex`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Track Order
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">Order Items:</h4>
                      <ul className="divide-y divide-gray-200">
                        {order.productItems.map(({item, index} : {item: ProductItem, index: number}) => {
                          const product = typeof item.product === 'string' ? { name: 'Unknown Product', price: 0, images: [] } : item.product;
                          return (
                            <li key={index} className="py-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <Image
                                  src={getThumbnailUrl(product as Product)}
                                  alt={product.name}
                                  width={50}
                                  height={50}
                                  className="mr-4 rounded-md"
                                />
                                <span>{product.name} (x{item.quantity})</span>
                              </div>
                              <span>{formatPrice(product.price * item.quantity)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold mb-2">Shipping Address:</h4>
                      <p>
                        {order.shippingAddress.line1}
                        {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl text-gray-600 mt-6 text-center"
          >
            {searchQuery
              ? "No orders found for your search."
              : "You haven't placed any orders yet."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}