import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import connectDB from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    await connectDB(); // Ensure connection is established
    
    // Check if we need to filter by userId
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      console.log(`GET /api/orders: Fetching orders for user ${userId}`);
      const userOrders = await db.getUserOrders(userId);
      console.log(`GET /api/orders: Found ${userOrders.length} orders for user ${userId}`);
      return NextResponse.json(userOrders);
    } else {
      console.log('GET /api/orders: Fetching all orders');
      const orders = await db.getOrders();
      console.log(`GET /api/orders: Found ${orders.length} orders`);
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log request body for debugging
    console.log('POST /api/orders - Processing order request:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.userId || !Array.isArray(body.products) || body.products.length === 0) {
      console.error("Missing required fields:", { userId: body.userId, products: body.products });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Ensure products are in the correct format
    const formattedProducts = body.products.map((item: any) => ({
      productId: String(item.productId),
      quantity: Number(item.quantity) || 1
    }));
    
    let orderTotal = 0;
    
    try {
      // Ensure database connection is established
      await connectDB();
      
      // Validate that all products exist and calculate total
      console.log("Verifying products and calculating total...");
      
      for (const item of formattedProducts) {
        const product = await db.getProduct(item.productId);
        
        if (!product) {
          console.error(`Product not found: ${item.productId}`);
          return NextResponse.json({ 
            error: `Product ${item.productId} not found` 
          }, { status: 404 });
        }
        
        console.log(`Product verified: ${product.name}, price: ${product.price}, quantity: ${item.quantity}`);
        orderTotal += product.price * item.quantity;
      }
      
      console.log(`Order total calculated: ${orderTotal}`);
    } catch (error) {
      console.error("Error validating products:", error);
      return NextResponse.json({ 
        error: "Error validating products", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
    
    // Prepare the order object with shipping and payment details
    const orderData = {
      userId: String(body.userId),
      products: formattedProducts,
      status: body.status || "pending",
      total: body.total || orderTotal,
      // Add shipping address if provided
      shippingAddress: body.shippingAddress || undefined,
      // Add payment information
      paymentMethod: body.paymentMethod || "cash_on_delivery",
      paymentStatus: body.paymentStatus || "pending",
      paymentDetails: body.paymentDetails || undefined
    };
    
    console.log('Creating order with data:', JSON.stringify(orderData));
    
    try {
      // Create the order
      const order = await db.createOrder(orderData);
      console.log('Order created successfully:', order.id);
      
      return NextResponse.json({
        success: true,
        message: "Order created successfully",
        order
      }, { status: 201 });
    } catch (orderError) {
      console.error("Error creating order in database:", orderError);
      return NextResponse.json({ 
        error: "Failed to create order in database", 
        details: orderError instanceof Error ? orderError.message : String(orderError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing order request:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}