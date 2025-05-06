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
              <Badge variant="outline" className="border-[#F7CAD0] bg-[#F7CAD0]/10 text-[#9D8189]">
                <Award className="mr-1 h-3.5 w-3.5 text-[#FF8C94]" />
                Best Sellers
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#9D8189]">Most Popular Products</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Our customers' favorites and most frequently purchased beauty products
              </p>
            </div>
            <Link href="/store/products" className="mt-4 md:mt-0">
              <Button variant="link" className="gap-1 text-[#FF8C94] hover:text-[#FF7680]">
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

      {/* Categories Section */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-[#FFE5D9] bg-[#FFE5D9]/30 text-[#9D8189] mb-3">
              Categories
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Shop By Category</h2>
            <p className="max-w-[600px] mx-auto mt-3 text-muted-foreground">
              Explore our wide range of beauty products, organized to help you find exactly what you need
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Link href="/store/products?category=skincare" className="group">
              <Card className="overflow-hidden border-border hover:border-primary/60 transition-all hover:shadow-md">
                <div className="relative aspect-square bg-card">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-primary/30 p-4 mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h3 className="text-xl font-medium text-foreground">Skincare</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Cleansers, moisturizers, serums, and more
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link href="/store/products?category=makeup" className="group">
              <Card className="overflow-hidden border-border hover:border-primary/60 transition-all hover:shadow-md">
                <div className="relative aspect-square bg-card">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-secondary/30 p-4 mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">💄</span>
                    </div>
                    <h3 className="text-xl font-medium text-foreground">Makeup</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Foundations, lipsticks, eyeshadows, and more
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link href="/store/products?category=haircare" className="group">
              <Card className="overflow-hidden border-border hover:border-primary/60 transition-all hover:shadow-md">
                <div className="relative aspect-square bg-card">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-tertiary/30 p-4 mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">💇‍♀️</span>
                    </div>
                    <h3 className="text-xl font-medium text-foreground">Haircare</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Shampoos, conditioners, treatments, and more
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link href="/store/products?category=fragrance" className="group">
              <Card className="overflow-hidden border-border hover:border-primary/60 transition-all hover:shadow-md">
                <div className="relative aspect-square bg-card">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-quaternary/30 p-4 mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">🌸</span>
                    </div>
                    <h3 className="text-xl font-medium text-foreground">Fragrance</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Perfumes, mists, and scented body care
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#9D8189]">Why Choose Us</h2>
            <p className="max-w-[600px] mx-auto mt-3 text-muted-foreground">
              We're committed to providing you with the best beauty products and experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-[#F7CAD0]/20 hover:border-[#F7CAD0]/60 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto rounded-full bg-[#F7CAD0]/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-[#F7CAD0]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#9D8189]">Quality Products</h3>
                <p className="text-sm text-muted-foreground">
                  Carefully curated selection of premium beauty products
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#F7CAD0]/20 hover:border-[#F7CAD0]/60 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto rounded-full bg-[#FFE5D9]/20 p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-7 w-7 text-[#FFE5D9]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#9D8189]">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Free shipping on all orders over $50
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#F7CAD0]/20 hover:border-[#F7CAD0]/60 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto rounded-full bg-[#CAD2C5]/20 p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <Star className="h-7 w-7 text-[#CAD2C5]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#9D8189]">Loyalty Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Earn points with every purchase for future discounts
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#F7CAD0]/20 hover:border-[#F7CAD0]/60 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto rounded-full bg-[#E8DFF5]/30 p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <Heart className="h-7 w-7 text-[#E8DFF5]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#9D8189]">Cruelty-Free</h3>
                <p className="text-sm text-muted-foreground">
                  We only carry products that are not tested on animals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      {/* <section className="w-full py-16 md:py-24 bg-[#9D8189]/5">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#9D8189] mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter for exclusive offers, beauty tips, and new product announcements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded-md border border-[#F7CAD0]/30 focus:outline-none focus:ring-2 focus:ring-[#F7CAD0]"
            />
            <Button className="beauty-cta-button">
              Subscribe
            </Button>
          </div>
        </div>
      </section> */}
    </div>
  )
}
