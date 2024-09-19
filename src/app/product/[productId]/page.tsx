"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ImageSlider from "@/components/ImageSlider";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProductReel from "@/components/ProductReel";
import { PRODUCT_CATEGORIES } from "@/config";
import { formatPrice } from "@/lib/utils";
import { Check, Shield, Minus, Plus, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";
import { Product } from "@/payload-types";

interface PageProps {
  params: {
    productId: string;
  };
}

const BREADCRUMBS = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Products", href: "/products" },
];

// // Define the shape of a product
// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   inventory: number;
//   images: { image: string | { url: string } }[];
//   category: string;
//   rating: number;
//   numReviews: number;
//   description: string;
// }

const Page = ({ params }: PageProps) => {
  const { productId } = params;
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = trpc.getProductById.useQuery<{ id: string }, Product>({
    id: productId,
  });
  // Add a type assertion or check for Product
  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !product) {
    return notFound();
  }

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

  // Ensure the product has valid image URLs
  const validUrls = product.images
    ?.map(({ image }) => (typeof image === "string" ? image : image.url))
    .filter(Boolean) as string[];

  const handleQuantityChange = (action: "increment" | "decrement") => {
    setQuantity((prev) => {
      if (action === "increment") {
        return Math.min(prev + 1, product.inventory);
      }
      return Math.max(prev - 1, 1);
    });
  };

  return (
    <MaxWidthWrapper className="bg-white">
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          {/* Product details */}
          <div className="lg:max-w-lg lg:self-end">
            <ol className="flex items-center space-x-2">
              {BREADCRUMBS.map((breadcrumb, i) => (
                <li key={breadcrumb.href}>
                  <div className="flex items-center text-sm">
                    <Link
                      href={breadcrumb.href}
                      className="font-medium text-sm text-muted-foreground hover:text-gray-900"
                    >
                      {breadcrumb.name}
                    </Link>
                    {i !== BREADCRUMBS.length - 1 ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>
            </div>

            <section className="mt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 text-2xl">
                  {formatPrice(product.price)}
                </p>
                <div className="ml-4 border-l text-muted-foreground border-gray-300 pl-4">
                  {label}
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  ({product.numReviews} reviews)
                </span>
              </div>

              <div className="mt-4 space-y-6">
                <p className="text-base text-muted-foreground">
                  {product.description}
                </p>
              </div>
              <div className="mt-6 flex items-center">
                <Check
                  aria-hidden="true"
                  className="h-5 w-5 flex-shrink-0 text-green-500"
                />
                <p className="ml-2 text-sm text-muted-foreground">
                  Eligible for delivery
                </p>
              </div>
            </section>
          </div>

          {/* Product images */}
          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
            <div className="aspect-square rounded-lg overflow-hidden">
              <ImageSlider urls={validUrls} />
            </div>
          </div>

          {/* Add to cart section */}
          <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={product.inventory as number}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 text-center"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={quantity >= (product.inventory as number)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.inventory} available
                </p>
              </div>
              <AddToCartButton product={product} quantity={quantity} />
              <div className="mt-6 text-center">
                <div className="group inline-flex text-sm text-medium">
                  <Shield
                    aria-hidden="true"
                    className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400"
                  />
                  <span className="text-muted-foreground hover:text-gray-700">
                    30 Day Return Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product details tabs */}
      <div className="mt-16 lg:mt-24 lg:max-w-7xl lg:mx-auto lg:px-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <p className="text-muted-foreground">{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="mt-4">
            <ul className="list-disc pl-5 text-muted-foreground">
              <li>High-quality materials</li>
              <li>Adjustable height and tilt</li>
              <li>Breathable mesh back</li>
              <li>Padded armrests</li>
              <li>360-degree swivel</li>
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <p className="text-muted-foreground">No reviews yet.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar products */}
      <ProductReel
        href="/products"
        query={{ category: product.category, limit: 4 }}
        title={`Similar ${label}`}
        subtitle={`Browse similar ${label} like '${product.name}'`}
      />
    </MaxWidthWrapper>
  );
};

export default Page;
