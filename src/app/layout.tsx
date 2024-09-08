import { useEffect } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";
import { getServerSideUser } from "@/lib/payload-utils";
import { fetchUser } from "@/lib/server-utils";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await fetchUser();

  return (
    <html lang="en" className="h-full">
      <body
        className="relative h-full font-sans antialiased"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <main className="relative flex flex-col min-h-screen">
          <Providers>
            <Navbar user={user} />
            <div className="flex-grow flex-1">{children}</div>
            <Footer />
          </Providers>
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
