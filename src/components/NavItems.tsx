"use client";

import { PRODUCT_CATEGORIES } from "@/config";
import { useEffect, useRef, useState } from "react";
import NavItem from "./NavItem";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { useJewelleryProducts } from "@/hooks/use-category"; // Dynamic jewellery update example
import { Media } from "@/payload-types";

const NavItems = ({
  isTransparent,
  isHovered,
}: {
  isTransparent: boolean;
  isHovered: boolean;
}) => {
  const [activeIndex, setActiveIndex] = useState<null | number>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  
  // Use for dynamic updates to the jewellery category (e.g., using hooks)
  const { products, isLoading } = useJewelleryProducts();

  // Updating PRODUCT_CATEGORIES dynamically based on products fetched for jewellery
  const updatedCategories = PRODUCT_CATEGORIES.map((category) => {
    if (category.value === "jewellery") {
      return {
        ...category,
        featured: isLoading
          ? category.featured
          : products.map((product: any) => ({
              name: product.name,
              href: `/product/${product.id}`,
              imageSrc: product.images.find(({ image } : {image: Media}) => {
                return typeof image === "object" && image.mimeType?.startsWith("image/");
              })?.image.sizes?.card?.url || "/fallback.jpg",
            })),
      };
    }
    return category;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        setActiveIndex(null);
      } else if (e.key === "ArrowRight" && activeIndex !== null) {
        setActiveIndex((prevIndex) => (prevIndex === updatedCategories.length - 1 ? 0 : (prevIndex ?? 0) + 1));
      } else if (e.key === "ArrowLeft" && activeIndex !== null) {
        setActiveIndex((prevIndex) => (prevIndex === 0 ? updatedCategories.length - 1 : (prevIndex ?? 0) - 1));
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeIndex, updatedCategories.length]);

  const isAnyOpen = activeIndex !== null;

  useOnClickOutside(navRef, () => setActiveIndex(null));

  return (
    <div className="flex gap-4 h-full" ref={navRef}>
      {updatedCategories.map((category, i) => {
        const handleOpen = () => {
          if (activeIndex == i) {
            setActiveIndex(null);
          } else {
            setActiveIndex(i);
          }
        };

        const isOpen = i === activeIndex;

        return (
          <NavItem
            category={category}
            handleOpen={handleOpen}
            isOpen={isOpen}
            key={category.value}
            isAnyOpen={isAnyOpen}
            isTransparent={isTransparent}
            isHovered={isHovered}
          />
        );
      })}
    </div>
  );
};

export default NavItems;
