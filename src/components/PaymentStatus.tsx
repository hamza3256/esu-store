"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PaymentStatusProps {
  orderEmail: string;
  orderId: string;
  isPaid: boolean;
  isCOD?: boolean;
}

const PaymentStatus = ({ orderEmail, orderId, isPaid, isCOD }: PaymentStatusProps) => {
  const { data } = trpc.payment.pollOrderStatus.useQuery(
    { orderId },
    {
      enabled: !isCOD && isPaid === false, // Disable polling if it's COD
      refetchInterval: (data) => (data?.isPaid ? false : 1000), // Poll every second until payment is confirmed
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (data?.isPaid && !isCOD) {
      router.refresh();
    }
  }, [data?.isPaid, router, isCOD]);

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Order Status:</p>
        <p
          className={`text-sm font-semibold ${
            isCOD
              ? "text-blue-600" // Status for COD
              : isPaid
              ? "text-green-600"
              : "text-yellow-500"
          }`}
        >
          {isCOD ? "Cash On Delivery" : isPaid ? "Payment successful" : "Pending payment"}
        </p>
      </div>
      {(isPaid || isCOD) && (
        <div>
          <p className="font-medium text-gray-900">Email has been sent to:</p>
          <p className="text-sm text-gray-700">{orderEmail}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
