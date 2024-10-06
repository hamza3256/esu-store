import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerSideUser } from "@/lib/payload-utils";
import { Toaster as ToasterUI } from "@/components/ui/toaster";
import FreeShippingPopup from "@/components/FreeShippingPopup";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ESÜ Store | Jewelry, Clothing & Accessories",
  description: "Discover premium jewelry, clothing, and accessories at ESU Store. Every product is handpicked and verified for quality, ensuring you receive only the finest pieces. Shop our exclusive collection today and elevate your style with high-quality, affordable fashion and accessories.",
  openGraph: {
    title: "ESÜ Store | Jewelry, Clothing & Accessories",
    description: "Discover premium jewelry, clothing, and accessories at ESU Store. Shop our handpicked, high-quality products and elevate your style today.",
    url: "https://esustore.com",
    siteName: "ESÜ Store",
    images: [
      {
        url: "https://esustore.com/esu.png", // Ensure this is at least 1080x1080 for Instagram compatibility
        width: 1200,
        height: 630,
        alt: "ESÜ Store - Jewelry, Clothing, and Accessories",
      },
      {
        url: "https://esustore.com/esu-instagram.png", // Additional square image for better Instagram preview
        width: 1080,
        height: 1080,
        alt: "ESÜ Store - Jewelry, Clothing, and Accessories (Instagram optimized)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ESÜ Store | Jewelry, Clothing & Accessories",
    description: "Discover premium jewelry, clothing, and accessories at ESÜ Store. Shop our handpicked, high-quality products and elevate your style today.",
    images: ["https://esustore.com/esu.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="https://esustore.com/favicon.ico" type="image/x-icon" />
        <meta name="description" content={metadata.description ?? undefined} />
        <meta property="og:title" content={metadata.openGraph?.title?.toString() ?? undefined} />
        <meta property="og:description" content={metadata.openGraph?.description ?? undefined} />
        <meta property="og:url" content={metadata.openGraph?.url?.toString() ?? undefined} />
        <meta property="og:site_name" content={metadata.openGraph?.siteName ?? undefined} />
        <meta property="og:type" content={"website" ?? undefined} />
        <meta property="og:image" content={"https://esustore.com/esu-official.jpg" ?? undefined} />
      
        <meta name="twitter:card" content={metadata.twitter?.creator ?? undefined} />
        <meta name="twitter:title" content={metadata.twitter?.title?.toString() ?? undefined} />
        <meta name="twitter:description" content={metadata.twitter?.description ?? undefined} />
        <meta name="twitter:image" content={"https://esustore.com/esu.png" ?? undefined} />
      </head>
      <body className={cn("relative h-full font-sans antialiased")}>
        <main className="relative flex flex-col min-h-screen">
          <Providers>
            <Navbar user={user} />
            <div className="flex-grow flex-1">
              {children}
              <FreeShippingPopup />
            </div>
            <Footer />
          </Providers>
        </main>
        <ToasterUI />
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
