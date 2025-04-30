import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import connectDB from "@/lib/mongodb"

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/orders/[id]/status - Update an order's status
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectDB(); // Ensure connection is established
    const body = await request.json();
    
    // Validate the body has a status
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Find the order first
    const order = await db.getOrder(params.id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Validate status is one of the allowed values
    const validStatuses = ["pending", "processing", "shipped", "delivered"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Update the order status
    const updatedOrder = await db.updateOrderStatus(params.id, body.status);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 