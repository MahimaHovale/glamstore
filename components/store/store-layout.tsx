"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Home, ShoppingBag, User, Menu, X, Search, Heart, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle, MobileThemeToggle } from "@/components/ui/theme-toggle"

interface StoreLayoutProps {
  children: React.ReactNode
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { user, isSignedIn } = useUser()
  const { cart } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: "Home", href: "/store", icon: Home },
    { name: "Products", href: "/store/products", icon: ShoppingBag },
    { name: "Account", href: "/store/account", icon: User },
  ]

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          isScrolled 
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b dark:border-gray-800" 
            : "bg-transparent"
        )}
      >
        <div className="container px-4 mx-auto">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/store" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">GlamStore</span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors",
                    pathname === item.href 
                      ? "text-pink-600 font-semibold" 
                      : "text-muted-foreground hover:text-pink-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <form className="relative" onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input');
                if (searchInput && searchInput.value.trim()) {
                  router.push(`/store/products?search=${encodeURIComponent(searchInput.value.trim())}`);
                }
              }}>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  name="search"
                  placeholder="Search products..." 
                  className="w-[200px] pl-8 rounded-full border-muted focus:border-pink-300 focus:ring-pink-200 dark:border-gray-700 dark:focus:border-pink-800 dark:focus:ring-pink-900" 
                />
              </form>
              
              <Link href="/store/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/store/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className={cn(
                    "h-5 w-5",
                    totalItems > 0 && "text-pink-600 animate-bounce"
                  )} />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-pink-500 text-white shadow-sm">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {user?.publicMetadata?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" className="text-sm gap-2 border-pink-200 hover:bg-pink-50 dark:border-pink-900 dark:hover:bg-pink-950">
                    <User className="h-4 w-4" />
                    Admin Portal
                  </Button>
                </Link>
              )}

              {!isSignedIn && (
                <Link href="/sign-in">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                    Sign In
                  </Button>
                </Link>
              )}

              <ThemeToggle />
              {isSignedIn && <UserButton />}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-3">
              <Link href="/store/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/store/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className={cn(
                    "h-5 w-5",
                    totalItems > 0 && "text-pink-600 animate-bounce"
                  )} />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-pink-500 text-white shadow-sm">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                  <SheetHeader className="border-b p-4">
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 px-4 flex flex-col h-full">
                    <div className="mb-6">
                      <form className="relative" onSubmit={(e) => {
                        e.preventDefault();
                        const searchInput = e.currentTarget.querySelector('input');
                        if (searchInput && searchInput.value.trim()) {
                          router.push(`/store/products?search=${encodeURIComponent(searchInput.value.trim())}`);
                          // Close the mobile menu sheet after search
                          const closeButton = document.querySelector('[data-sheet-close]');
                          if (closeButton && closeButton instanceof HTMLElement) {
                            closeButton.click();
                          }
                        }
                      }}>
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="search" 
                          name="search"
                          placeholder="Search products..." 
                          className="w-full pl-8 rounded-full" 
                        />
                      </form>
                    </div>
                    
                    {/* Main Navigation Links */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">Main Menu</h3>
                      <nav className="grid gap-1">
                        {navigation.map((item) => (
                          <SheetClose asChild key={item.name}>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                pathname === item.href
                                  ? "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400"
                                  : "text-muted-foreground hover:bg-muted hover:text-pink-600 dark:hover:text-pink-400"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              {item.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </nav>
                    </div>
                    
                    {/* User Account Section */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">Account</h3>
                      
                      {isSignedIn ? (
                        <div className="space-y-3">
                          {/* User info */}
                          <div className="flex items-center gap-3 px-3 py-2">
                            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-pink-600" />
                            </div>
                            <span className="text-base font-medium">{user?.firstName || 'User'}</span>
                          </div>
                          
                          {/* Admin Dashboard button */}
                          {user?.publicMetadata?.role === 'admin' && (
                            <SheetClose asChild>
                              <Link href="/admin" className="block px-3">
                                <Button variant="outline" className="w-full justify-start gap-2 border-pink-200 hover:bg-pink-50 dark:border-pink-900 dark:hover:bg-pink-950">
                                  <User className="h-5 w-5" />
                                  Admin Dashboard
                                </Button>
                              </Link>
                            </SheetClose>
                          )}
                          
                          {/* Always show Sign Out button */}
                          <SheetClose asChild>
                            <div className="px-3">
                              <SignOutButton>
                                <Button 
                                  variant="destructive" 
                                  className="w-full justify-start gap-2"
                                >
                                  <LogOut className="h-5 w-5" />
                                  Sign Out
                                </Button>
                              </SignOutButton>
                            </div>
                          </SheetClose>
                        </div>
                      ) : (
                        <div className="px-3">
                          <SheetClose asChild>
                            <Link href="/sign-in" className="block w-full">
                              <Button 
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                              >
                                Sign In
                              </Button>
                            </Link>
                          </SheetClose>
                        </div>
                      )}
                    </div>
                    
                    {/* Theme Toggle */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">Appearance</h3>
                      <div className="px-3">
                        <MobileThemeToggle />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">GlamStore</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Premium beauty products curated for your unique style.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-pink-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-pink-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-pink-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/store" className="text-sm text-muted-foreground hover:text-pink-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/store/products" className="text-sm text-muted-foreground hover:text-pink-600">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/store/account" className="text-sm text-muted-foreground hover:text-pink-600">
                    Account
                  </Link>
                </li>
                <li>
                  <Link href="/store/cart" className="text-sm text-muted-foreground hover:text-pink-600">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for the latest updates and offers.
              </p>
              <form className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="rounded-l-md dark:bg-gray-800 dark:border-gray-700" 
                />
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center dark:border-gray-800">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} GlamStore. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-pink-600">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-pink-600">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-pink-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
