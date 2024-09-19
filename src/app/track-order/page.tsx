"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";

const TrackOrderPage = () => {
  const [email, setEmail] = useState<string>("");
  const [orderSuffix, setOrderSuffix] = useState<string>(""); // To capture user input after "ESU-"
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { refetch: trackOrder } = trpc.order.trackOrder.useQuery(
    { email, orderNumber: `ESU-${orderSuffix}` },
    {
      enabled: false, // Don't run the query on mount, we'll trigger it manually
      onSuccess: (data) => {
        setOrderStatus(`Status: ${data.status}`);
        setIsLoading(false);
      },
      onError: () => {
        setError("Order not found or invalid details.");
        setIsLoading(false);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !orderSuffix) {
      setError("Please enter both email and order number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOrderStatus(null);

    // Manually trigger the query
    trackOrder();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-100">
      <div className="max-w-lg w-full mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Track Your Order
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your email address and order number to track your order status.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-3 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
              Order Number
            </label>
            <div className="flex items-center mt-1">
              <span className="px-3 py-3 border border-gray-300 bg-gray-50 rounded-l-md">
                ESU-
              </span>
              <Input
                id="orderSuffix"
                type="text"
                placeholder="Enter the rest of your order number"
                value={orderSuffix}
                onChange={(e) => setOrderSuffix(e.target.value)}
                className="p-3 border border-gray-300 rounded-r-md w-full"
                required
              />
            </div>
          </div>
          <div className="pt-6">
            <Button type="submit" className="w-full p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Track Order"
              )}
            </Button>
          </div>
        </form>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        {orderStatus && <p className="mt-4 text-center text-green-600 font-semibold">{orderStatus}</p>}
      </div>
    </div>
  );
};

export default TrackOrderPage;
