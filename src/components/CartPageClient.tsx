"use client";

import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES } from "@/config";
import { useCart } from "@/hooks/use-cart";
import { cn, formatPrice } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Check, Loader2, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import ShippingAddressForm from "@/components/ShippingAddressForm";
import { Media, User } from "@/payload-types";
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/config"; // Import the shipping config
import { toast } from "./ui/use-toast";

interface CartPageProps {
  user: User | null; // User is passed from server-side as a prop
  cities: { label: string; value: string; }[]
}

const CartPageClient = ({ user, cities }: CartPageProps) => {
  const { items, updateQuantity, removeItem, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [userTypeSelected, setUserTypeSelected] = useState(Boolean(user));
  const [isGuest, setIsGuest] = useState(!user); // Track if the user is a guest, based on server-side user prop
  const [shippingAddress, setShippingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [guestName, setGuestName] = useState<string>(""); // New state for guest user name
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // useEffect(() => {
  //   const loadCities = async () => {
  //     setLoading(true);
  //     const fetchedCities = await fetchOperationalCities();
  //     setCities(
  //       fetchedCities.dist.map((city: any) => ({
  //         label: city.operationalCityName,
  //         value: city.operationalCityName,
  //       }))
  //     );
  //     setLoading(false);
  //   };
  //   loadCities();
  // }, []);

  const productItems = items.map(({ product, quantity }) => ({
    productId: product.id,
    quantity,
  }));

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  type HandleCityChange = (selectedOption: { label: string; value: string } | null) => void;

  const handleCityChange: HandleCityChange = (selectedOption) => {
    if (selectedOption) {
      setShippingAddress((prevState) => ({
        ...prevState,
        city: selectedOption.value, // Set the city from the selected value
      }));
    }
  };

  const handleGuestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestEmail(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^03\d{9}$/; // Regex for validating Pakistan phone numbers (03XXXXXXXXX)
    return phoneRegex.test(phone);
  };

  // TRPC mutation for logged-in user
  const { mutate: createCheckoutSession, isLoading: isCheckoutLoading } = trpc.payment.createSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        clearCart();
        router.push(url);
      }
    },
    onError: (error) => {
      console.error("Error creating checkout session:", error);
    },
  });

  // TRPC mutation for guest users
  const { mutate: createPublicSession, isLoading: isGuestCheckoutLoading } = trpc.order.createPublicSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        clearCart();
        router.push(url);
      }
    },
    onError: (error) => {
      console.error("Error creating guest checkout session:", error);
    },
  });

  const handleCheckout = () => {
    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country) {
      alert("Please fill out all required fields.");
      return;
    }

    if (!validatePhoneNumber(phone)) {
      toast({
        title: "Invalid number",
        description: "Please enter a valid phone number (e.g., 03XXXXXXXXX).",
        className: "animate-toast-slide-in",
      });
      return;
    }

    // Ensure user is available before creating a session
    if (isGuest) {
      if (!guestEmail || !guestName) {
        alert("Please provide a valid email address and name.");
        return;
      }
      createPublicSession({ productItems, shippingAddress, email: guestEmail, name: guestName, phone });
    } else if (user?.id) {
      createCheckoutSession({ productItems, shippingAddress, phone });
    } else {
      console.error("User not found. Cannot proceed with checkout.");
      alert("User not found. Please log in and try again.");
    }
  };

  const handleContinueAsGuest = () => {
    setUserTypeSelected(true);
    setIsGuest(true);
  };

  const handleLogin = () => {
    router.push(`/sign-in?origin=cart`);
  };

  const isFormComplete = () => {
    const requiredFields = ["line1", "city", "country"];
    return (
      requiredFields.every((field) => !!shippingAddress[field as keyof typeof shippingAddress]) &&
      (!isGuest || (!!guestEmail && !!guestName)) &&
      !!phone
    );
  };

  // Updated cartTotal function to use discounted prices
  const calculateCartTotal = () => {
    return items.reduce((total, { product, quantity }) => {
      const price = product.discountedPrice ?? product.price;
      return total + price * quantity;
    }, 0);
  };

  const orderTotal = calculateCartTotal();

  // Determine shipping fee based on cart total
  const shippingFee = orderTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          {/* Cart Items */}
          <div className={cn("lg:col-span-7", { "rounded-lg border-2 border-dashed border-zinc-200 p-12": isMounted && items.length === 0 })}>
            <h2 className="sr-only">Items in your shopping cart</h2>

            {isMounted && items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-1">
                <div aria-hidden="true" className="relative mb-4 h-40 w-40 text-muted-foreground">
                  <Image src="/bear_empty_cart.png" fill loading="eager" alt="empty shopping cart bear" />
                </div>
                <h3 className="font-semibold text-2xl">Your cart is empty</h3>
                <p className="text-muted-foreground text-center">Whoops! Nothing to show here yet.</p>
              </div>
            ) : null}

            <ul className={cn({ "divide-y divide-gray-200 border-b border-t border-gray-200": isMounted && items.length > 0 })}>
              {isMounted &&
                items.map(({ product, quantity }) => {
                  const label = PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label;
                  
                  const image = product.images.find(({ image }) => {
                    return typeof image === "object" && image.mimeType?.startsWith("image/");
                  })?.image as Media;

                  // Use discountedPrice if available
                  const price = product.discountedPrice ?? product.price;

                  return (
                    <li key={product.id} className="flex py-6 sm:py-10">
                      <div className="flex-shrink-0">
                        <div className="relative h-24 w-24">
                          {typeof image !== "string" && image.url ? (
                            <Image fill src={image.url} alt="product image" className="h-full w-full rounded-md object-cover object-center sm:h-48 sm:w-48" />
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
                            {/* Display original and discounted prices */}
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

                          <div className="mt-4 sm:mt-0 sm:pr-9 w-20">
                            <div className="absolute right-0 top-0">
                              <Button aria-label="remove product" onClick={() => removeItem(product.id)} variant="ghost">
                                <X className="h-5 w-5" aria-hidden="true" />
                              </Button>
                            </div>

                            <div className="flex items-center mt-4 space-x-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                disabled={quantity <= 1}
                                className="p-2 transition-all duration-150 ease-in-out hover:bg-gray-100 active:bg-gray-200"
                              >
                                <Minus className="w-4 h-4 text-gray-700" />
                              </Button>

                              <Input type="text" readOnly value={quantity} className="mx-2 w-12 text-center bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />

                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                disabled={quantity >= product.inventory}
                                className="p-2 transition-all duration-150 ease-in-out hover:bg-gray-100 active:bg-gray-200"
                              >
                                <Plus className="w-4 h-4 text-gray-700" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 flex space-x-2 text-gray-700">
                          <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>Eligible for shipping</span>
                        </p>
                        <span className="text-xs text-gray-500">{product.inventory > 0 ? `In stock: ${product.inventory}` : "Out of stock"}</span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Shipping Form */}
          <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <div className="mt-6 space-y-4">
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">
                  {isMounted ? formatPrice(calculateCartTotal()) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Shipping</p>
                <p className={cn((calculateCartTotal() >= FREE_SHIPPING_THRESHOLD) ? "text-green-600": "text-gray-900", "text-sm font-medium")}>
                  {isMounted ? (calculateCartTotal() >= FREE_SHIPPING_THRESHOLD ? "FREE" : formatPrice(SHIPPING_FEE)) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4 py-6">
                <div className="text-base font-medium text-gray-900">Order Total</div>
                <div className="text-base font-medium text-gray-900">
                  {isMounted ? formatPrice(calculateCartTotal() + shippingFee) : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
            </div>
              {!userTypeSelected ? (
                <div className="flex flex-col items-center px-4 border-t py-6">
                  <h1 className="text-2xl font-bold mb-6 text-gray-900">How do you want to checkout?</h1>
                  <div className="flex space-x-4">
                    <Button onClick={handleContinueAsGuest} className="px-6 py-4 text-lg font-medium">
                      Continue as Guest
                    </Button>
                    <Button onClick={handleLogin} variant="outline" className="px-6 py-4 text-lg font-medium">
                      Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-medium text-gray-900 py-6">Shipping Details</h2>

                  {isGuest ? (
                    <>
                      <div className="mb-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <div className="mt-1">
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your Name"
                            value={guestName}
                            onChange={handleGuestNameChange}
                            required
                            className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="mt-1">
                          <Input
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            value={guestEmail}
                            onChange={handleEmailChange}
                            required
                            className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mb-6">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1">
                        <Input
                          id="name"
                          name="name"
                          value={user?.name || ""}
                          readOnly
                          className="block w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="03XXXXXXXXX"
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                        className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <ShippingAddressForm
                    shippingAddress={shippingAddress}
                    handleInputChange={handleInputChange}
                    handleCityChange={handleCityChange}
                    cities={cities}
                    loading={false}
                  />

                  <div className="mt-6">
                    <Button
                      disabled={
                        items.length === 0 ||
                        isCheckoutLoading ||
                        isGuestCheckoutLoading ||
                        items.some((i) => i.product.inventory === 0 || !isFormComplete())
                      }
                      onClick={handleCheckout}
                      className="w-full"
                      size="lg"
                    >
                      {isCheckoutLoading || isGuestCheckoutLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-1.5" />
                      ) : null}
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CartPageClient;
