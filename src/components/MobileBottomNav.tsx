"use client";
import { Home, Search, ShoppingBag, User, Gamepad2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Button } from './ui/button';
import { useState } from 'react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { User as UserType } from '@/payload-types';
import Link from "next/link";

interface MobileBottomNavProps {
  user: UserType | null;
}

const bottomNavItems = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Search",
    icon: Search,
    href: "/search",
    isSheet: true,
  },
  {
    label: "Games",
    icon: Gamepad2,
    href: "/discover",
  },
  {
    label: "Cart",
    icon: ShoppingBag,
    href: "/cart",
  },
  {
    label: "Account",
    icon: User,
    href: "/account",
  },
];

export default function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { items } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleNavigation = (route: { href: string, requiresAuth?: boolean }) => {
    if (route.requiresAuth && !user) {
      router.push(`/sign-in?origin=${route.href}`);
      return;
    }
    router.push(route.href);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearching(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-600 md:hidden">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.isSheet) {
              return (
                <Sheet key={item.label}>
                  <SheetTrigger asChild>
                    <button
                      className={cn(
                        "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                        {
                          "bg-gray-50 dark:bg-gray-700/50": isActive,
                        }
                      )}
                    >
                      <item.icon
                        className={cn("w-6 h-6", {
                          "text-zinc-600 dark:text-zinc-400": isActive,
                          "text-gray-500 dark:text-gray-400": !isActive,
                        })}
                      />
                      <span
                        className={cn("text-xs", {
                          "text-zinc-600 dark:text-zinc-400": isActive,
                          "text-gray-500 dark:text-gray-400": !isActive,
                        })}
                      >
                        {item.label}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-96">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-4">
                        <div className="flex items-center gap-4">
                          <Search className="w-4 h-4 text-gray-500" />
                          <Input
                            id="search"
                            placeholder="Search products..."
                            className="col-span-3"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <Button onClick={handleSearch}>Search</Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                  {
                    "bg-gray-50 dark:bg-gray-700/50": isActive,
                  }
                )}
              >
                <item.icon
                  className={cn("w-6 h-6", {
                    "text-zinc-600 dark:text-zinc-400": isActive,
                    "text-gray-500 dark:text-gray-400": !isActive,
                  })}
                />
                <span
                  className={cn("text-xs", {
                    "text-zinc-600 dark:text-zinc-400": isActive,
                    "text-gray-500 dark:text-gray-400": !isActive,
                  })}
                >
                  {item.label}
                </span>
                {item.label === "Cart" && items.length > 0 && (
                  <span className="absolute top-1 right-1/4 rounded-full bg-zinc-600 px-1.5 py-0.5 text-xs text-white">
                    {items.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Search Sheet */}
      <Sheet open={isSearching} onOpenChange={setIsSearching}>
        <SheetContent side="top" className="h-full w-full p-0">
          <div className="sticky top-0 bg-white p-4 border-b">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-500">
                Press enter to search for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-2">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Gift Sets'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch();
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Add padding to main content to account for bottom nav */}
      <div className="pb-16 lg:pb-0" />
    </>
  );
}