"use client";

import { PRODUCT_CATEGORIES } from "@/config";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Category = (typeof PRODUCT_CATEGORIES)[number];

interface NavItemProps {
  category: Category;
  handleOpen: () => void;
  isOpen: boolean;
  isAnyOpen: boolean;
  isTransparent: boolean;
  isHovered: boolean;
  closeMenu: () => void; // Function to close the dropdown menu
}

const NavItem = ({
  isAnyOpen,
  category,
  handleOpen,
  isOpen,
  isTransparent,
  isHovered,
  closeMenu,
}: NavItemProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter(); // Use Next.js router for programmatic navigation

  // Add keyboard navigation: Close menu on "Escape" key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  // Clear the timeout when the component unmounts or on menu interaction
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close the menu after a short delay when not hovered
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      closeMenu();
    }, 300); // Delay to avoid accidental closing
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleNavigation = async (href: string) => {
    // Navigate programmatically with the router
    router.push(href);

    // Once navigation is complete, close the menu
    closeMenu();
  };

  return (
    <div
      className="flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave} // Close on mouse leave with delay
    >
      <div className="relative flex items-center">
        <Button
          className={`gap-1.5 ${
            isTransparent && !isHovered ? "text-white" : "text-black"
          }`}
          onClick={handleOpen}
          variant={isOpen ? "secondary" : "ghost"}
        >
          {category.label}
          <ChevronDown
            className={cn("h-4 w-4 transition-all text-muted-foreground", {
              "text-white": isTransparent && !isHovered,
              "-rotate-180": isOpen,
            })}
          ></ChevronDown>
        </Button>
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute inset-x-0 top-full text-sm text-muted-foreground",
            {
              "animate-in fade-in-10 slide-in-from-top-5": !isAnyOpen,
            }
          )}
        >
          <div
            className="absolute inset-0 top-1/2 bg-white shadow"
            aria-hidden="true"
          >
            <div className="relative bg-white">
              <div className="mx-auto max-w-7xl px-8">
                <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                  <div className="col-span-4 col-start-1 grid grid-cols-3 gap-x-8">
                    {category.featured.map((item) => (
                      <div
                        key={item.name}
                        className="group relative text-base sm:text-sm"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                          <Image
                            src={item.imageSrc}
                            alt="product category image"
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                        {/* Replace Link with a button to handle navigation */}
                        <button
                          className="mt-6 block font-medium text-gray-900"
                          onClick={() => handleNavigation(item.href)} // Use the custom handler
                        >
                          {item.name}
                        </button>
                        <p className="mt-1" aria-hidden="true">
                          Shop now
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavItem;
