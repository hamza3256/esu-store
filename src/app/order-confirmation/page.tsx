import Image from "next/image";
import { cookies } from "next/headers";
import { getServerSideUser } from "@/lib/payload-utils";
import { notFound, redirect } from "next/navigation";
import { Media, Product, User } from "@/payload-types";
import { PRODUCT_CATEGORIES } from "@/config";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import PaymentStatus from "@/components/PaymentStatus";
import { Order } from "@/lib/types";
import { getPayloadClient } from "@/get-payload";
import { generateInvoice } from "@/lib/invoice";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/config";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface OrderProduct {
  product: Product;
  quantity: number;
}

const OrderConfirmationPage = async ({ searchParams }: PageProps) => {
  const orderId = searchParams.orderId as string;
  const guestEmail = searchParams.guestEmail as string;
  const nextCookies = cookies();

  const { user } = await getServerSideUser(nextCookies);
  const payload = await getPayloadClient();

  // Fetch order details by order ID
  const { docs: orders } = await payload.find({
    collection: "orders",
    depth: 2,
    where: {
      id: {
        equals: orderId,
      },
    },
  });

  const [order] = orders as Order[];
  if (!order) return notFound();

  // const orderUserId = typeof order.user === "string" ? order.user : (order.user as User)?.id;
  
  // If no logged-in user, validate the guest email
  if (!user && (!guestEmail || guestEmail !== order.email)) {
    return redirect(`/sign-in?origin=order-confirmation?orderId=${order.id}`);
  }

  const isPaid = Boolean(order._isPaid);
  const products = order.productItems as OrderProduct[];

  const orderTotal = products.reduce(
    (total, { product, quantity }) => total + (product.discountedPrice ?? product.price) * quantity,
    0
  );

  const total = orderTotal >= FREE_SHIPPING_THRESHOLD ? orderTotal : orderTotal + SHIPPING_FEE;

  // Structured Address Display
  const shippingAddress = order.shippingAddress || {
    line1: "N/A",
    line2: "",
    city: "N/A",
    state: "",
    postalCode: "",
    country: "N/A",
  };

  const formattedAddress = [
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  const orderStatus = order.status || "Processing";

  let invoiceDownloadLink: string | null = null;
  if (isPaid) {
    try {
      const pdfBytes = await generateInvoice(order.id, `${process.env.NEXT_PUBLIC_SERVER_URL}/esu-transparent.png`); // Adjust the logo path accordingly

      invoiceDownloadLink = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`;
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  }

  // PostEx order tracking details
  const postexOrderCreated = order._isPostexOrderCreated;
  const postexTrackingNumber = order?.trackingInfo?.trackingNumber;
  const postexOrderStatus = order?.trackingInfo?.orderStatus;
  const postexOrderDate = order?.trackingInfo?.orderDate;

  return (
    <main className="relative lg:min-h-full bg-gray-50">
      <div className="hidden lg:block h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          fill
          src="https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227919/order-confirmation.jpg"
          alt="Thank you for your order"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <p className="text-sm font-medium text-gray-600">Order successful</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Thank you for shopping
            </h1>

            {isPaid ? (
              <p className="mt-2 text-base text-gray-600">
                Your order was successfully processed. We&apos;ve sent your receipt and order details to{" "}
                <span className="font-medium text-gray-900">
                  {order.email || (order.user as User)?.email}
                </span>
                .
              </p>
            ) : (
              <p className="mt-2 text-base text-gray-600">
                We&apos;re currently processing your order. We&apos;ll send you a confirmation email shortly.
              </p>
            )}

            {/* Order Status and Shipping Address */}
            <div className="mt-8">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
                <span
                  className={`px-3 py-1 inline-block text-sm font-medium rounded-lg ${
                    orderStatus === "delivered"
                      ? "bg-green-100 text-green-800"
                      : orderStatus === "shipped"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {orderStatus}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                <p className="text-sm text-gray-600">{formattedAddress}</p>
              </div>

              {/* PostEx Tracking Information */}
              {postexOrderCreated && postexTrackingNumber && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Tracking Information</h3>
                  <p className="text-sm text-gray-600">
                    <span>Tracking Number: </span>
                    <span className="font-medium">{postexTrackingNumber}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span>Order Status: </span>
                    <span className="font-medium">{postexOrderStatus}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span>Order Date: </span>
                    <span className="font-medium">{postexOrderDate}</span>
                  </p>
                  <p className="mt-2">
                    <a
                      href={`https://www.trackingmore.com/track/en/${postexTrackingNumber}?express=postex`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Track your order &rarr;
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-16 text-sm font-medium">
              <div className="text-gray-500">Order no.</div>
              <div className="mt-2 text-gray-900">{order.orderNumber}</div>

              {/* Product List */}
              <ul className="mt-6 divide-y divide-gray-200 border-t text-sm font-medium text-gray-600">
                {products.map(({ product, quantity }) => {
                  const label = PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label;
                  
                  const firstImage = product.images.find(({ image } : {image: Media | string}) => {
                    return typeof image === "object" && (image.resourceType?.startsWith("image") || image.mimeType?.startsWith("image"));
                  })?.image
                
                  const imageUrl = (firstImage as Media).sizes?.thumbnail?.url

                  return (
                    <li key={product.id} className="flex space-x-6 py-6">
                      <div className="relative h-24 w-24">
                        {imageUrl ? (
                          <Image
                            fill
                            src={imageUrl}
                            alt={`${product.name} image`}
                            className="flex-none rounded-md bg-gray-100 object-cover object-center"
                          />
                        ) : (
                          <div>No Image Available</div>
                        )}
                      </div>

                      <div className="flex-auto flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="text-gray-900">{product.name || "Unknown Product"}</h3>
                          <p className="my-1">Category: {label || "Unknown"}</p>
                          <p className="text-sm text-gray-500">Quantity: {quantity || 1}</p>
                        </div>

                        {isPaid && invoiceDownloadLink ? (
                          <a
                            href={invoiceDownloadLink}
                            download={`invoice_${order.orderNumber}.pdf`}
                            className="text-blue-600 hover:underline"
                          >
                            Download Invoice
                          </a>
                        ) : null}
                      </div>

                      <p className="flex-none font-medium text-gray-900">
                        {formatPrice((product.discountedPrice ?? product.price) * quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              {/* Pricing Summary */}
              <div className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className="text-gray-900">{formatPrice(orderTotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Shipping Fee</p>
                  {total >= FREE_SHIPPING_THRESHOLD ? 
                  (<p className="text-gray-900 text-green-600">FREE</p>) 
                  : (<p className="text-gray-900">{formatPrice(SHIPPING_FEE)}</p>)}
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <p className="text-base">Total</p>
                  <p className="text-base">{formatPrice(total)}</p>
                </div>
              </div>

              <PaymentStatus
                isPaid={isPaid}
                orderEmail={order.email || (order.user as User)?.email}
                orderId={order.id.toString()}
              />

              <div className="mt-16 border-t border-gray-200 text-right py-6">
                <Link href="/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Continue shopping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;
