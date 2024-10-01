'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronRight } from 'lucide-react';
import { PRODUCT_CATEGORIES, CategoryType } from '@/config'; // Types from the config
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useJewelleryProducts } from '@/hooks/use-category'; // Typed useJewelleryProducts hook

interface MobileNavProps {
  setIsMenuOpen: (isOpen: boolean) => void;
}

export default function MobileNav({ setIsMenuOpen }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { products, isLoading } = useJewelleryProducts(); // Hook returns typed jewellery products

  // Type for updated categories
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
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col space-y-3">
          <Accordion type="single" collapsible className="w-full">
            {updatedCategories.map((category) => (
              <AccordionItem value={category.label} key={category.label}>
                <AccordionTrigger className="text-sm font-medium">
                  {category.label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Conditional rendering for "Coming Soon" */}
                    {category.value === 'clothing' || category.value === 'accessories' ? (
                      <div className="flex items-center justify-center col-span-2 text-gray-500">
                        Coming Soon
                      </div>
                    ) : (
                      category.featured.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="group flex flex-col items-center text-center"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                            <Image
                              src={item.imageSrc}
                              alt={item.name}
                              fill
                              className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <span className="mt-2 text-sm font-medium text-gray-900">
                            {item.name}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
      </SheetContent>
    </Sheet>
  );
}
