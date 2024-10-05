"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PaymentStatusProps {
  orderEmail: string;
  orderId: string;
  isPaid: boolean;
}

const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
  const { data } = trpc.payment.pollOrderStatus.useQuery(
    { orderId },
    {
      enabled: isPaid === false,
      refetchInterval: (data) => (data?.isPaid ? false : 1000),
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (data?.isPaid) {
      router.refresh();
    }
  }, [data?.isPaid, router]);

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Order Status:</p>
        <p
          className={`text-sm font-semibold ${
            isPaid ? "text-green-600" : "text-yellow-500"
          }`}
        >
          {isPaid ? "Payment successful" : "Pending payment"}
        </p>
      </div>
      {isPaid && (
        <div>
          <p className="font-medium text-gray-900">Email has been sent to:</p>
          <p className="text-sm text-gray-700">{orderEmail}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
