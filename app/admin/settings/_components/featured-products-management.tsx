"use client"

import { useState, useEffect } from "react"
import { Product } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, RefreshCw, Star, StarOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { formatCurrency, formatImageUrl } from "@/lib/utils"

export function FeaturedProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
  
  // Filtered products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get currently featured products
  const getFeaturedProducts = filteredProducts.filter(product => 
    featuredProducts.includes(product.id)
  );
  
  // Get products not featured
  const getUnfeaturedProducts = filteredProducts.filter(product => 
    !featuredProducts.includes(product.id)
  );
  
  // Fetch all products
  const fetchProducts = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/products')
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }
  
  // Fetch featured products settings
  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/settings/featured-products')
      
      if (response.ok) {
        const data = await response.json()
        setFeaturedProducts(data.featuredProductIds || [])
      }
    } catch (error) {
      console.error("Error fetching featured products:", error)
      // If the endpoint doesn't exist yet, we'll just use an empty array
      setFeaturedProducts([])
    }
  }
  
  // Save featured products
  const saveFeaturedProducts = async () => {
    try {
      setIsSaving(true)
      console.log("Saving featured products:", featuredProducts);
      
      const response = await fetch('/api/settings/featured-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featuredProductIds: featuredProducts }),
        cache: 'no-cache', // Prevent caching of this request
      })
      
      console.log("API response status:", response.status, response.statusText);
      
      // If not OK, handle error
      if (!response.ok) {
        let errorMessage = 'Failed to save featured products';
        
        // Try to get the response as text first
        const responseText = await response.text();
        console.log("API response text:", responseText);
        
        // Try to parse as JSON if possible
        if (responseText && responseText.trim()) {
          try {
            const errorData = JSON.parse(responseText);
            console.log("API error response:", errorData);
            
            if (errorData && typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            console.error("Failed to parse error response as JSON:", parseError);
          }
        } else {
          console.log("Empty or invalid response from API");
        }
        
        throw new Error(`API Error: ${errorMessage}`);
      }
      
      // Try to parse response as text first to debug
      const responseText = await response.text();
      console.log("API success response text:", responseText);
      
      // Handle successful response - parse JSON if possible
      let result = {};
      if (responseText && responseText.trim()) {
        try {
          result = JSON.parse(responseText);
          console.log("API success response parsed:", result);
        } catch (parseError) {
          console.warn("Could not parse success response as JSON:", parseError);
        }
      }
      
      toast.success("Featured products saved", {
        description: "Your featured products have been updated successfully."
      })
    } catch (error) {
      console.error("Error saving featured products:", error);
      toast.error("Failed to save featured products", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Add product to featured list
  const addToFeatured = (productId: string) => {
    if (!featuredProducts.includes(productId)) {
      setFeaturedProducts([...featuredProducts, productId])
    }
  }
  
  // Remove product from featured list
  const removeFromFeatured = (productId: string) => {
    setFeaturedProducts(featuredProducts.filter(id => id !== productId))
  }
  
  // Load data on component mount
  useEffect(() => {
    fetchProducts()
    fetchFeaturedProducts()
  }, [])
  
  return (
    <div className="space-y-6">
      {/* Mobile-optimized header section with responsive button layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            fetchProducts()
            fetchFeaturedProducts()
          }}
          disabled={isRefreshing}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <div className="flex flex-col xs:flex-row items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setIsProductSelectorOpen(true)}
            variant="outline"
            className="flex items-center gap-2 w-full xs:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Products
          </Button>
          
          <Button 
            onClick={saveFeaturedProducts}
            disabled={isSaving}
            className="flex items-center gap-2 w-full xs:w-auto"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                Save Featured
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium">Currently Featured Products</h3>
          <Badge variant="outline">{getFeaturedProducts.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          These products will be displayed in the featured products section on the home page.
          Drag to reorder or remove products that should not be featured.
        </p>
        
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
          </div>
        ) : getFeaturedProducts.length === 0 ? (
          <div className="text-center py-6 sm:py-12 border rounded-md bg-background">
            <Star className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 opacity-20" />
            <h3 className="text-lg font-medium mb-1">No Featured Products</h3>
            <p className="text-sm text-muted-foreground mb-4 px-2">
              You haven't selected any products to feature yet.
            </p>
            <Button 
              onClick={() => setIsProductSelectorOpen(true)}
              variant="outline"
              className="mx-auto text-sm"
              size="sm"
            >
              Select Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {getFeaturedProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-background border rounded-lg overflow-hidden flex flex-col"
              >
                <div className="relative h-32 sm:h-40">
                  <Image
                    src={formatImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 sm:h-7 sm:w-7"
                    onClick={() => removeFromFeatured(product.id)}
                  >
                    <StarOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                <div className="p-2 sm:p-3 flex-1 flex flex-col">
                  <Badge variant="outline" className="mb-1 w-fit text-xs">
                    {product.category}
                  </Badge>
                  <h4 className="font-medium text-sm sm:text-base line-clamp-1">{product.name}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 flex-1">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm sm:text-base">{formatCurrency(product.price)}</span>
                    <Badge variant="secondary" className="text-xs">In stock: {product.stock}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Product Selector Dialog - Optimize for mobile */}
      <Dialog open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-full max-h-[80vh] overflow-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle>Select Products to Feature</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-3 sm:my-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            {getUnfeaturedProducts.length === 0 ? (
              <div className="text-center py-6 sm:py-8 border rounded-md">
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "No products match your search" : "All products are already featured"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getUnfeaturedProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="border rounded-lg overflow-hidden flex bg-background"
                  >
                    <div className="relative min-w-16 w-16 h-16 sm:w-20 sm:h-20">
                      <Image
                        src={formatImageUrl(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2 sm:p-3 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm sm:text-base line-clamp-1">{product.name}</h4>
                        <Checkbox 
                          id={`product-${product.id}`}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addToFeatured(product.id)
                            }
                          }}
                        />
                      </div>
                      <Badge variant="outline" className="mb-1 text-xs">
                        {product.category}
                      </Badge>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {formatCurrency(product.price)} · Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-3 sm:mt-4">
            <Button variant="outline" onClick={() => setIsProductSelectorOpen(false)} size="sm" className="text-xs sm:text-sm">
              Cancel
            </Button>
            <Button onClick={() => setIsProductSelectorOpen(false)} size="sm" className="text-xs sm:text-sm">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 