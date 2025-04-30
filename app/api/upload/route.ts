import { NextRequest, NextResponse } from "next/server";
import { pinata, createGatewayUrl } from "@/utils/pinata";

export const maxDuration = 60; // Maximum duration for the API route (in seconds)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const groupId = formData.get("groupId") as string || undefined;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // Get file type and check if it's allowed
    const fileType = file.type;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ 
        success: false, 
        message: "File type not allowed. Only JPEG, PNG, WebP, and GIF are supported." 
      }, { status: 400 });
    }

    // Convert File to Buffer for Pinata upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a new File instance that Pinata can handle
    const pinataFile = new File([buffer], file.name, { type: file.type });

    // Upload to Pinata with optional groupId
    let uploadRequest = pinata.upload.public.file(pinataFile);
    
    // Add to group if groupId is provided
    if (groupId) {
      uploadRequest = uploadRequest.group(groupId);
    }
    
    // Execute the upload
    const upload = await uploadRequest;
    
    // Generate gateway URL
    const url = await createGatewayUrl(upload.cid);

    return NextResponse.json({
      success: true,
      cid: upload.cid,
      name: upload.name,
      url: url
    });
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
} 