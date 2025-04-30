"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Product } from "@/lib/db"

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    })
  }

  return (
    <>
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium">{quantity}</span>
        <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= product.stock}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={product.stock === 0}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </>
  )
} 