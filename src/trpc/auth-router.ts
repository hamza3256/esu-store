import { AccountCredentialsValidator } from "../lib/validators/account-credentials-validator";
import { publicProcedure, router, privateProcedure } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AuthCredentialsValidator } from "../lib/validators/auth-credentials-validator";

export const authRouter = router({
  createPayloadUser: publicProcedure
  .input(AccountCredentialsValidator)
  .mutation(async ({ input }) => {
    const { email, password, name } = input;
    const payload = await getPayloadClient();

    // Check if the user already exists
    const { docs: users } = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (users.length !== 0) throw new TRPCError({ code: "CONFLICT" });

    // Create user with name
    const user = await payload.create({
      collection: "users",
      data: { email, password, name, role: "user" },
    });

    // Update any orders associated with this email
    await payload.update({
      collection: "orders",
      where: { email: { equals: email } },
      data: { user: user.id.toString() },
    });

    return { success: true, sentToEmail: email };
  }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input;

      const payload = await getPayloadClient();

      const isVerified = await payload.verifyEmail({
        collection: "users",
        token,
      });

      if (!isVerified) throw new TRPCError({ code: "UNAUTHORIZED" });

      return { success: true };
    }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { res } = ctx;

      const payload = await getPayloadClient();

      try {
        await payload.login({
          collection: "users",
          data: {
            email,
            password,
          },
          res,
        });

        return { success: true };
      } catch (err) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),

  updateUser: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      // Ensure user can only update their own profile
      if (id !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only update your own profile",
        });
      }

      const payload = await getPayloadClient();

      const updatedUser = await payload.update({
        collection: "users",
        id,
        data,
      });

      return updatedUser;
    }),
});
