import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { formatCurrency, formatImageUrl } from "@/lib/utils"
import { Minus, Plus, ShoppingCart, Heart, Share2, Star, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react"
import AddToCartButton from "./_components/add-to-cart-button"
import AddToWishlistButton from "./_components/add-to-wishlist-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ProductCard from "@/components/store/product-card"
import { ReviewsSection, ProductRating } from "./_components/reviews-section"

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Ensure params.id is properly awaited and used correctly
  const resolvedParams = await Promise.resolve(params);
  const id = String(resolvedParams?.id || "");
  
  if (!id) {
    redirect("/store/products");
  }

  const product = await db.getProduct(id);

  if (!product) {
    redirect("/store/products");
  }
  
  // Get related products (same category)
  const allProducts = await db.getProducts();
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container py-8 px-4 md:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/store" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/store/products" className="hover:text-foreground transition-colors">
          Products
        </Link>
        <span className="mx-2">/</span>
        <Link 
          href={`/store/products?category=${product.category}`} 
          className="hover:text-foreground transition-colors"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground truncate max-w-[150px] sm:max-w-none">{product.name}</span>
      </div>
      
      {/* Back button - Mobile only */}
      <Link href="/store/products" className="inline-flex items-center mb-6 md:hidden">
        <Button variant="ghost" size="sm" className="gap-1 pl-0 hover:pl-1 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-white">
            <Image
              src={formatImageUrl(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            <div className="absolute top-4 right-4">
              <AddToWishlistButton product={product} variant="icon" />
            </div>
          </div>
          
          {/* Thumbnail images - could be expanded with actual thumbnails */}
          <div className="hidden md:flex gap-4 overflow-auto pb-2">
            <div className="relative aspect-square w-[100px] shrink-0 rounded-md border overflow-hidden bg-white cursor-pointer ring-2 ring-pink-500">
              <Image
                src={formatImageUrl(product.image)}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative aspect-square w-[100px] shrink-0 rounded-md border overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-xs">View {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                {product.category}
              </Badge>
              <div className="flex items-center text-amber-500">
                <ProductRating productId={product.id} />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold text-pink-600">{formatCurrency(product.price)}</p>
          </div>

          <p className="text-muted-foreground">{product.description}</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant={product.stock > 0 ? "outline" : "destructive"} 
                className={`px-2 py-1 ${product.stock > 0 ? "border-green-500 text-green-700 bg-green-50" : ""}`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
              {product.stock > 0 && (
                <span className="text-sm text-muted-foreground">
                  {product.stock} {product.stock === 1 ? "unit" : "units"} available
                </span>
              )}
            </div>
            
            {/* Quantity selector is now handled by the AddToCartButton component */}
          </div>

          {/* Add to cart button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <AddToCartButton product={product} />
            <AddToWishlistButton product={product} variant="outline" />
          </div>
          
          {/* Shipping and returns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Free shipping over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">30-day returns</span>
            </div>
          </div>
          
          {/* Share buttons */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm font-medium">Share:</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product details tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="description" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent py-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent py-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent py-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="details" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Product Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 border-b pb-2">
                    <span className="text-muted-foreground">Brand</span>
                    <span>GlamStore</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b pb-2">
                    <span className="text-muted-foreground">Category</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b pb-2">
                    <span className="text-muted-foreground">SKU</span>
                    <span>SKU-{product.id.substring(0, 8)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b pb-2">
                    <span className="text-muted-foreground">Stock</span>
                    <span>{product.stock} {product.stock === 1 ? "unit" : "units"}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Shipping & Returns</h3>
                <div className="space-y-4">
                  <p className="text-sm">Free standard shipping on orders over $50</p>
                  <p className="text-sm">Express shipping available for an additional fee</p>
                  <p className="text-sm">30-day return policy for unused items in original packaging</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-6">
            <ReviewsSection productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
