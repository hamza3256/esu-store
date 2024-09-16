"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";
import { Order } from "@/lib/types";

// Define the types for orders
type ProductItem = {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
};


const Page = () => {
  const [searchQuery, setSearchQuery] = useState<string>(""); // For search functionality
  const [filterRange, setFilterRange] = useState<string>("1_week"); // For filtering orders based on time range

  // Define the type for the orders query result
  const { data: orders, isLoading } = trpc.order.getOrders.useQuery<Order[]>({
    range: filterRange,
  });

  // Filter orders based on search query and selected date range
  const filteredOrders = orders?.filter((order) =>
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRangeChange = (range: string) => {
    setFilterRange(range);
  };

  // If orders are still loading, show the loader
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        My Orders
      </h1>

      {/* Search Box */}
      <div className="mt-4">
        <Input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full max-w-md p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-4 mt-4">
        <Button
          onClick={() => handleRangeChange("1_week")}
          className={filterRange === "1_week" ? "bg-blue-600 text-white" : ""}
        >
          Last Week
        </Button>
        <Button
          onClick={() => handleRangeChange("3_months")}
          className={filterRange === "3_months" ? "bg-blue-600 text-white" : ""}
        >
          Last 3 Months
        </Button>
        <Button
          onClick={() => handleRangeChange("6_months")}
          className={filterRange === "6_months" ? "bg-blue-600 text-white" : ""}
        >
          Last 6 Months
        </Button>
        <Button
          onClick={() => handleRangeChange("all")}
          className={filterRange === "all" ? "bg-blue-600 text-white" : ""}
        >
          All Time
        </Button>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="mt-8">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <li key={order.id} className="py-4 flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Order placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">Status: {order.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Total: {formatPrice(order.total)}
                  </p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-lg text-gray-600 mt-6">
          {searchQuery
            ? "No orders found for your search."
            : "You haven't placed any orders yet."}
        </p>
      )}
    </div>
  );
};

export default Page;
