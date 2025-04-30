import { NextResponse } from "next/server"
import { db, Review } from "@/lib/db"
import mongoose from "mongoose"
import { currentUser } from "@clerk/nextjs/server"

// Helper function to safely extract the ID parameter
async function getParamId(params: any): Promise<string> {
  const resolvedParams = await Promise.resolve(params);
  return String(resolvedParams?.id || "");
}

// Route params interface to help TypeScript understand the parameters
interface RouteParams {
  params: {
    id: string;
  }
}

// GET endpoint to fetch reviews for a product
export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Get ID safely using our helper function
    const id = await getParamId(params);
    
    // Validate ID
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Make sure product exists
    const product = await db.getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch reviews for the product
    const reviews = await db.getProductReviews(id);

    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((total: number, review: Review) => total + review.rating, 0);
      averageRating = sum / reviews.length;
    }

    return NextResponse.json({
      reviews,
      count: reviews.length,
      averageRating
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ 
      error: "Failed to fetch reviews",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// POST endpoint to create a new review
export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Check authentication
    let user;
    try {
      user = await currentUser();
      if (!user?.id) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json({ 
        error: "Authentication failed", 
        details: authError instanceof Error ? authError.message : "Unknown auth error" 
      }, { status: 401 });
    }
    
    const userId = user.id;

    // Get product ID
    const id = await getParamId(params);
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json({ 
        error: "Invalid request body", 
        details: "Could not parse JSON request body" 
      }, { status: 400 });
    }
    
    const { rating, comment, userName } = body;

    console.log("Review submission data:", { productId: id, userId, rating, comment });

    // Validate required fields
    if (!rating || !comment) {
      return NextResponse.json({ 
        error: "Rating and comment are required" 
      }, { status: 400 });
    }

    // Validate rating
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ 
        error: "Rating must be a number between 1 and 5" 
      }, { status: 400 });
    }

    // Make sure product exists
    let product;
    try {
      product = await db.getProduct(id);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
    } catch (productError) {
      console.error("Error fetching product:", productError);
      return NextResponse.json({ 
        error: "Error fetching product",
        details: productError instanceof Error ? productError.message : "Unknown product error"
      }, { status: 500 });
    }

    // Create or update the review
    const displayName = userName || user.firstName || user.username || "Anonymous";
    
    try {
      const review = await db.createReview(
        id,
        userId,
        displayName,
        numericRating,
        comment,
        true // Assuming all reviews from logged-in users are verified for this demo
      );

      if (!review) {
        return NextResponse.json({ 
          error: "Failed to create review - no review returned" 
        }, { status: 500 });
      }

      return NextResponse.json({
        message: "Review processed successfully",
        review
      }, { status: 201 });
    } catch (createError) {
      console.error("Error from createReview:", createError);
      return NextResponse.json({ 
        error: "Failed to create review",
        details: createError instanceof Error ? createError.message : "Unknown error during review creation"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating/updating review:", error);
    return NextResponse.json({ 
      error: "Failed to process review",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 