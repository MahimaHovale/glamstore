import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { formatCurrency, getBestSellingProducts } from "@/lib/utils"
import { ArrowRight, ShoppingBag, Star, TrendingUp, Heart, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { StoreCarousel } from "@/components/store/carousel"
import ProductCard from "@/components/store/product-card"

// Product interface definition
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export default async function StorePage() {
  // Fetch products and orders
  const allProducts = await db.getProducts();
  const allOrders = await db.getOrders();
  
  // Get best-selling products
  const bestSellerProducts = getBestSellingProducts(allOrders, allProducts, 8);

  return (
    <div className="flex flex-col">
      {/* Carousel Section */}
      <section className="w-full mb-8">
        <StoreCarousel />
      </section>

      {/* Best Seller Products */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="space-y-3">
              <Badge variant="outline" className="border-pink-200 text-pink-700">
                <Award className="mr-1 h-3.5 w-3.5" />
                Best Sellers
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Most Popular Products</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Our customers' favorites and most frequently purchased beauty products
              </p>
            </div>
            <Link href="/store/products" className="mt-4 md:mt-0">
              <Button variant="link" className="gap-1 text-pink-600 hover:text-pink-700">
                View All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellerProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                isBestSeller={true} 
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
