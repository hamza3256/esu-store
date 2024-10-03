"use client"

import { useState } from "react"
import { Icons } from "@/components/Icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from "@/lib/validators/auth-credentials-validator"
import { motion } from "framer-motion"

const Page = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isSeller = searchParams.get("as") === "seller"
  const origin = searchParams.get("origin")

  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  })

  const { mutate: signIn, isLoading } = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      toast.success("Signed in successfully")

      if (origin) {
        router.push(`/${origin}`)
      } else if (isSeller) {
        router.push("/sell")
      } else {
        router.push("/")
      }
      router.refresh()
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        toast.error("Invalid email or password")
      } else {
        toast.error("An error occurred. Please try again.")
      }
    },
  })

  const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
    signIn({ email, password })
  }

  return (
    <div className="container relative flex flex-col items-center justify-center min-h-screen lg:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          <Icons.logo className="h-20 w-20" />
          <h1 className="text-2xl font-bold">
            Sign in to your {isSeller ? "seller" : ""} account
          </h1>
          <Link
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            href="/sign-up"
          >
            Don&apos;t have an account?{" "}
            <ArrowRight className="h-4 w-4 inline-block ml-1" />
          </Link>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="you@example.com"
                className={cn(
                  "transition-all duration-300",
                  errors.email && "focus-visible:ring-red-500 border-red-500"
                )}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={cn(
                    "pr-10 transition-all duration-300",
                    errors.password && "focus-visible:ring-red-500 border-red-500"
                  )}
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
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            onClick={() =>
              isSeller ? router.replace("/sign-in") : router.push("?as=seller")
            }
            variant="outline"
            className="w-full"
          >
            Continue as {isSeller ? "customer" : "seller"}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default Page