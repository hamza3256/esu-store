"use client";

import { buttonVariants } from "./ui/button";
import Cart from "./Cart";
import UserAccountNav from "./UserAccountNav";
import Link from "next/link";
import { User } from "@/payload-types";
import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";
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

  const linkColor = isTransparent && !isHovered ? "text-white" : "text-black";
  const iconColor = isTransparent && !isHovered ? "text-gray-400" : "text-gray-800";

  return (
    <div className="ml-auto flex items-center space-x-4 lg:space-x-6">
      {isMobile ? (
        <div className="flex items-center space-x-3">

          {/* Mobile user icon or account navigation */}
          {user ? (
            <UserAccountNav user={user} />
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                "relative inline-flex items-center p-2 hover:text-gray-400 transition-colors",
                iconColor
              )}
            >
              <UserIcon className="h-7 w-7" aria-hidden="true" />
            </Link>
          )}
          <Cart isTransparent={isTransparent} isHovered={isHovered} />

        </div>
      ) : (
        <div className="hidden lg:flex lg:items-center lg:space-x-6">
          {/* Desktop Links */}
          {!user && (
            <>
              <Link
                href="/sign-in"
                className={cn(linkColor, buttonVariants({ variant: "ghost" }))}
              >
                Sign in
              </Link>

              <span
                className={cn(
                  "h-6 w-px",
                  isTransparent && !isHovered ? "bg-gray-400" : "bg-gray-200"
                )}
                aria-hidden="true"
              />
              <Link
                href="/sign-up"
                className={cn(linkColor, buttonVariants({ variant: "ghost" }))}
              >
                Create Account
              </Link>
            </>
          )}

          {/* User Account Navigation when logged in */}
          {user && <UserAccountNav user={user} />}

          {/* Cart for desktop */}
          <Cart isTransparent={isTransparent} isHovered={isHovered} />
        </div>
      )}
    </div>
  );
};

export default NavbarRight;
