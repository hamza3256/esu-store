"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import NavbarRight from "./NavbarRight";
import { usePathname } from "next/navigation";

const Navbar = ({ user }: { user: any }) => {
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(pathname === "/");
  const [isTransparent, setIsTransparent] = useState(isHome && true);
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = () => {
    if (isHome) {
      setIsTransparent(window.scrollY === 0);
    }
  };

  useEffect(() => {
    const onScroll = () => handleScroll();
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  useEffect(() => {
    const home = pathname === "/";
    setIsHome(home);
    setIsTransparent(home && window.scrollY === 0);
  }, [pathname]);

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
          <div className="border-b border-transparent hover:border-gray-300 transition-all duration-300">
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
              <NavbarRight user={user} />
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
