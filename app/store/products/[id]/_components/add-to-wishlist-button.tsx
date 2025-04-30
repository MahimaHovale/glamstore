"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface AddToWishlistButtonProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    category: string
    image?: string
  }
  variant?: "default" | "outline" | "icon"
}

export default function AddToWishlistButton({ product, variant = "default" }: AddToWishlistButtonProps) {
  const { isInWishlist, addItem, removeItem } = useWishlist()
  const [isAdding, setIsAdding] = useState(false)
  
  const inWishlist = isInWishlist(product.id)

  const handleToggleWishlist = () => {
    setIsAdding(true)
    
    try {
      if (inWishlist) {
        removeItem(product.id)
        toast({
          description: "Product removed from wishlist",
        })
      } else {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || "",
          category: product.category,
          description: product.description
        })
        toast({
          description: "Product added to wishlist",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update wishlist",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  if (variant === "icon") {
    return (
      <Button 
        size="icon" 
        variant="ghost" 
        className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
        onClick={handleToggleWishlist}
        disabled={isAdding}
      >
        <Heart 
          className={cn(
            "h-5 w-5", 
            inWishlist ? "fill-pink-500 text-pink-500" : "text-gray-700"
          )} 
        />
      </Button>
    )
  }

  return (
    <Button 
      variant={variant} 
      size="lg" 
      className={cn(
        "gap-2",
        inWishlist && variant === "outline" && "border-pink-200 text-pink-700 bg-pink-50"
      )}
      onClick={handleToggleWishlist}
      disabled={isAdding}
    >
      <Heart 
        className={cn(
          "h-5 w-5", 
          inWishlist && "fill-pink-500"
        )} 
      />
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  )
} 