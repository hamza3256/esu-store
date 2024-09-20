import { z } from "zod";

export const AccountCredentialsValidator = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
});

export type TAccountCredentialsValidator = z.infer<
  typeof AccountCredentialsValidator
>;
