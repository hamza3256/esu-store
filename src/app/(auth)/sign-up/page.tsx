"use client"

import { useState } from "react"
import { Icons } from "@/components/Icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AccountCredentialsValidator,
  TAccountCredentialsValidator,
} from "@/lib/validators/account-credentials-validator"
import { motion } from "framer-motion"
import Logo from "@/components/Logo"
import PageLoader from "@/components/PageLoader"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ZodError } from "zod"

const Page = () => {
  const [redirecting, setRedirecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAccountCredentialsValidator>({
    resolver: zodResolver(AccountCredentialsValidator),
  })

  const router = useRouter()

  const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        toast.error("This email already exists. Sign in instead?")
        return
      }

      if (err instanceof ZodError) {
        toast.error(err.issues[0].message)
        return
      }

      toast.error("Something went wrong. Please try again.")
    },
    onSuccess: ({ sentToEmail }) => {
      setRedirecting(true)
      toast.success(`Verification email sent to ${sentToEmail}`)
      router.push("/verify-email?to=" + sentToEmail)
    },
  })

  const onSubmit = ({ email, password, name }: TAccountCredentialsValidator) => {
    mutate({ email, password, name })
  }

  return (
    <>
      {redirecting ? (
        <PageLoader />
      ) : (
        <div className="container relative flex flex-col items-center justify-center min-h-screen px-4 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                  <Logo/>
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                  Create an account
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your details to sign up for an account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="sr-only">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        {...register("name")}
                        id="name"
                        placeholder="Your Full Name"
                        className={cn(
                          "pl-10 transition-all duration-300",
                          errors.name && "focus-visible:ring-red-500 border-red-500"
                        )}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

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
                        placeholder="Create a password"
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
                    Sign Up
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                  href="/sign-in"
                >
                  Already have an account? Sign In
                  <ArrowRight className="h-4 w-4 ml-1" />
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