"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Star, Check, AlertCircle } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Type definitions for reviews
interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

// Mock reviews storage until we have a real backend
const REVIEWS_STORAGE_KEY = "product_reviews"

const saveReviews = (reviews: Review[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews))
  }
}

const getReviews = (): Review[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  }
  return []
}

// Component to display stars
const Stars = ({ productId, showCount = false }: { productId: string, showCount?: boolean }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  
  useEffect(() => {
    const allReviews = getReviews()
    const productReviews = allReviews.filter(review => review.productId === productId)
    setReviews(productReviews)
    
    if (productReviews.length > 0) {
      const total = productReviews.reduce((sum, review) => sum + review.rating, 0)
      setAverageRating(total / productReviews.length)
    }
  }, [productId])
  
  return (
    <div className="flex items-center">
      <div className="flex text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={cn(
              "h-4 w-4",
              star <= Math.round(averageRating) ? "fill-amber-500" : "text-gray-300"
            )}
          />
        ))}
      </div>
      {showCount && (
        <span className="ml-2 text-xs text-muted-foreground">
          {reviews.length > 0 
            ? `(${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})`
            : '(No reviews yet)'
          }
        </span>
      )}
    </div>
  )
}

// Main reviews component
const ProductReviews = ({ productId }: { productId: string }) => {
  const { user, isSignedIn } = useUser()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    const allReviews = getReviews()
    const productReviews = allReviews.filter(review => review.productId === productId)
    setReviews(productReviews)
    
    if (isSignedIn && user) {
      const existingReview = productReviews.find(review => review.userId === user.id)
      if (existingReview) {
        setUserReview(existingReview)
        setRating(existingReview.rating)
        setComment(existingReview.comment)
      }
    }
  }, [productId, isSignedIn, user])
  
  const handleSubmitReview = () => {
    if (!isSignedIn || !user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const allReviews = getReviews()
      
      // Create or update review
      const newReview: Review = {
        id: userReview?.id || `review_${Date.now()}`,
        productId,
        userId: user.id,
        userName: user.fullName || user.firstName || 'Anonymous',
        rating,
        comment,
        date: new Date().toISOString(),
        verified: true // For demo purposes, all reviews are verified
      }
      
      let updatedReviews: Review[]
      
      if (userReview) {
        // Update existing review
        updatedReviews = allReviews.map(r => 
          r.id === userReview.id ? newReview : r
        )
        toast({
          title: "Review updated",
          description: "Your review has been updated successfully",
        })
      } else {
        // Add new review
        updatedReviews = [...allReviews, newReview]
        toast({
          title: "Review submitted",
          description: "Your review has been submitted successfully",
        })
      }
      
      saveReviews(updatedReviews)
      
      // Update local state
      const productReviews = updatedReviews.filter(review => review.productId === productId)
      setReviews(productReviews)
      setUserReview(newReview)
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your review",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Customer Reviews</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              {userReview ? "Edit Your Review" : "Write a Review"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{userReview ? "Edit Your Review" : "Write a Review"}</DialogTitle>
            </DialogHeader>
            
            {!isSignedIn ? (
              <div className="flex flex-col items-center text-center py-4">
                <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                <p className="mb-4">Please sign in to leave a review</p>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={() => window.location.href = "/sign-in"}>
                  Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Your Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={cn(
                              "h-6 w-6",
                              star <= rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comment">Your Review</Label>
                    <Textarea
                      id="comment"
                      placeholder="Write your review here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button 
                      onClick={handleSubmitReview} 
                      disabled={isSubmitting || !comment}
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      {userReview ? "Update Review" : "Submit Review"}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{review.userName}</h4>
                    {review.verified && (
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Check className="h-3 w-3 text-green-500 mr-1" /> Verified Purchase
                      </p>
                    )}
                  </div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating ? "fill-current" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm mb-2">{review.comment}</p>
                <p className="text-xs text-muted-foreground">
                  Posted on {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border rounded-lg">
          <h4 className="font-medium mb-2">No Reviews Yet</h4>
          <p className="text-muted-foreground mb-4">Be the first to review this product</p>
        </div>
      )}
    </div>
  )
}

// Set up the Stars component as a property of ProductReviews
ProductReviews.Stars = Stars;

// Export the main component
export default ProductReviews; 