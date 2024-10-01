'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronRight, X, Grid } from 'lucide-react';
import { PRODUCT_CATEGORIES, CategoryType } from '@/config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useJewelleryProducts } from '@/hooks/use-category';

interface MobileNavProps {
  setIsMenuOpen: (isOpen: boolean) => void;
}

export default function MobileNav({ setIsMenuOpen }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { products, isLoading } = useJewelleryProducts();

  const updatedCategories: CategoryType[] = PRODUCT_CATEGORIES.map((category) => {
    if (category.value === 'jewellery') {
      return {
        ...category,
        featured: isLoading
          ? category.featured
          : products.map((product: any) => ({
              name: product.name,
              href: `/product/${product.id}`,
              imageSrc: product.images[0]?.image.sizes?.thumbnail?.url || '/fallback.jpg',
            })),
      };
    }
    return category;
  });

  useEffect(() => {
    setIsOpen(false);
    setIsMenuOpen(false);
  }, [pathname, setIsMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(isOpen);
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen, setIsMenuOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Close menu</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <Link
              href="/products"
              className="flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 border-b"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center">
                <Grid className="h-5 w-5 mr-2" />
                All Products
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Accordion type="single" collapsible className="w-full">
              {updatedCategories.map((category) => (
                <AccordionItem value={category.label} key={category.label} className="border-b">
                  <AccordionTrigger className="text-sm font-medium px-4 py-3 hover:bg-gray-50">
                    {category.label}
                  </AccordionTrigger>
                  <AccordionContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {category.value === 'clothing' || category.value === 'accessories' ? (
                        <div className="flex items-center justify-center col-span-2 text-gray-500 py-8">
                          Coming Soon
                        </div>
                      ) : (
                        category.featured.map((item, index) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="group flex flex-col items-center text-center"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="relative h-32 w-full overflow-hidden rounded-lg mb-2">
                              <Image
                                src={item.imageSrc}
                                alt={`Product image of ${item.name}`}
                                fill
                                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 group-hover:bg-opacity-30" />
                            </div>
                            <span className="mt-1 text-xs font-semibold text-primary">
                              {index === 0 ? "Best Seller" : index === 1 ? "New Arrival" : "Favourite Pick"}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="border-t p-4 space-y-2">
            <Link
              href="/sign-in"
              className={cn(
                'flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted',
                pathname === '/sign-in' && 'bg-muted'
              )}
              onClick={() => setIsOpen(false)}
            >
              Sign in
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                'flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted',
                pathname === '/sign-up' && 'bg-muted'
              )}
              onClick={() => setIsOpen(false)}
            >
              Sign up
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}