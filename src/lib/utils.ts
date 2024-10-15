import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRupees = (amount: number) => {
  return new Intl.NumberFormat('ur-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', '₨');
};

export function formatPrice(
  price: number | string,
  options: {
    currency?: "USD" | "GBP" | "EUR" | "PKR" | "JPY" | "INR";
    locale?: string; // For regional price formatting
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: Intl.NumberFormatOptions["notation"];
  } = {}
) {
  const {
    currency = "PKR", // Default to USD if not specified
    locale = "en-US", // Default to US English formatting
    minimumFractionDigits = 2, // Ensure decimal places for most currencies
    maximumFractionDigits = 2,
    notation = "standard", // Use standard notation for eCommerce stores
  } = options;

  // Convert string price to a number if necessary
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  // If price is not a valid number, fallback to zero
  const safePrice = isNaN(numericPrice) ? 0 : numericPrice;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: "currency",
    currency: "PKR", // Currency from Zustand store
    currencyDisplay: "narrowSymbol", // Favor the narrow symbol where available
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(safePrice);

  // Replace the currency code with the custom symbol if necessary (for PKR)
  return formattedPrice.replace("PKR", "₨");
}

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}


export function constructMetadata({
  title = "ESÜstore.com: the marketplace for high-quality products",
  description = "ESÜ is an open-source marketplace for high-quality clothes for men and women",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@MuhammadHamza",
    },
    icons,
    metadataBase: new URL("https://esustore.com"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
