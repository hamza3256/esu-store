"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import NavbarRight from "./NavbarRight";
import { usePathname } from "next/navigation";
import { User } from "@/payload-types";
import { cn } from "@/lib/utils";
import SearchBar from "./SearchBar";

interface NavbarProps {
  user: User | null; // User is passed from server-side as a prop
}

const Navbar = ({ user }: NavbarProps) => {
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Using useCallback to define handleScroll
  const handleScroll = useCallback(() => {
    if (isHome && typeof window !== "undefined" && !isMenuOpen) {
      setIsTransparent(window.scrollY === 0);
    }
  }, [isHome, isMenuOpen]);

  useEffect(() => {
    const home = pathname === "/";
    setIsHome(home);
    setIsTransparent(home && window.scrollY === 0);

    const onScroll = () => handleScroll();
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, handleScroll, isMenuOpen]);

  return (
    <div
      className={`sticky top-0 inset-x-0 h-16 z-50 transition-colors duration-300 shadow-md ${
        isTransparent && !isHovered && !isMenuOpen // Disable transparent background when the menu is open
          ? "bg-transparent text-white"
          : "bg-white text-gray-800"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header className="relative">
        <MaxWidthWrapper>
          <div
            className={cn(
              "border-b border-transparent hover:border-gray-300 transition-all duration-300",
              `${isTransparent && !isHovered && !isMenuOpen ? "text-white" : "text-black"}`
            )}
          >
            <div className="flex h-16 items-center justify-between transition-all duration-300 relative">
              {/* Mobile Navigation Menu (left for mobile) */}
              <div className="lg:hidden flex items-center">
                <MobileNav setIsMenuOpen={setIsMenuOpen} /> {/* Pass the menu state handler */}
              </div>

              {/* Logo (left for larger screens, centered on mobile) */}
              <Link
                href="/"
                className="lg:static absolute left-1/2 transform -translate-x-1/2 lg:transform-none flex items-center lg:left-0"
              >
                <div className="h-20 w-auto">
                  {isTransparent && !isHovered && !isMenuOpen ? (
                    <Icons.logoWhite className="text-white h-20 w-auto" />
                  ) : (
                    <Icons.logoBlack className="text-black h-20 w-auto" />
                  )}
                </div>
              </Link>

              <div className="hidden z-50 lg:ml-8 lg:block lg:self-stretch">
                <NavItems isTransparent={isTransparent} isHovered={isHovered} />
              </div>

              {/* For large devices */}
              <div className="hidden lg:block flex-grow max-w-xl mx-4">
                <SearchBar isTransparent={isTransparent} isHovered={isHovered} isMobile={false} />
              </div>

              {/* For mobile */}
              <div className="lg:hidden">
                <SearchBar isTransparent={isTransparent} isHovered={isHovered} isMobile={true} />
              </div>

              <div className="ml-auto flex items-center space-x-4">
                <NavbarRight
                  user={user}
                  isTransparent={isTransparent}
                  isHovered={isHovered}
                />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
