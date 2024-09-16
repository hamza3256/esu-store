"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";
import { Order } from "@/lib/types";

const OrderDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();

  // Add type information for the `order`
  const { data: order, isLoading, isError } = trpc.order.getOrderById.useQuery<Order>({
    id: params.id,
  });

  useEffect(() => {
    if (isError) {
      router.push("/orders");
    }
  }, [isError, router]);

  // Handle loading state
  if (isLoading || !order) {
    return <PageLoader />;
  }

  // Render the order details once `order` is defined
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Order #{order.orderNumber}
      </h1>
      <p className="text-sm text-gray-500">
        Placed on {new Date(order.createdAt).toLocaleDateString()}
      </p>
      <p className="mt-2 text-lg text-gray-700">Status: {order.status}</p>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Items in this order</h2>
        <ul role="list" className="divide-y divide-gray-200 mt-4">
          {order.productItems.map((item) => (
            <li key={item.product.id} className="py-4 flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(item.product.price)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
        <div className="mt-2 text-sm text-gray-700">
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state},{" "}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      </div>

      <Link href="/orders" className="mt-8 inline-block text-blue-500 hover:text-blue-700">
        Back to Orders
      </Link>
    </div>
  );
};

export default OrderDetailPage;
