export const PRODUCT_CATEGORIES = [
  {
    label: "Clothing",
    value: "clothing" as const,
    featured: [
      {
        name: "Editor picks",
        href: "#",
        imageSrc: "/nav/clothings/mixed.jpg",
      },
      {
        name: "New Arrivals",
        href: "#",
        imageSrc: "/nav/clothings/blue.jpg",
      },
      {
        name: "Bestsellers",
        href: "#",
        imageSrc: "/nav/clothings/purple.jpg",
      },
    ],
  },
  {
    label: "Jewellery",
    value: "jewellery" as const,
    featured: [
      {
        name: "Favourite Jewellery Picks",
        href: "#",
        imageSrc: "/nav/jewelleries/picks.jpg",
      },
      {
        name: "New Arrivals",
        href: "#",
        imageSrc: "/nav/jewelleries/new.jpg",
      },
      {
        name: "Bestselling Jewelleries",
        href: "#",
        imageSrc: "/nav/jewelleries/bestsellers.jpg",
      },
    ],
  },
];
