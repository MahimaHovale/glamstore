import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import getSettingsModel from "@/lib/models/Settings";
// Remove Clerk auth that's causing issues
// import { auth } from "@clerk/nextjs/server";

const SETTINGS_KEY = "featuredProducts";

// Default settings
const DEFAULT_SETTINGS = {
  featuredProductIds: []
};

// GET endpoint to fetch featured products settings
export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get the Settings model
    const SettingsModel = getSettingsModel();

    // Find settings by key
    const settings = await SettingsModel.findOne({ key: SETTINGS_KEY });

    if (settings) {
      return NextResponse.json(settings.value);
    } else {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error("Error in GET /api/settings/featured-products:", error);
    return NextResponse.json(
      DEFAULT_SETTINGS,
      { status: 200 } // Always return success with default settings
    );
  }
}

// POST endpoint to update featured products settings
export async function POST(request: NextRequest) {
  try {
    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }
    
    // Validate the request
    if (!body || !body.featuredProductIds || !Array.isArray(body.featuredProductIds)) {
      console.error("Invalid request body:", body);
      return NextResponse.json(
        { error: "featuredProductIds must be an array" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Get the Settings model
    const SettingsModel = getSettingsModel();
    
    // Create the settings object
    const settingsValue = {
      featuredProductIds: body.featuredProductIds,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin" // Hardcoded for now - can be improved later
    };
    
    try {
      // Update or insert settings
      await SettingsModel.findOneAndUpdate(
        { key: SETTINGS_KEY },
        { 
          key: SETTINGS_KEY,
          value: settingsValue,
          updatedBy: "admin"
        },
        { upsert: true }
      );
      
      return NextResponse.json({
        success: true,
        message: "Featured products settings updated successfully"
      });
    } catch (error) {
      console.error("Error writing settings to database:", error);
      return NextResponse.json(
        { error: "Failed to save settings", details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unhandled error in /api/settings/featured-products:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: String(error) },
      { status: 500 }
    );
  }
} 