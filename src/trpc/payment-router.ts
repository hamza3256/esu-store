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
  return `ESU-2410${timestamp.slice(-3)}-${randomPart}`; // Use last 6 digits of timestamp + random number
};

export const paymentRouter = router({
  createSession: privateProcedure
  .input(
    z.object({
      productItems: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number(),
        })
      ),
      shippingAddress: z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { productItems, shippingAddress } = input;

    if (!user || !user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (productItems.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No products in the order",
      });
    }

    const payload = await getPayloadClient();

    // Fetch products to ensure they exist and have enough inventory
    const { docs: products } = await payload.find({
      collection: "products",
      where: {
        id: {
          in: productItems.map((item) => item.productId),
        },
      },
    });

    // Ensure products exist and have prices
    const filteredProductsHavePrice = products.filter((product) =>
      Boolean(product.priceId)
    );

    if (filteredProductsHavePrice.length !== productItems.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Some products do not have prices or were not found",
      });
    }

    // Calculate the total
    const total = productItems.reduce((acc, item) => {
      const product = filteredProductsHavePrice.find(
        (p) => p.id === item.productId
      );
      if (!product) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product with ID ${item.productId} not found`,
        });
      }
      return acc + (product.price as number) * item.quantity;
    }, 0);

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Step 1: Create the order but don't deduct inventory yet
    const order = await payload.create({
      collection: "orders",
      data: {
        _isPaid: false,
        productItems: productItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        email: user.email,
        user: user.id,
        shippingAddress,
        orderNumber,
        total,
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Prepare line items for Stripe session
    for (const item of productItems) {
      const product = filteredProductsHavePrice.find(
        (p) => p.id === item.productId
      );
      if (product) {
        // Prepare line item for Stripe
        line_items.push({
          price: product.priceId!.toString(),
          quantity: item.quantity,
        });
      }
    }

    if (line_items.length === 0) {
      // Rollback the order if no valid products are found
      await payload.delete({
        collection: "orders",
        id: order.id,
      });
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No valid products in the order.",
      });
    }

    // Step 2: Create Stripe session
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
        payment_method_types: ["card"],
        mode: "payment",
        metadata: {
          userId: user.id,
          orderId: order.id,
          orderNumber,
        },
        line_items,
      });
    } catch (error) {
      // Enhanced error logging for debugging
      console.error("Error creating Stripe session:", error);

      // Rollback the order if Stripe session creation fails
      await payload.delete({
        collection: "orders",
        id: order.id,
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create Stripe session.",
      });
    }

    // Step 3: Deduct product inventory after Stripe session creation succeeds
    for (const item of productItems) {
      const product = filteredProductsHavePrice.find(
        (p) => p.id === item.productId
      );

      if (!product || !product.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product ID is missing for product: ${product?.name}`,
        });
      }

      // Check if product has enough inventory
      if ((product.inventory as number) < item.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient inventory for product: ${product.name}`,
        });
      }

      const updatedInventory = Math.max(
        (product.inventory as number) - item.quantity,
        0
      );

      // Deduct the quantity from the product's inventory
      await payload.update({
        collection: "products",
        id: product.id,
        data: {
          inventory: updatedInventory,
        },
      });
    }

    // Step 4: Return the Stripe session URL for the client to redirect
    return { url: stripeSession.url };
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
