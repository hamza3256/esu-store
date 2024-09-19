"use client";

import { usePathname } from "next/navigation";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react"; // Modern icons

const Footer = () => {
  const pathname = usePathname();
  const pathsToMinimize = ["/verify-email", "/sign-up", "/sign-in"];

  return (
    <footer className="bg-black text-white py-8">
      <MaxWidthWrapper>
        {/* Logo and Call to Action */}
        {!pathsToMinimize.includes(pathname) && (
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col items-center space-y-6 lg:flex-row lg:justify-between lg:space-y-0">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start">
                <Icons.logoWhite className="h-10 w-auto" />
              </div>

              {/* Become a Seller CTA */}
              <div className="text-center lg:text-left">
                <h3 className="font-semibold text-2xl">Become a Seller</h3>
                <p className="mt-1 text-gray-400 text-sm">
                  Interested in selling high-quality products?{" "}
                  <Link
                    href="/sign-in?as=seller"
                    className="text-blue-500 hover:underline"
                  >
                    Get started &rarr;
                  </Link>
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex space-x-6">
                <Link href="https://www.instagram.com/esustoreofficial" aria-label="Instagram">
                  <Instagram className="h-6 w-6 text-gray-400 hover:text-white transition-colors duration-200" />
                </Link>
                <Link href="https://twitter.com" aria-label="Twitter">
                  <Twitter className="h-6 w-6 text-gray-400 hover:text-white transition-colors duration-200" />
                </Link>
                <Link href="https://facebook.com" aria-label="Facebook">
                  <Facebook className="h-6 w-6 text-gray-400 hover:text-white transition-colors duration-200" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} esü. All rights reserved.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center mt-4 lg:mt-0 space-x-4">
            <Link
              href="/track-order"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Track Order
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookie-policy"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Cookie Policy
            </Link>
            <Link
              href="/help-center"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Help Center
            </Link>
            <Link
              href="/company"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Company
            </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
