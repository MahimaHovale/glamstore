import Link from "next/link"
import Image from "next/image"
import { db } from "@/lib/db"
import { formatCurrency, formatImageUrl, getBestSellingProducts } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { ShoppingBag, Search, SlidersHorizontal, Heart, Filter, X, Check, Award } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import ProductCard from "@/components/store/product-card"

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string, search?: string, bestSellers?: string } }) {
  // Safely access searchParams - ensure it's properly awaited
  const params = await Promise.resolve(searchParams);
  const category = params?.category || null;
  const searchQuery = params?.search || "";
  const showBestSellers = params?.bestSellers === "true";

  // Fetch products asynchronously
  const allProducts = await db.getProducts();
  const allOrders = await db.getOrders();
  
  // Get best sellers if needed
  let bestSellerIds: string[] = [];
  if (showBestSellers) {
    const bestSellers = getBestSellingProducts(allOrders, allProducts);
    bestSellerIds = bestSellers.map(product => product.id);
  }
  
  // Filter products by category if provided
  let filteredProducts = category ? 
    allProducts.filter((product) => product.category === category) : 
    allProducts;
    
  // Filter by search query if provided
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query)
    );
  }
  
  // Filter by best sellers if requested
  if (showBestSellers) {
    filteredProducts = filteredProducts.filter(product => 
      bestSellerIds.includes(product.id)
    );
  }

  // Get all unique categories
  const categories = [...new Set(allProducts.map((product) => product.category))]

  return (
    <div className="container px-4 mx-auto py-6 md:py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
            <p className="text-muted-foreground mt-1">
              Browse our collection of beauty products
            </p>
          </div>
          
          <div className="flex w-full lg:w-auto gap-2">
            <div className="relative flex-grow">
              <form action="/store/products" method="GET">
                {category && <input type="hidden" name="category" value={category} />}
                {showBestSellers && <input type="hidden" name="bestSellers" value="true" />}
                <Input
                  type="search"
                  name="search"
                  placeholder="Search products..."
                  className="pl-8 py-2"
                  defaultValue={searchQuery}
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </form>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <h3 className="font-medium mb-4">Categories</h3>
                  <div className="space-y-3">
                    <Link
                      href="/store/products"
                      className={`flex items-center justify-between p-2 rounded-md transition-colors ${!category && !showBestSellers ? "bg-pink-50 text-pink-700" : "hover:bg-muted/50"}`}
                    >
                      <span>All Products</span>
                      {!category && !showBestSellers && <Check className="h-4 w-4" />}
                    </Link>
                    <Link
                      href="/store/products?bestSellers=true"
                      className={`flex items-center justify-between p-2 rounded-md transition-colors ${showBestSellers ? "bg-pink-50 text-pink-700" : "hover:bg-muted/50"}`}
                    >
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-pink-600" />
                        <span>Best Sellers</span>
                      </div>
                      {showBestSellers && <Check className="h-4 w-4" />}
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/store/products?category=${cat}${showBestSellers ? '&bestSellers=true' : ''}`}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${category === cat ? "bg-pink-50 text-pink-700" : "hover:bg-muted/50"}`}
                      >
                        <span>{cat}</span>
                        {category === cat && <Check className="h-4 w-4" />}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {searchQuery && (
            <Badge variant="outline" className="rounded-md px-2 py-1 flex items-center gap-1">
              <span>Search: {searchQuery}</span>
              <Link href={category ? `/store/products?category=${category}${showBestSellers ? '&bestSellers=true' : ''}` : showBestSellers ? '/store/products?bestSellers=true' : '/store/products'}>
                <X className="h-3 w-3" />
              </Link>
            </Badge>
          )}
          
          {category && (
            <Badge variant="outline" className="rounded-md px-2 py-1 flex items-center gap-1">
              <span>Category: {category}</span>
              <Link href={searchQuery ? `/store/products?search=${searchQuery}${showBestSellers ? '&bestSellers=true' : ''}` : showBestSellers ? '/store/products?bestSellers=true' : '/store/products'}>
                <X className="h-3 w-3" />
              </Link>
            </Badge>
          )}
          
          {showBestSellers && (
            <Badge variant="outline" className="rounded-md px-2 py-1 flex items-center gap-1 border-pink-200 text-pink-700">
              <Award className="h-3 w-3 mr-1" />
              <span>Best Sellers</span>
              <Link href={category ? `/store/products?category=${category}` : searchQuery ? `/store/products?search=${searchQuery}` : '/store/products'}>
                <X className="h-3 w-3" />
              </Link>
            </Badge>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories sidebar - desktop only */}
          <div className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium text-lg mb-4">Categories</h2>
                <div className="space-y-2">
                  <Link
                    href="/store/products"
                    className={`flex items-center justify-between p-2 rounded-md transition-colors ${!category && !showBestSellers ? "bg-pink-50 text-pink-700" : "hover:bg-muted/50"}`}
                  >
                    <span>All Products</span>
                    {!category && !showBestSellers && <Check className="h-4 w-4" />}
                  </Link>
                  <Link
                    href="/store/products?bestSellers=true"
                    className={`flex items-center justify-between p-2 rounded-md transition-colors ${showBestSellers ? "bg-pink-50 text-pink-700" : "hover:bg-muted/50"}`}
                  >
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-pink-600" />
                      <span>Best Sellers</span>
                    </div>
                    {showBestSellers && <Check className="h-4 w-4" />}
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/store/products?category=${cat}${showBestSellers ? '&bestSellers=true' : ''}`}
                      className={`flex items-center justify-between p-2 rounded-md transition-colors ${category === cat ? "bg-pink-50 text-pink-700" : "hover:bg-muted/50"}`}
                    >
                      <span>{cat}</span>
                      {category === cat && <Check className="h-4 w-4" />}
                    </Link>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <h2 className="font-medium text-lg mb-4">Price Range</h2>
                <div className="space-y-4">
                  <Slider defaultValue={[0, 100]} max={100} step={1} />
                  <div className="flex items-center justify-between">
                    <Input type="number" placeholder="Min" className="w-[45%]" />
                    <span>-</span>
                    <Input type="number" placeholder="Max" className="w-[45%]" />
                  </div>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main products grid */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredProducts.length} products found
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select className="py-1 px-2 border rounded-md text-sm">
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Popularity</option>
                </select>
              </div>
            </div>
            
            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                <>
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isBestSeller={bestSellerIds.includes(product.id)}
                    />
                  ))}
                </>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Filter className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No products found</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search term.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
