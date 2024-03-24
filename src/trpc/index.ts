import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  anyApiRoute: publicProcedure.query(() => {
    return "Hi, we are esu!";
  }),
});

export type AppRouter = typeof appRouter;
