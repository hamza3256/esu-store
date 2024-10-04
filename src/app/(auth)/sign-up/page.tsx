"use client";

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  AccountCredentialsValidator,
  TAccountCredentialsValidator,
} from "@/lib/validators/account-credentials-validator";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ZodError } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import BearLogo from "@/components/BearLogo";

const Page = () => {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAccountCredentialsValidator>({
    resolver: zodResolver(AccountCredentialsValidator),
  });

  const router = useRouter();

  const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        toast.error("This email already exists. Sign in?");
        return;
      }

      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
        return;
      }

      toast.error("Something went wrong. Please try again.");
    },
    onSuccess: ({ sentToEmail }) => {
      toast.success(`Verification email sent to ${sentToEmail}`);
      router.push("/verify-email?to=" + sentToEmail);
    },
  });

  const onSubmit = ({ email, password, name }: TAccountCredentialsValidator) => {
    mutate({ email, password, name });
  };

  return (
    <>
      <div className="container relative flex flex-col items-center justify-center min-h-screen lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
        >
          <div className="flex flex-col items-center space-y-2 text-center">
            {/* <Icons.logo className="h-20 w-20" /> */}
            <BearLogo />
            <h1 className="text-2xl font-bold">Create an account</h1>
            <Link
              className={buttonVariants({
                variant: "link",
                className: "text-muted-foreground",
              })}
              href="/sign-in"
            >
              Already have an account? Sign In <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grd gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    {...register("name")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.name,
                    })}
                    placeholder="Your Full Name"
                  />
                  {errors?.name && (
                    <p className="text-sm text-red-500 ">{errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                    placeholder="you@example.com"
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500 ">{errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      className={cn({
                        "focus-visible:ring-red-500": errors.password,
                      })}
                      placeholder="Password"
                    />
                      <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors?.password && (
                    <p className="text-sm text-red-500 ">{errors.password.message}</p>
                  )}
                </div>

                <Button>{isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin py-4 text-muted-foreground mr-1.5" />
                  ) : null} Sign Up</Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Page;

