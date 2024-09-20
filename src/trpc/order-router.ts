import { z } from "zod";
import { router, privateProcedure, publicProcedure } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";

const shippingAddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(); 
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString(); 
  return `ESU-2410${timestamp.slice(-3)}-${randomPart}`; 
};

export const ordersRouter = router({
  getOrders: privateProcedure
    .input(z.object({ range: z.string().optional() })) 
    .query(async ({ input, ctx }) => {
      const payload = await getPayloadClient();
      const now = new Date();

      let dateFilter: { greater_than?: string } = {};

      switch (input.range) {
        case "1_week":
          dateFilter = {
            greater_than: new Date(now.setDate(now.getDate() - 7)).toISOString(),
          };
          break;
        case "3_months":
          dateFilter = {
            greater_than: new Date(now.setMonth(now.getMonth() - 3)).toISOString(),
          };
          break;
        case "6_months":
          dateFilter = {
            greater_than: new Date(now.setMonth(now.getMonth() - 6)).toISOString(),
          };
          break;
        case "all":
        default:
          dateFilter = {}; // No filter for all-time
          break;
      }

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          user: { equals: ctx.user.id },
          ...(dateFilter.greater_than && {
            createdAt: {
              greater_than: dateFilter.greater_than,
            },
          }),
        },
        depth: 2,
      });

      return orders;
    }),

  // Get a single order by ID
  getOrderById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: input.id,
          },
          user: {
            equals: ctx.user.id, // Ensure the user only sees their own orders
          },
        },
        depth: 2, // Fetch relationships deeply (products, etc.)
      });

      const order = orders[0];
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return order;
    }),

    // Get a single order by ID
  getOrderByOrderNumber: privateProcedure
  .input(z.object({ orderNumber: z.string() }))
  .query(async ({ input, ctx }) => {
    const payload = await getPayloadClient();

    const { docs: orders } = await payload.find({
      collection: "orders",
      where: {
        id: {
          equals: input.orderNumber,
        },
        user: {
          equals: ctx.user.id, // Ensure the user only sees their own orders
        },
      },
      depth: 2, // Fetch relationships deeply (products, etc.)
    });

    const order = orders[0];
    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    return order;
  }),

  // Admin: Update order status
  updateOrderStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can update order status",
        });
      }

      const payload = await getPayloadClient();

      const updatedOrder = await payload.update({
        collection: "orders",
        id: input.id,
        data: {
          status: input.status,
        },
      });

      return updatedOrder;
    }),

    createPublicSession : publicProcedure
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
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { productItems, shippingAddress, email } = input;

        if (productItems.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No products in the order." });
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
            return acc + (product.price as number) * item.quantity;
          }
          return acc;
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
            email,
            shippingAddress, // Save shipping address from the cart page
            orderNumber, // Save the generated order number
            total,
          },
        });

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        // Prepare line items for Stripe session
        for (const item of productItems) {
          const product = filteredProductsHavePrice.find((p) => p.id === item.productId);
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
          throw new TRPCError({ code: "BAD_REQUEST", message: "No valid products in the order." });
        }

        // Step 2: Create Stripe session
        let stripeSession;
        try {
          stripeSession = await stripe.checkout.sessions.create({
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}&guestEmail=${email}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
            payment_method_types: ["card"],
            mode: "payment",
            metadata: {
              email,
              orderId: order.id,
              orderNumber,
            },
            line_items,
          });
        } catch (error) {
          // If Stripe session creation fails, rollback the order and return error
          await payload.delete({
            collection: "orders",
            id: order.id,
          });
          console.log("Error creating Stripe session:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create Stripe payment session." });
        }

        // Step 3: Deduct product inventory after Stripe session creation succeeds
        for (const item of productItems) {
          const product = filteredProductsHavePrice.find((p) => p.id === item.productId);

          if (!product || !product.id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Product ID is missing for product: ${product?.name}`,
            });
          }

          // Check if product has enough inventory
          if (product.inventory as number < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient inventory for product: ${product.name}`,
            });
          }

          const updatedInventory = Math.max((product.inventory as number) - item.quantity, 0);

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


    trackOrder: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          orderNumber: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { email, orderNumber } = input;
        const payload = await getPayloadClient();
    
        // Query to find the order by both email and orderNumber
        const { docs: orders } = await payload.find({
          collection: "orders",
          where: {
            orderNumber: { equals: orderNumber },
            email: { equals: email }, // Ensure the email matches as well
          },
        });
    
        // If no orders are found, return a 404 error
        if (orders.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
    
        const [order] = orders;
        return order;
      }),
    

  // Admin: Create an order (for testing purposes)
//   createOrder: privateProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//         productItems: z.array(
//           z.object({
//             productId: z.string(),
//             quantity: z.number().min(1),
//           })
//         ),
//         shippingAddress: shippingAddressSchema,
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
//       if (ctx.user.role !== "admin") {
//         throw new TRPCError({
//           code: "UNAUTHORIZED",
//           message: "Only admins can create orders",
//         });
//       }

//       const payload = await getPayloadClient();

//       const total = productItems.reduce((acc, item) => {
//         const product = filteredProductsHavePrice.find((p) => p.id === item.productId);
//         if (product) {
//           return acc + product.price * item.quantity;
//         }
//         return acc;
//       }, 0);

//       const orderNumber = generateOrderNumber();

//       const createdOrder = await payload.create({
//         collection: "orders",
//         data: {
//           user: input.userId,
//           productItems: input.productItems.map((item) => ({
//             product: item.productId,
//             quantity: item.quantity,
//           })),
//           shippingAddress: input.shippingAddress,
//           _isPaid: false,
//           status: "pending",
//           orderNumber, // Save the generated order number
//         },
//       });

//       return createdOrder;
//     }),
});

// Export the combined TRPC router
export const appRouter = router({
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
