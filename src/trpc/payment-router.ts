import { z } from "zod";
import { privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productItems: z.array(z.object({ productId: z.string(), quantity: z.number() })) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productItems } = input;

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

      const filteredProductsHavePrice = products.filter((product) =>
        Boolean(product.priceId)
      );

      // Create the order with productItems
      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          productItems: productItems.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
          })),
          user: user.id,
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      // Prepare Stripe line items
      productItems.forEach((item) => {
        const product = filteredProductsHavePrice.find(
          (p) => p.id === item.productId
        );
        if (product) {
          line_items.push({
            price: product.priceId!,
            quantity: item.quantity,
          });
        }
      });

      line_items.push({
        price: process.env.STRIPE_CUSTOM_TRANSACTION_FEE,
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ["card", "paypal"],
          mode: "payment",
          metadata: {
            userId: user.id,
            orderId: order.id,
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
          id: {
            equals: orderId,
          },
        },
      });

      if (!orders.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [order] = orders;
      return { isPaid: order._isPaid };
    }),
});
