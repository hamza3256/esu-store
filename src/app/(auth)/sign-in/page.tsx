"use client"

import { useState } from "react"
import { Icons } from "@/components/Icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react"
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
import Logo from "@/components/Logo"
import PageLoader from "@/components/PageLoader"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const Page = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isSeller = searchParams.get("as") === "seller"
  const origin = searchParams.get("origin")

  const [redirecting, setRedirecting] = useState(false)
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
      setRedirecting(true)
      toast.success("Signed in successfully")

      if (origin) {
        router.prefetch(`/${origin}`)
        router.push(`/${origin}`)
      } else if (isSeller) {
        router.prefetch("/sell")
        router.push("/sell")
      } else {
        router.prefetch("/")
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
    <>
      {redirecting ? (
        <PageLoader />
      ) : (
        <div className="container relative flex flex-col items-center justify-center  px-4 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                  <Logo />
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                  Sign in to your {isSeller ? "seller" : ""} account
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="sr-only">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={cn(
                          "pl-10 transition-all duration-300",
                          errors.email && "focus-visible:ring-red-500 border-red-500"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="sr-only">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        {...register("password")}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={cn(
                          "pl-10 pr-10 transition-all duration-300",
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Sign In
                  </Button>
                </form>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      isSeller
                        ? router.replace("/sign-in")
                        : router.push("?as=seller")
                    }
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Continue as {isSeller ? "customer" : "seller"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-center justify-center space-y-2">
                <Link
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  href="/sign-up"
                >
                  Don&apos;t have an account? Sign up
                </Link>
                <Link
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  href="/sell/forgot"
                >
                  Forgot your password?
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default Page