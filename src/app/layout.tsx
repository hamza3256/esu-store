import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerSideUser } from "@/lib/payload-utils";
import { Toaster as ToasterUI } from "@/components/ui/toaster";
import FreeShippingPopup from "@/components/FreeShippingPopup";
import { Toaster } from "@/components/ui/sonner";
import TopBanner from "@/components/TopBanner";

export const metadata: Metadata = {
  title: "ESÜ Store | Jewellery, Clothing & Accessories",
  description:
    "Discover premium Jewellery, clothing, and accessories at ESU Store. Every product is handpicked and verified for quality, ensuring you receive only the finest pieces. Shop our exclusive collection today and elevate your style with high-quality, affordable fashion and accessories.",
  openGraph: {
    title: "ESÜ Store | Jewellery, Clothing & Accessories",
    description:
      "Discover premium Jewellery, clothing, and accessories at ESU Store. Shop our handpicked, high-quality products and elevate your style today.",
    url: "https://esu.london",
    siteName: "ESÜ Store",
    images: [
      {
        url: "https://esu.london/esu.png",
        width: 1200,
        height: 630,
        alt: "ESÜ Store - Jewellery, Clothing, and Accessories",
      },
      {
        url: "https://esu.london/esu-official.jpg", 
        width: 1080,
        height: 1080,
        alt: "ESÜ Store - Jewellery, Clothing, and Accessories (Instagram optimized)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ESÜ Store | Jewellery, Clothing & Accessories",
    description:
      "Discover premium Jewellery, clothing, and accessories at ESÜ Store. Shop our handpicked, high-quality products and elevate your style today.",
    images: ["https://esu.london/esu.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  const openGraphImages = Array.isArray(metadata.openGraph?.images)
    ? metadata.openGraph.images
    : [];

  return (
    <html lang="en" className="h-full">
      <head>
        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1304672607214046');
              fbq('track', 'PageView');
            `,
          }}
          async
        />
        
        {/* Plausible Analytics */}
        <script
          defer
          data-domain="esu.london"
          src="https://plausible.io/js/script.js"
        />

        {/* Rest of your head content */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1304672607214046&ev=PageView&noscript=1"
          />
        </noscript>
        <link rel="icon" href="https://esu.london/favicon.ico" type="image/x-icon" />
        <meta name="description" content={metadata.description ?? undefined} />
        <meta
          property="og:title"
          content={metadata.openGraph?.title?.toString() ?? undefined}
        />
        <meta
          property="og:description"
          content={metadata.openGraph?.description ?? undefined}
        />
        <meta
          property="og:url"
          content={metadata.openGraph?.url?.toString() ?? undefined}
        />
        <meta
          property="og:image"
          content="https://esu.london/esu-official.jpg"
        />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="1080" />
        <meta property="og:image:alt" content="ESÜ Store - Jewellery, Clothing, and Accessories" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.twitter?.title?.toString() ?? undefined} />
        <meta name="twitter:description" content={metadata.twitter?.description ?? undefined} />
        <meta name="twitter:image" content="https://esu.london/esu.png" />
      </head>

      <body className={cn("relative h-full font-sans antialiased")}>
        <main className="relative flex flex-col min-h-screen">
          <Providers>
            <TopBanner />
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
