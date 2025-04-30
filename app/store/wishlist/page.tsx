"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/lib/cart-provider"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, Trash2, ChevronLeft, AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function WishlistPage() {
  const { wishlist, removeItem } = useWishlist()
  const { addToCart } = useCart()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleRemoveFromWishlist = (id: string) => {
    removeItem(id)
    toast({
      description: "Item removed from wishlist",
    })
  }

  const handleAddToCart = (item: any) => {
    // Create a product object that matches the expected format
    const product = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || "",
      stock: 0 // Default value since wishlist items might not have stock info
    }
    
    // Add to cart using the correct method
    addToCart(product, 1)
    
    // Remove the item from wishlist after adding to cart
    removeItem(item.id)
    toast({
      description: "Item added to cart and removed from wishlist",
    })
  }

  // If the component hasn't mounted yet, show a loading skeleton
  if (!isMounted) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse dark:bg-gray-800" />
            <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-md dark:shadow-gray-800">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse dark:bg-gray-800" />
                  <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse dark:bg-gray-800" />
                  <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
              <p className="text-muted-foreground">
                {wishlist.length === 0
                  ? "Your wishlist is empty"
                  : `${wishlist.length} item${wishlist.length > 1 ? "s" : ""} saved in your wishlist`}
              </p>
            </div>
            <Link href="/store/products">
              <Button variant="outline" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="relative w-20 h-20">
              <Heart className="w-full h-full text-gray-200 dark:text-gray-800" />
              <AlertCircle className="w-8 h-8 text-muted-foreground absolute top-6 left-6" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
              <p className="text-muted-foreground">
                Browse our products and add items to your wishlist for quick access later.
              </p>
            </div>
            <Link href="/store/products">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group overflow-hidden h-full flex flex-col">
                    <Link href={`/store/products/${item.id}`} className="relative">
                      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm dark:bg-black/50 hover:bg-white dark:hover:bg-black cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemoveFromWishlist(item.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                      </Badge>
                    </Link>
                    <CardContent className="flex-1 p-4">
                      <div className="space-y-1">
                        <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                          {item.category}
                        </Badge>
                        <h3 className="font-medium text-lg line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                      <p className="font-semibold text-lg">{formatCurrency(item.price)}</p>
                      <Button
                        size="sm"
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" /> Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}