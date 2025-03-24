export interface CategoryType {
  label: string;
  value: string;
  featured: {
    name: string;
    href: string;
    imageSrc: string;
  }[];
}

export const PRODUCT_CATEGORIES = [
  {
    label: "Jewellery",
    value: "jewellery" as const,
    featured: [
      {
        name: "Favourite Jewellery Picks",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
      {
        name: "New Arrivals",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
      {
        name: "Bestselling Jewelleries",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
    ],
  },
  {
    label: "Clothing",
    value: "clothing" as const,
    featured: [
      {
        name: "Most popular",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
      {
        name: "New Arrivals",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
      {
        name: "Bestsellers",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
    ],
  },
  
  {
    label: "Accessories",
    value: "accessories" as const,
    featured: [
      {
        name: "Favourite Accessories Pick",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
      {
        name: "New Arrivals",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
      {
        name: "Bestselling Accessories",
        href: "#",
        imageSrc: "/nav/coming-soon.png",
      },
    ],
  },
];
