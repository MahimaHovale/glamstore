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
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="space-y-3">
              <Badge variant="outline" className="border-border bg-background/80 text-foreground">
                <Award className="mr-1 h-3.5 w-3.5 text-foreground" />
                Best Sellers
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-foreground">Most Popular Products</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Our customers' favorites and most frequently purchased beauty products
              </p>
            </div>
            <Link href="/store/products" className="mt-4 md:mt-0">
              <Button variant="link" className="gap-1 text-foreground hover:text-foreground/80">
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

      {/* Why Choose Us Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-foreground">Why Choose Us</h2>
            <p className="max-w-[600px] mx-auto mt-3 text-muted-foreground">
              We're committed to providing you with the best beauty products and experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:border-foreground/20 transition-all h-full">
              <CardContent className="pt-6 text-center flex flex-col h-full">
                <div className="mx-auto rounded-full bg-background/80 p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">Quality Products</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  Carefully curated selection of premium beauty products
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-foreground/20 transition-all h-full">
              <CardContent className="pt-6 text-center flex flex-col h-full">
                <div className="mx-auto rounded-full bg-background/80 p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">Free Shipping</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  Free shipping on all orders over Rs50
                </p>
              </CardContent>
            </Card>  
            <Card className="border-border hover:border-foreground/20 transition-all h-full">
              <CardContent className="pt-6 text-center flex flex-col h-full">
                <div className="mx-auto rounded-full bg-background/80 p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <Heart className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">Cruelty-Free</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  We only carry products that are not tested on animals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  )
}
