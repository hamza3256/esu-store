"use client";
import { Home, Search, ShoppingBag, User, Sparkles, TrendingUp, Crown, Percent } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Button } from './ui/button';
import { useState } from 'react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { User as UserType } from '@/payload-types';

interface MobileBottomNavProps {
  user: UserType | null;
}

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

  const routes = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
    },
    {
      icon: Search,
      label: 'Search',
      onClick: () => setIsSearching(true)
    },
    {
      href: '/cart',
      icon: ShoppingBag,
      label: 'Cart',
      badge: items.length > 0 ? items.length : undefined,
    },
    {
      href: user ? '/account' : '/sign-in',
      icon: User,
      label: user ? 'Account' : 'Sign In',
      requiresAuth: true
    },
  ];

  const discoverSections = [
    {
      title: "Trending Now",
      icon: TrendingUp,
      description: "See what's hot and trending in our store",
      items: [
        { 
          name: "Best Sellers", 
          href: "/trending/best-sellers",
          description: "Our most popular items",
          image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2940&auto=format&fit=crop"
        },
        { 
          name: "Most Viewed", 
          href: "/trending/most-viewed",
          description: "Products everyone's looking at",
          image: "https://images.unsplash.com/photo-1569397288884-4d43d6738fbd?q=80&w=3018&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        { 
          name: "New Arrivals", 
          href: "/trending/new-arrivals",
          description: "Fresh additions to our collection",
          image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2940&auto=format&fit=crop"
        },
      ]
    },
    {
      title: "Premium Collection",
      icon: Crown,
      description: "Exclusive and limited edition pieces",
      items: [
        { 
          name: "Signature Series", 
          href: "/premium/signature",
          description: "Our finest craftsmanship",
          image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2940&auto=format&fit=crop"
        },
        { 
          name: "Limited Edition", 
          href: "/premium/limited-edition",
          description: "Once-in-a-lifetime pieces",
          image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        { 
          name: "Curated Sets", 
          href: "/premium/curated-sets",
          description: "Perfectly matched collections",
          image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2940&auto=format&fit=crop"
        },
      ]
    },
    {
      title: "Special Offers",
      icon: Percent,
      description: "Best deals and exclusive discounts",
      items: [
        { 
          name: "Flash Sales", 
          href: "/offers/flash-sales",
          description: "Limited-time special prices",
          image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2940&auto=format&fit=crop"
        },
        { 
          name: "Bundle Deals", 
          href: "/offers/bundles",
          description: "Save more when buying together",
          image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=2940&auto=format&fit=crop"
        },
        { 
          name: "Clearance", 
          href: "/offers/clearance",
          description: "Last chance to buy",
          image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop"
        },
      ]
    }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t lg:hidden">
        <div className="grid h-full grid-cols-5 mx-auto">
          {routes.map((route, i) => (
            <button
              key={route.label}
              onClick={() => {
                if (route.onClick) {
                  route.onClick();
                } else {
                  handleNavigation(route);
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 relative',
                pathname === route?.href ? 'text-black' : 'text-gray-500'
              )}
            >
              <route.icon className="w-6 h-6" />
              <span className="text-xs">{route.label}</span>
              {route.badge && (
                <span className="absolute top-0 right-1/4 rounded-full bg-black px-1.5 py-0.5 text-xs text-white">
                  {route.badge}
                </span>
              )}
            </button>
          ))}
          
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-black">
                <Sparkles className="w-6 h-6" />
                <span className="text-xs">Discover</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] w-full p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Discover Amazing Products</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <div className="p-4 space-y-8">
                  {discoverSections.map((section) => (
                    <div key={section.title} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <section.icon className="w-6 h-6 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                          <p className="text-sm text-gray-500">{section.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {section.items.map((item) => (
                          <SheetClose asChild key={item.name}>
                            <Button
                              variant="outline"
                              className="w-full p-0 h-auto overflow-hidden"
                              onClick={() => router.push(item.href)}
                            >
                              <div className="flex items-center w-full">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="p-4 text-left">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                              </div>
                            </Button>
                          </SheetClose>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

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