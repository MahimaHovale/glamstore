"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-provider";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  className?: string;
}

export function CheckoutButton({ className }: CheckoutButtonProps) {
  const { isSignedIn } = useUser();
  const { cart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      router.push("/sign-in?redirect_url=/store/cart");
      return;
    }

    setIsLoading(true);

    try {
      // Redirect to the shipping page
      router.push("/store/checkout/shipping");
    } catch (error) {
      console.error("Navigation error:", error);
      
      // Display user-friendly error message
      toast({
        title: "Error",
        description: "There was an error proceeding to checkout. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className={className} 
      size="lg" 
      onClick={handleCheckout} 
      disabled={isLoading || cart.length === 0}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Checkout"
      )}
    </Button>
  );
}
