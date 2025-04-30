import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ShieldCheck, Truck, Users, Heart, Star, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { formatCurrency, getBestSellingProducts } from "@/lib/utils"
import connectDB from "@/lib/mongodb"
import getSettingsModel from "@/lib/models/Settings"

// Function to get featured product settings from database
async function getFeaturedProductSettings() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get the Settings model
    const SettingsModel = getSettingsModel();
    
    // Find settings by key
    const settings = await SettingsModel.findOne({ key: "featuredProducts" });
    
    if (settings && settings.value) {
      return settings.value;
    } else {
      return { featuredProductIds: [] };
    }
  } catch (error) {
    console.error("Error reading featured products settings:", error);
    return { featuredProductIds: [] };
  }
}

export default async function Home() {
  // Fetch all products and orders
  const allProducts = await db.getProducts();
  const allOrders = await db.getOrders();
  
  // Get manually set featured products
  const featuredSettings = await getFeaturedProductSettings();
  const featuredProductIds = featuredSettings.featuredProductIds || [];
  
  // If manual featured products exist, use those
  let displayProducts = [];
  
  if (featuredProductIds.length > 0) {
    // Get featured products based on manual selection
    displayProducts = allProducts.filter(product => 
      featuredProductIds.includes(product.id)
    );
    
    // Preserve the order specified in the settings
    displayProducts.sort((a, b) => {
      return featuredProductIds.indexOf(a.id) - featuredProductIds.indexOf(b.id);
    });
  } else {
    // Fallback to best sellers if no manual selections exist
    displayProducts = getBestSellingProducts(allOrders, allProducts, 4);
  }
  
  // Limit to 4 products
  displayProducts = displayProducts.slice(0, 4);
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container px-4 mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">GlamStore</span>
            </Link>
          </div>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-12">
            <Link href="/" className="flex items-center text-sm font-semibold text-pink-600">
              Home
            </Link>
            <Link href="/store" className="flex items-center text-sm font-medium text-muted-foreground hover:text-pink-600">
              Shop
            </Link>
            <Link href="/about" className="flex items-center text-sm font-medium text-muted-foreground hover:text-pink-600">
              About
            </Link>
            <Link href="/contact" className="flex items-center text-sm font-medium text-muted-foreground hover:text-pink-600">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/store">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">Shop Now</Button>
            </Link>
            <Link href="/sign-in" className="hidden md:block">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 relative z-10">
              <div className="flex flex-col justify-center space-y-6">
                <Badge className="w-fit bg-pink-100 text-pink-800 hover:bg-pink-200 px-3 py-1 text-sm">Premium Beauty Products</Badge>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-700">
                    Discover Your Beauty Essentials
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Premium beauty products curated for your unique style. Explore our collection and enhance your
                    natural beauty with our carefully selected products.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row pt-4">
                  <Link href="/store">
                    <Button size="lg" className="gap-2 bg-pink-600 hover:bg-pink-700 text-white shadow-md hover:shadow-lg transition-all">
                      Shop Now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button size="lg" variant="outline" className="gap-2 border-pink-200 text-pink-700 hover:bg-pink-50">
                      Admin Portal
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400"></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Trusted by <span className="font-medium text-pink-600">2,000+</span> customers</p>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl blur-2xl opacity-30 transform rotate-6"></div>
                  <div className="relative bg-white p-4 rounded-2xl shadow-xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=500&q=80"
                      alt="Beauty Products Collection"
                      width={500}
                      height={500}
                      className="rounded-xl object-cover w-full h-[400px]"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-pink-800">Premium Collection</h3>
                          <p className="text-sm text-muted-foreground">Discover our top-rated products</p>
                        </div>
                        <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">New Arrivals</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <Badge className="mb-2 bg-pink-100 text-pink-800 hover:bg-pink-200 px-3 py-1">Why Choose Us</Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-700">
                The GlamStore Difference
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
                We provide the highest quality beauty products with exceptional service and attention to detail
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
              <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 border border-pink-100">
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-pink-100 opacity-20 group-hover:bg-pink-200 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Premium Quality</h3>
                  <p className="text-muted-foreground">
                    All our products are carefully selected for quality, effectiveness, and safety to ensure the best results for your beauty routine.
                  </p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 border border-pink-100">
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-pink-100 opacity-20 group-hover:bg-pink-200 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md">
                    <Truck className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Fast Delivery</h3>
                  <p className="text-muted-foreground">
                    Quick and reliable shipping with real-time tracking to get your beauty essentials to you faster, no matter where you are.
                  </p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 border border-pink-100">
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-pink-100 opacity-20 group-hover:bg-pink-200 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Expert Support</h3>
                  <p className="text-muted-foreground">
                    Our beauty experts are always available to help with personalized recommendations and answer all your beauty questions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-16 flex justify-center">
              <Link href="/store">
                <Button variant="outline" className="gap-2 border-pink-200 text-pink-700 hover:bg-pink-50">
                  Explore Our Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Featured Products Section */}
        <section className="w-full py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <Badge className="mb-2 bg-pink-100 text-pink-800 hover:bg-pink-200 px-3 py-1">
                {featuredProductIds.length > 0 ? "Featured Products" : "Best Sellers"}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                {featuredProductIds.length > 0 ? "Our Curated Selection" : "Our Most Popular Products"}
              </h2>
              <p className="max-w-[800px] text-muted-foreground">
                {featuredProductIds.length > 0 
                  ? "Discover our specially selected beauty essentials handpicked for you"
                  : "Discover our customers' favorites and top-selling beauty essentials"
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {displayProducts.map((product) => (
                <div key={product.id} className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all">
                  <Link href={`/store/products/${product.id}`}>
                    <div className="aspect-square overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                          <ShoppingBag className="h-16 w-16 text-pink-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
                      <Heart className="h-4 w-4 text-pink-600" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <Badge className="mb-2 bg-pink-100 text-pink-800">{product.category}</Badge>
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {featuredProductIds.includes(product.id) ? "Featured" : "Best Seller"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold">{formatCurrency(product.price)}</span>
                      <Link href={`/store/products/${product.id}`}>
                        <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
                          View Product
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 flex justify-center">
              <Link href="/store/products">
                <Button variant="outline" className="gap-2 border-pink-200 text-pink-700 hover:bg-pink-50">
                  View All Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">GlamStore</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Premium beauty products curated for your unique style.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-pink-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-pink-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-pink-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-pink-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/store" className="text-sm text-muted-foreground hover:text-pink-600">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-pink-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-pink-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for the latest updates and offers.
              </p>
              <form className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="rounded-l-md" 
                />
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} GlamStore. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-pink-600">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-pink-600">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-pink-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
