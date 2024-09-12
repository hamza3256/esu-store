import { z } from "zod";
import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";
import { QueryValidator } from "../lib/validators/query-validator";
import { getPayloadClient } from "../get-payload";
import { paymentRouter } from "./payment-router";

export const appRouter = router({
  auth: authRouter,
  payment: paymentRouter,

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
});

export type AppRouter = typeof appRouter;
