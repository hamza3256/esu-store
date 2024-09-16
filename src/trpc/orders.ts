import { z } from "zod";
import { router, privateProcedure } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";

const shippingAddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const generateOrderNumber = () => {
    const timestamp = Date.now().toString(); // Current timestamp in milliseconds
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
    return `${timestamp.slice(-6)}-${randomPart}`; // Use last 6 digits of timestamp + random number
  };
  

export const ordersRouter = router({
  getOrders: privateProcedure
    .input(z.object({ range: z.string().optional() })) // Accepting range as input
    .query(async ({ input, ctx }) => {
      const payload = await getPayloadClient();
      const now = new Date();

      // Define dateFilter with a more specific type
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
