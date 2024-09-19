import { z } from "zod";
import { authRouter } from "./auth-router";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { QueryValidator } from "../lib/validators/query-validator";
import { getPayloadClient } from "../get-payload";
import { paymentRouter } from "./payment-router";
import { ordersRouter } from "./order-router";
import { TRPCError } from "@trpc/server";
import { Product, User } from "@/payload-types";
import { PayloadRequest } from "payload/types";

export const appRouter = router({
  auth: authRouter,
  payment: paymentRouter,
  order: ordersRouter,

  getInfiniteProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().nullish(),
        query: QueryValidator,
      })
    )
    .query(async ({ input }) => {
      const { query, cursor } = input;
      const { sort, limit, ...queryOpts } = query;

      const payload = await getPayloadClient();

      const parsedQueryOpts: Record<string, { equals: string }> = {};

      Object.entries(queryOpts).forEach(([key, value]) => {
        parsedQueryOpts[key] = {
          equals: value,
        };
      });

      const page = cursor || 1;

      const {
        docs: items,
        hasNextPage,
        nextPage,
      } = await payload.find({
        collection: "products",
        where: {
          approvedForSale: {
            equals: "approved",
          },
          ...parsedQueryOpts,
        },
        sort,
        depth: 1,
        limit,
        page,
      });

      return { items, nextPage: hasNextPage ? nextPage : null };
    }),

    searchProducts: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query cannot be empty"),
        limit: z.number().min(1).max(100).default(10),
        page: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const { query, limit, page } = input;
      const payload = await getPayloadClient();

      // Perform the search query with a "contains" condition on relevant fields
      const { docs: items, totalDocs, totalPages } = await payload.find({
        collection: "products",
        where: {
          or: [
            { name: { contains: query } },         // Search by product name
            { description: { contains: query } },  // Search by product description
          ],
        },
        limit,
        page,
        depth: 1,
      });

      // Return search results and metadata
      return { items, totalDocs, totalPages };
    }),

    getProductById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const payload = await getPayloadClient();

      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            equals: input.id,
          },
          // user: {
          //   equals: ctx.user.id, // Ensure the user only sees their own orders
          // },
        },
        depth: 1, // Fetch relationships deeply (products, etc.)
      });

      const product = products[0];
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      return product;
    }),
    
    getUserInfo: privateProcedure.query(({ ctx }) => {
      const req = ctx.req as PayloadRequest;

      const { user } = req as { user: User | null };
  
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not logged in' });
      }
  
      return { user };
    }),
});

export type AppRouter = typeof appRouter;
