'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { trpc } from '@/trpc/client'
import { PRODUCT_CATEGORIES } from '@/config'
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, COD_THRESHOLD } from '@/lib/config'
import { User, Media } from '@/payload-types'
import { Check, Loader2, Minus, Plus, X, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import ShippingAddressForm from '@/components/ShippingAddressForm'
import { formatRupees } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface CartPageProps {
  user: User | null
  cities: { label: string; value: string }[]
}

export default function CartPageClient({ user, cities }: CartPageProps) {
  const { items, updateQuantity, removeItem, cartTotal, clearCart, applyPromoCode } = useCart()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online')
  const [userTypeSelected, setUserTypeSelected] = useState(Boolean(user))
  const [isGuest, setIsGuest] = useState(!user)
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [guestName, setGuestName] = useState<string>('')
  const [guestEmail, setGuestEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [promoCode, setPromoCode] = useState<string>('')
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null)
  const [discount, setDiscount] = useState<number>(0)
  const [formProgress, setFormProgress] = useState(0)
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(null)

  const { mutate: applyPromoCodeMutation, isLoading: isApplyingPromoCode } = trpc.cart.applyPromoCode.useMutation({
    onSuccess: (data) => {
      setDiscount(data.discount)
      applyPromoCode(data.discount)
      setPromoCodeError(null)
      toast({
        title: 'Promo Code Applied',
        description: `A discount of ${data.discount}% has been applied to your order.`,
        variant: 'default',
      })
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") {
        toast({
          title: 'Please Login',
          description: `To use a promo code, you need to be logged in.`,
          variant: 'default',
        })
      } else {
        setPromoCodeError(error.message)
      }
    },
  })

  const { mutate: createCheckoutSession, isLoading: isCheckoutLoading } = trpc.payment.createSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        if (url.includes("order-confirmation")) {
          clearCart()
        }
        router.push(url)
      }
    },
    onError: (error) => {
      console.error('Error creating checkout session:', error)
      toast({
        title: 'Error',
        description: 'There was a problem processing your order.',
        variant: 'destructive',
      })
    },
  })

  const { mutate: createPublicSession, isLoading: isGuestCheckoutLoading } = trpc.order.createPublicSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        if (url.includes("order-confirmation")) {
          clearCart()
        }
        router.push(url)
      }
    },
    onError: (error) => {
      console.error('Error creating guest checkout session:', error)
      toast({
        title: 'Error',
        description: 'There was a problem processing your order.',
        variant: 'destructive',
      })
    },
  })

  const { mutate: createCODOrder, isLoading: isCODLoading } = trpc.payment.createCODOrder.useMutation({
    onSuccess: ({ order }) => {
      router.push(`${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}`)
      clearCart()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'There was a problem processing your order.',
        variant: 'destructive',
      })
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (cartTotal() > COD_THRESHOLD && paymentMethod === 'cod') {
      setPaymentMethod('online')
      toast({
        title: 'Payment Method Changed',
        description: `Cash on Delivery is not available for orders above ${formatRupees(COD_THRESHOLD)}. Your payment method has been changed to online payment.`,
        variant: 'default',
      })
    }
  }, [cartTotal, paymentMethod])

  const isFormComplete = () => {
    const requiredFields = ['line1', 'city', 'country']
    return (
      requiredFields.every((field) => !!shippingAddress[field as keyof typeof shippingAddress]) &&
      (!isGuest || (!!guestEmail && !!guestName)) &&
      !!phone &&
      isPhoneValid
    )
  }

  useEffect(() => {
    const totalSteps = 4 // Total number of required form sections
    let completedSteps = 0

    if (items.length > 0) completedSteps++
    if (userTypeSelected) completedSteps++
    if (isFormComplete()) completedSteps++
    if (paymentMethod) completedSteps++

    setFormProgress((completedSteps / totalSteps) * 100)
  }, [items, userTypeSelected, isFormComplete, paymentMethod])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCityChange = (selectedOption: { label: string; value: string } | null) => {
    if (selectedOption) {
      setShippingAddress((prevState) => ({
        ...prevState,
        city: selectedOption.value,
      }))
    }
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^03\d{9}$/
    const isValid = phoneRegex.test(phone)
    setIsPhoneValid(isValid)
    return isValid
  }

  const handleApplyPromoCode = () => {
    if (!promoCode) {
      setPromoCodeError('Please enter a promo code.')
      return
    }
    applyPromoCodeMutation({ promoCode })
  }

  const removePromoCode = () => {
    setPromoCode('')
    setDiscount(0)
    toast({
      title: 'Promo Code Removed',
      description: 'The applied promo code has been removed.',
      variant: 'default',
    })
  }

  const handleCheckout = () => {
    if (!isFormComplete()) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      })
      return
    }

    if (!validatePhoneNumber(phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number (e.g., 03XXXXXXXXX).',
        variant: 'destructive',
      })
      return
    }

    const productItems = items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }))

    if (paymentMethod === 'cod' && user) {
      createCODOrder({
        productItems,
        shippingAddress,
        phone,
        promoCode
      })
    } else if (isGuest) {
      createPublicSession({ productItems, shippingAddress, email: guestEmail, name: guestName, phone, promoCode })
    } else if (user?.id) {
      createCheckoutSession({ productItems, shippingAddress, phone, promoCode })
    } else {
      console.error('User not found. Cannot proceed with checkout.')
      toast({
        title: 'Authentication Error',
        description: 'User not found. Please log in and try again.',
        variant: 'destructive',
      })
    }
  }

  const handleContinueAsGuest = () => {
    setUserTypeSelected(true)
    setIsGuest(true)
  }

  const handleLogin = () => {
    router.push(`/sign-in?origin=cart`)
  }

  const calculateCartTotal = useMemo(() => {
    const subtotal = items.reduce((total, { product, quantity }) => {
      const price = product.discountedPrice ?? product.price
      return total + price * quantity
    }, 0)
  
    const discountedTotal = discount > 0 ? subtotal * (1 - discount / 100) : subtotal
  
    return discountedTotal
  }, [items, discount])  

  const orderTotal = calculateCartTotal
  const shippingFee = orderTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  const renderCartItems = () => (
    <ul className="divide-y divide-gray-200">
      {items.map(({ product, quantity }) => {
        const label = PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label
        const firstImage = product.images.find(({ image }: {image: Media | string}) => {
          return typeof image === 'object' && (image.resourceType?.startsWith('image') || image.mimeType?.startsWith('image'))
        })?.image
        const imageUrl = (firstImage as Media).sizes?.thumbnail?.url
        const price = product.discountedPrice ?? product.price

        return (
          <li key={product.id} className="flex py-6 sm:py-10">
            <div className="flex-shrink-0">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                {imageUrl && (
                  <Image fill src={imageUrl} alt="product image" className="h-full w-full rounded-md object-cover object-center" />
                )}
              </div>
            </div>

            <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
              <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                <div>
                  <div className="flex justify-between">
                    <h3 className="text-sm">
                      <Link href={`/product/${product.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                        {product.name}
                      </Link>
                    </h3>
                  </div>
                  <div className="mt-1 flex text-sm">
                    <p className="text-muted-foreground">Category: {label}</p>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {product.discountedPrice ? (
                      <span className="flex items-center">
                        <span className="line-through text-gray-500 mr-2">
                          {formatRupees(product.price)}
                        </span>
                        <span className="text-red-600">{formatRupees(product.discountedPrice)}</span>
                      </span>
                    ) : (
                      <span>{formatRupees(product.price)}</span>
                    )}
                  </p>
                </div>

                <div className="mt-4 sm:mt-0 sm:pr-9">
                  <div className="absolute right-0 top-0">
                    <Button aria-label="remove product" onClick={() => removeItem(product.id)} variant="ghost" size="icon">
                      <X className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="flex items-center mt-4 space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      disabled={quantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <Input
                      type="text"
                      readOnly
                      value={quantity}
                      className="w-12 text-center"
                    />

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.inventory}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Eligible for shipping</span>
              </p>
              <span className="text-xs text-gray-500">{product.inventory > 0 ? `In stock: ${product.inventory}` : "Out of stock"}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )

  const renderOrderSummary = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Subtotal</p>
        <p className="text-sm font-medium text-gray-900">
          {isMounted ? formatRupees(calculateCartTotal) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </p>
      </div>
  
      {discount > 0 && (
        <div className="flex items-center  justify-between text-green-600">
          <p className="text-sm">Discount ({discount}%)</p>
          <p className="text-sm font-medium">
            - &nbsp;{formatRupees((items.reduce((total, { product, quantity }) => total + (product.discountedPrice ?? product.price) * quantity, 0)) * (discount / 100))}
          </p>
        </div>
      )}
  
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Shipping</p>
        <p className={`text-sm font-medium ${calculateCartTotal >= FREE_SHIPPING_THRESHOLD ? "text-green-600" : "text-gray-900"}`}>
          {isMounted ? 
            (calculateCartTotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : formatRupees(SHIPPING_FEE)) :
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          }
        </p>
      </div>
  
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-base font-medium text-gray-900">Order Total</div>
        <div className="text-lg font-semibold text-gray-900">
          {isMounted ? formatRupees(calculateCartTotal + shippingFee) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>
    </div>
  )

  const renderPromoCodeSection = () => (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Promo Code</h2>
      <div className="flex space-x-2">
        <Input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Enter promo code"
          className="flex-grow"
          disabled={!!discount}
        />
        {discount > 0 ? (
          <Button onClick={removePromoCode}>
            Remove
          </Button>
        ) : (
          <Button onClick={handleApplyPromoCode} disabled={isApplyingPromoCode}>
            {isApplyingPromoCode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
          </Button>
        )}
      </div>
      {promoCodeError && <p className="text-red-500 text-sm mt-1">{promoCodeError}</p>}
    </div>
  )

  const renderCheckoutOptions = () => (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">How do you want to checkout?</h2>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button onClick={handleContinueAsGuest} className="flex-1">
          Continue as Guest
        </Button>
        <Button onClick={handleLogin} variant="outline" className="flex-1">
          Sign In
        </Button>
      </div>
    </div>
  )

  const renderShippingDetails = () => (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Details</h2>
      {isGuest ? (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </>
      ) : (
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={user?.name || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
      )}
      <div className="mt-4">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Input
            id="phone"
            placeholder="03XXXXXXXXX"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              validatePhoneNumber(e.target.value)
            }}
            required
            className={`pr-10 ${
              isPhoneValid === true
                ? 'border-green-500 focus:ring-green-500'
                : isPhoneValid === false
                ? 'border-red-500 focus:ring-red-500'
                : ''
            }`}
          />
          {isPhoneValid !== null && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isPhoneValid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {isPhoneValid === false && (
          <p className="mt-1 text-sm text-red-500">Please enter a valid phone number (e.g., 03XXXXXXXXX)</p>
        )}
      </div>
      <div className="mt-4">
        <ShippingAddressForm
          shippingAddress={shippingAddress}
          handleInputChange={handleInputChange}
          handleCityChange={handleCityChange}
          cities={cities}
          loading={false}
        />
      </div>
    </div>
  )

  const renderPaymentMethod = () => (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "cod" | "online")}>
        <div className="flex items-center space-x-2 mb-2">
          <RadioGroupItem value="online" id="online" />
          <Label htmlFor="online" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Online Payment
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="cod"
            id="cod"
            disabled={!user || cartTotal() > COD_THRESHOLD}
          />
          <Label
            htmlFor="cod"
            className={`flex items-center ${(!user || cartTotal() > COD_THRESHOLD) ? 'opacity-50' : ''}`}
          >
            <span className="mr-2 text-lg font-semibold">₨</span>
            Cash on Delivery
            {!user && " (Login required)"}
            {cartTotal() > COD_THRESHOLD && ` (Not available for orders above ${formatRupees(COD_THRESHOLD)})`}
          </Label>
        </div>
      </RadioGroup>
    </div>
  )

  const renderProgressBar = () => (
    <div className="mb-6">
      <Progress value={formProgress} className="w-full" />
      <p className="text-sm text-gray-600 mt-2">Form completion: {formProgress.toFixed(0)}%</p>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">Shopping Cart</h1>

        {renderProgressBar()}

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          {/* Cart Items */}
          <Card className="lg:col-span-7 mb-8 lg:mb-0">
            <CardHeader>
              <CardTitle>Items in your cart</CardTitle>
              <CardDescription>Review and adjust your items before checkout</CardDescription>
            </CardHeader>
            <CardContent>
              {isMounted && items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-1 py-12">
                  <div aria-hidden="true" className="relative mb-4 h-40 w-40 text-muted-foreground">
                    <Image src="/bear_empty_cart.png" fill loading="eager" alt="empty shopping cart bear" />
                  </div>
                  <h3 className="font-semibold text-2xl">Your cart is empty</h3>
                  <p className="text-muted-foreground text-center">Whoops! Nothing to show here yet.</p>
                </div>
              ) : (
                renderCartItems()
              )}
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Complete your purchase by providing shipping and payment details</CardDescription>
            </CardHeader>
            <CardContent>
              {renderOrderSummary()}
              {renderPromoCodeSection()}
              {!userTypeSelected ? renderCheckoutOptions() : (
                <>
                  {renderShippingDetails()}
                  {renderPaymentMethod()}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                disabled={
                  isCODLoading ||
                  items.length === 0 ||
                  isCheckoutLoading ||
                  isGuestCheckoutLoading ||
                  items.some((i) => i.product.inventory === 0) ||
                  !isFormComplete()
                }
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                {isCheckoutLoading || isGuestCheckoutLoading || isCODLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {paymentMethod === "cod" ? "Place Order (COD)" : "Proceed to Payment"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}