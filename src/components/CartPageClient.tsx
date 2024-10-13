'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { trpc } from '@/trpc/client'
import { formatPrice } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/config'
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, COD_THRESHOLD } from '@/lib/config'
import { User, Media } from '@/payload-types'
import { Check, Loader2, Minus, Plus, X, CreditCard, Truck, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import ShippingAddressForm from '@/components/ShippingAddressForm'

interface CartPageProps {
  user: User | null
  cities: { label: string; value: string }[]
}

export default function CartPageClient({ user, cities }: CartPageProps) {
  const { items, updateQuantity, removeItem, cartTotal, clearCart } = useCart()
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (cartTotal() > COD_THRESHOLD && paymentMethod === 'cod') {
      setPaymentMethod('online')
      toast({
        title: 'Payment Method Changed',
        description: `Cash on Delivery is not available for orders above ${formatPrice(COD_THRESHOLD)}. Your payment method has been changed to online payment.`,
        variant: 'default',
      })
    }
  }, [cartTotal(), paymentMethod])

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
    return phoneRegex.test(phone)
  }

  const { mutate: createCheckoutSession, isLoading: isCheckoutLoading } = trpc.payment.createSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        clearCart()
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
        clearCart()
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
      clearCart()
      router.push(`${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation?orderId=${order.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'There was a problem processing your order.',
        variant: 'destructive',
      })
    },
  })

  const handleCheckout = () => {
    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country) {
      toast({
        title: 'Incomplete Address',
        description: 'Please fill out all required address fields.',
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
      })
    } else if (isGuest) {
      if (!guestEmail || !guestName) {
        toast({
          title: 'Incomplete Information',
          description: 'Please provide a valid email address and name.',
          variant: 'destructive',
        })
        return
      }
      createPublicSession({ productItems, shippingAddress, email: guestEmail, name: guestName, phone })
    } else if (user?.id) {
      createCheckoutSession({ productItems, shippingAddress, phone })
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

  const isFormComplete = () => {
    const requiredFields = ['line1', 'city', 'country']
    return (
      requiredFields.every((field) => !!shippingAddress[field as keyof typeof shippingAddress]) &&
      (!isGuest || (!!guestEmail && !!guestName)) &&
      !!phone
    )
  }

  const calculateCartTotal = () => {
    return items.reduce((total, { product, quantity }) => {
      const price = product.discountedPrice ?? product.price
      return total + price * quantity
    }, 0)
  }

  const orderTotal = calculateCartTotal()
  const shippingFee = orderTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">Shopping Cart</h1>

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
                <ul className="divide-y divide-gray-200">
                  {isMounted &&
                    items.map(({ product, quantity }) => {
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
                              {imageUrl ? (
                                <Image fill src={imageUrl} alt="product image" className="h-full w-full rounded-md object-cover object-center" />
                              ) : null}
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
                                    <>
                                      <span className="line-through text-gray-500 mr-2">
                                        {formatPrice(product.price)}
                                      </span>
                                      <span>{formatPrice(product.discountedPrice)}</span>
                                    </>
                                  ) : (
                                    <span>{formatPrice(product.price)}</span>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isMounted ? formatPrice(calculateCartTotal()) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className={`text-sm font-medium ${(calculateCartTotal() >= FREE_SHIPPING_THRESHOLD) ? "text-green-600" :   "text-gray-900"}`}>
                    {isMounted ? (calculateCartTotal() >= FREE_SHIPPING_THRESHOLD ? "FREE" : formatPrice(SHIPPING_FEE)) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-base font-medium text-gray-900">Order Total</div>
                  <div className="text-base font-medium text-gray-900">
                    {isMounted ? formatPrice(calculateCartTotal() + shippingFee) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                </div>
              </div>

              {!userTypeSelected ? (
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
              ) : (
                <>
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
                      <Input
                        id="phone"
                        placeholder="03XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
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
                          <DollarSign className="w-4 h-4 mr-2" />
                          Cash on Delivery
                          {!user && " (Login required)"}
                          {cartTotal() > COD_THRESHOLD && ` (Not available for orders above ${formatPrice(COD_THRESHOLD)})`}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
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