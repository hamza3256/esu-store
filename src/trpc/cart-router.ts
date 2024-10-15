import { z } from "zod";
import { router, privateProcedure } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { PromoCode } from "../lib/types";

export const cartRouter = router({
  applyPromoCode: privateProcedure
    .input(
      z.object({
        promoCode: z.string(), // Promo code input
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayloadClient();
      const now = new Date().toISOString(); // Ensure date format matches

      // Fetch promo code details
      const { docs: promoCodes } = await payload.find({
        collection: "promo-codes",
        where: {
          code: {
            equals: input.promoCode,
          },
          validFrom: {
            less_than_equal: now,  // Ensure promo is valid now
          },
          validUntil: {
            greater_than_equal: now,  // Ensure promo hasn't expired
          },
        },
        limit: 1, // Only fetch one promo code
      });

      if (!promoCodes || promoCodes.length === 0) {
        throw new Error("Invalid or expired promo code.");
      }

      const promoCode: PromoCode = promoCodes[0];

      // Ensure currentUses is initialized, if not already
      const currentUses = promoCode.currentUses || 0;

      // Check if the promo code has reached its maximum use limit
      if (currentUses >= promoCode.maxUses) {
        throw new Error("This promo code has reached its usage limit.");
      }

      // Increment the usage count for this promo code
      await payload.update({
        collection: "promo-codes",
        id: promoCode.id,
        data: {
          currentUses: currentUses + 1, // Increment safely
        },
      });

      // Return the discount percentage
      return {
        discount: promoCode.discountPercentage,
      };
    }),
});
