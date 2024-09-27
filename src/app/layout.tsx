import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import { cn, constructMetadata } from "@/lib/utils"
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerSideUser } from "@/lib/payload-utils";
import { Toaster } from "@/components/ui/sonner"
import FreeShippingPopup from "@/components/FreeShippingPopup";

export const metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  return (
    <html lang="en" className="h-full">
      <body
        className={cn("relative h-full font-sans antialiased")} // No need for inter.className
      >
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
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
