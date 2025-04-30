import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { formatCurrency, getBestSellingProducts } from "@/lib/utils"
import { ArrowRight, ShoppingBag, Star, TrendingUp, Heart, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { StoreCarousel } from "@/components/store/carousel"
import connectDB from "@/lib/mongodb"
import getSettingsModel from "@/lib/models/Settings"

// Product interface definition
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

// Function to get featured product settings from database
async function getFeaturedProductSettings() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get the Settings model
    const SettingsModel = getSettingsModel();
    
    // Find settings by key with better error handling
    const settings = await SettingsModel.findOne({ key: "featuredProducts" });
    
    if (settings && settings.value && settings.value.featuredProductIds) {
      console.log("Found featured product settings:", settings.value);
      return settings.value;
    } else {
      console.warn("Featured product settings not found or invalid format");
      return { featuredProductIds: [] };
    }
  } catch (error) {
    console.error("Error reading featured products settings:", error);
    return { featuredProductIds: [] };
  }
}

export default async function StorePage() {
  // Fetch products and orders
  const allProducts = await db.getProducts();
  const allOrders = await db.getOrders();
  
  // Get best-selling products
  const bestSellerProducts = getBestSellingProducts(allOrders, allProducts, 4);
  
  // Get featured products from settings with enhanced error handling
  let featuredProducts: Product[] = [];
  try {
    const featuredSettings = await getFeaturedProductSettings();
    const featuredProductIds = featuredSettings.featuredProductIds || [];
    console.log(`Found ${featuredProductIds.length} featured product IDs in settings`);
    
    // If we have manual featured products from settings, use those
    if (featuredProductIds.length > 0) {
      // Get featured products based on manual selection
      featuredProducts = allProducts.filter(product => 
        featuredProductIds.includes(product.id)
      );
      
      console.log(`Matched ${featuredProducts.length} products from the database`);
      
      // Preserve the order specified in the settings
      featuredProducts.sort((a, b) => {
        return featuredProductIds.indexOf(a.id) - featuredProductIds.indexOf(b.id);
      });
    } else {
      console.log("No featured product IDs found, using fallback selection");
      // Fallback: use products not in best sellers as featured
      featuredProducts = allProducts
        .filter(p => !bestSellerProducts.some(bp => bp.id === p.id))
        .slice(0, 8);
    }
  } catch (error) {
    console.error("Error processing featured products:", error);
    // Fallback in case of any error
    featuredProducts = allProducts
      .filter(p => !bestSellerProducts.some(bp => bp.id === p.id))
      .slice(0, 8);
  }

  // Make sure we have a reasonable number of featured products
  // Only limiting to 8 items instead of 4 to show more products
  if (featuredProducts.length === 0) {
    console.log("No featured products found, using top products as fallback");
    featuredProducts = allProducts.slice(0, 8);
  } else if (featuredProducts.length < 4 && allProducts.length >= 4) {
    console.log("Too few featured products, adding more from all products");
    const additionalProducts = allProducts
      .filter(p => 
        !featuredProducts.some(fp => fp.id === p.id) && 
        !bestSellerProducts.some(bp => bp.id === p.id)
      )
      .slice(0, 4 - featuredProducts.length);
    
    featuredProducts = [...featuredProducts, ...additionalProducts];
  }

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

      {/* Featured Products Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="space-y-3">
              <Badge variant="outline" className="border-pink-200 text-pink-700">
                <Star className="mr-1 h-3.5 w-3.5" />
                Featured
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Products</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Discover our specially selected beauty essentials handpicked for you
              </p>
            </div>
            <Link href="/store/products" className="mt-4 md:mt-0">
              <Button variant="link" className="gap-1 text-pink-600 hover:text-pink-700">
                View All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
                      Featured
                    </div>
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-pink-500/20">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className="font-normal text-xs text-muted-foreground dark:text-gray-300 dark:border-gray-600">
                      {product.category}
                    </Badge>
                    <h3 className="font-medium text-lg line-clamp-1 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2">{product.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <p className="font-semibold text-lg dark:text-white">{formatCurrency(product.price)}</p>
                  <Link href={`/store/products/${product.id}`}>
                    <Button size="sm" variant="ghost" className="rounded-full hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-pink-900/30 dark:hover:text-pink-400">
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
