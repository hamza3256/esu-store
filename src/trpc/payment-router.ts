import { z } from "zod";
import { privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";

// Function to generate a simple unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(); // Current timestamp in milliseconds
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
  return `${timestamp.slice(-6)}-${randomPart}`; // Use last 6 digits of timestamp + random number
};

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({
      productItems: z.array(z.object({ productId: z.string(), quantity: z.number() })),
      shippingAddress: z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productItems, shippingAddress } = input;

      console.log("Payment router");
      if (productItems.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const payload = await getPayloadClient();

      // Fetch the products
      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productItems.map((item) => item.productId),
          },
        },
      });

      const filteredProductsHavePrice = products.filter((product) => Boolean(product.priceId));

      const total = productItems.reduce((acc, item) => {
        const product = filteredProductsHavePrice.find((p) => p.id === item.productId);
        if (product) {
          return acc + product.price * item.quantity;
        }
        return acc;
      }, 0);


      // Generate unique order number
      const orderNumber = generateOrderNumber();

      // Create the order with productItems, shipping address, and orderNumber
      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          productItems: productItems.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
          })),
          user: user.id,
          shippingAddress, // Save shipping address from the cart page
          orderNumber, // Save the generated order number
          total,
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      productItems.forEach((item) => {
        const product = filteredProductsHavePrice.find(
          (p) => p.id === item.productId
        );
        if (product) {
          console.log("in product");
          console.log("price id: " + product.priceId);
          console.log("quantity: " + product.priceId);
          line_items.push({
            price: product.priceId!,
            quantity: item.quantity,
          });
        }
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ["card"],
          mode: "payment",
          metadata: {
            userId: user.id,
            orderId: order.id,
            orderNumber: orderNumber, // Pass the order number to Stripe metadata
          },
          line_items,
        });

        return { url: stripeSession.url };
      } catch (error) {
        console.log("Error creating stripe payment session:" + error);
        return { url: null };
      }
    }),

  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;
      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: { equals: orderId },
        },
      });

      if (orders.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const [order] = orders;
      return { isPaid: order._isPaid };
    }),
});
