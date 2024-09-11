"use client";

import { buttonVariants } from "./ui/button";
import Cart from "./Cart";
import UserAccountNav from "./UserAccountNav";
import Link from "next/link";
import { User } from "@/payload-types";
import { cn } from "@/lib/utils";
import { ShoppingCart, User as UserIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

const NavbarRight = ({
  user,
  isTransparent,
  isHovered,
}: {
  user: User | null;
  isTransparent: boolean;
  isHovered: boolean;
}) => {
  const isMobile = useMediaQuery("(max-width: 1024px)"); // Check if screen size is mobile

  return (
    <div className="ml-auto flex items-center space-x-4 lg:space-x-6">
      {isMobile ? (
        <>
          {/* Mobile Icons */}
          <div className="flex items-center space-x-3">
            {/* Cart icon for mobile, using the Cart component */}
            
            {user ? (
              // UserAccountNav on mobile if the user is logged in
              <UserAccountNav user={user} />
            ) : (
              <Link
                href="/sign-in"
                className={cn(
                  "relative inline-flex items-center p-2 hover:text-gray-400 transition-colors",
                  `${isTransparent && !isHovered ? "text-gray-400" : "text-gray-800"}`
                )}
              >
                <UserIcon className="h-7 w-7" aria-hidden="true" />
              </Link>
            )}

            <Cart isTransparent={isTransparent} isHovered={isHovered}/> 
          </div>
        </>
      ) : (
        <>
          {/* Desktop Icons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {user ? null : (
              <Link
                href="/sign-in"
                className={cn(
                  `${isTransparent && !isHovered ? "text-white" : "text-black"}`,
                  buttonVariants({ variant: "ghost" })
                )}
              >
                Sign in
              </Link>
            )}

            {user ? null : (
              <span
                className={cn(
                  "h-6 w-px bg-gray-200",
                  `${isTransparent && !isHovered ? "bg-gray-400" : "bg-gray-200"}`
                )}
                aria-hidden="true"
              />
            )}

            {user ? (
              <UserAccountNav user={user} />
            ) : (
              <Link
                href="/sign-up"
                className={cn(
                  `${isTransparent && !isHovered ? "text-white" : "text-black"}`,
                  buttonVariants({ variant: "ghost" })
                )}
              >
                Create Account
              </Link>
            )}

            {/* Cart icon for desktop, opens the cart */}
            <Cart isTransparent={isTransparent} isHovered={isHovered}/>
          </div>
        </>
      )}
    </div>
  );
};

export default NavbarRight;
