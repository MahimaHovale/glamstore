import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { formatCurrency, getBestSellingProducts } from "@/lib/utils"
import { ArrowRight, ShoppingBag, Star, TrendingUp, Heart, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { StoreCarousel } from "@/components/store/carousel"

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
              <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
                <Link href={`/store/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-2 left-2 bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                      Best Seller
                    </div>
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-pink-500/20">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                      {product.category}
                    </Badge>
                    <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <p className="font-semibold text-lg">{formatCurrency(product.price)}</p>
                  <Link href={`/store/products/${product.id}`}>
                    <Button size="sm" variant="ghost" className="rounded-full hover:bg-pink-100 hover:text-pink-700">
                      <ShoppingBag className="h-4 w-4 mr-1" /> View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
