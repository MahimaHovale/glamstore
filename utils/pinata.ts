import { PinataSDK } from "pinata";

// Initialize Pinata SDK with environment variables
export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || "",
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || "",
});

// Upload file to Pinata and return CID
export const uploadToPinata = async (file: File, groupId?: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);
    
    // Create upload instance
    let uploadRequest = pinata.upload.public.file(file);
    
    // Add to group if groupId is provided
    if (groupId) {
      uploadRequest = uploadRequest.group(groupId);
    }
    
    // Execute the upload
    const upload = await uploadRequest;
    
    // SDK returns cid in the response
    const gatewayUrl = createGatewayUrl(upload.cid);
    
    return {
      success: true,
      cid: upload.cid,
      name: file.name,
      url: gatewayUrl
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Get file from Pinata using CID
export const getFromPinata = async (cid: string) => {
  try {
    const url = createGatewayUrl(cid);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const data = await response.blob();
    return {
      success: true,
      data,
      url
    };
  } catch (error) {
    console.error("Error getting file from Pinata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Create gateway URL for file - synchronous function for consistent URL formatting
export function createGatewayUrl(cid: string): string {
  // Ensure the CID is properly formatted
  if (!cid) return "/placeholder.svg";
  
  // Get gateway domain from environment variable
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || '';
  
  // Format: https://{gateway-domain}/ipfs/{CID}
  // This is the standard format for Pinata gateways as per docs
  return `https://${gateway}/ipfs/${cid}`;
}

// Update file metadata in Pinata
export const updatePinataMetadata = async (
  cid: string,
  newName: string,
  description: string = ""
) => {
  try {
    // Using the current Pinata SDK method to update metadata
    await pinata.files.public.update({
      id: cid,
      name: newName,
      keyvalues: {
        description: description,
      }
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating metadata on Pinata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Delete file from Pinata
export const deleteFromPinata = async (cid: string) => {
  if (!cid) {
    console.error("Cannot delete from Pinata: No CID provided");
    return {
      success: false,
      error: "No CID provided"
    };
  }

  try {
    console.log(`Attempting to delete file with CID: ${cid} from Pinata`);
    
    // Ensure CID is properly formatted (remove any whitespace or query parameters)
    const cleanCid = cid.trim().split('?')[0];
    
    // According to Pinata docs, we need to use the direct pinning/unpin endpoint
    // https://docs.pinata.cloud/api-reference/endpoint/ipfs/unpin-file
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cleanCid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT || ''}`
      }
    });
    
    // Log the response for debugging
    console.log(`Pinata deletion response for CID ${cleanCid}:`, {
      status: response.status,
      statusText: response.statusText
    });
    
    // Check if the deletion was successful
    if (response.ok) {
      console.log(`Successfully deleted file with CID: ${cleanCid} from Pinata`);
      return {
        success: true,
        message: `Successfully deleted file with CID: ${cleanCid}`
      };
    } else {
      const errorText = await response.text();
      console.warn(`Failed to delete file with CID: ${cleanCid} from Pinata. Status: ${response.status}, Error: ${errorText}`);
      return {
        success: false,
        error: `Pinata deletion failed: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    console.error(`Error deleting file with CID: ${cid} from Pinata:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}; 