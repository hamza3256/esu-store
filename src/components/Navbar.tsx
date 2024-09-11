"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import NavbarRight from "./NavbarRight";
import { usePathname } from "next/navigation";
import { User } from "@/payload-types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: User | null; // User is passed from server-side as a prop
}

const Navbar = ({ user } : NavbarProps) => {
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(false);  // Initial false state, no assumption of being on the home page during SSR
  const [isTransparent, setIsTransparent] = useState(false);  // Same as above for transparency
  const [isHovered, setIsHovered] = useState(false);
  
  const handleScroll = () => {
    if (isHome && typeof window !== "undefined") {  // Ensure window is defined
      setIsTransparent(window.scrollY === 0);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const home = pathname === "/";
      setIsHome(home);
      setIsTransparent(home && window.scrollY === 0);

      const onScroll = () => handleScroll();
      window.addEventListener("scroll", onScroll);

      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener("scroll", onScroll);
      };
    }
  }, [pathname, isHome]);

  return (
    <div
      className={`sticky top-0 inset-x-0 h-16 z-30 transition-colors duration-300 ${
        isTransparent && !isHovered ? "bg-transparent" : "bg-white"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header className="relative">
        <MaxWidthWrapper>
          <div
            className={cn(
              "border-b border-transparent hover:border-gray-300 transition-all duration-300",
              `${isTransparent && !isHovered ? "text-white" : "text-black border-transparent"}`
            )}
          >
            <div className="flex h-16 items-center transition-all duration-300">
              <MobileNav />
              <div className="ml-auto flex items-center lg:ml-0">
                <Link href="/">
                  <div className="h-20 w-20">
                    {isTransparent && !isHovered ? (
                      <Icons.logoWhite className="text-white h-20 w-20" />
                    ) : (
                      <Icons.logoBlack className="text-black h-20 w-20" />
                    )}
                  </div>
                </Link>
              </div>
              <div className="hidden z-50 lg:ml-8 lg:block lg:self-stretch">
                <NavItems isTransparent={isTransparent} isHovered={isHovered} />
              </div>
              <NavbarRight user={user} isTransparent={isTransparent} isHovered={isHovered} />
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
