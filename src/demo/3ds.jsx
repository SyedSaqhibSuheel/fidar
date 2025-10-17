import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ShieldCheck, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AtmHeader } from "@/components/ATM-Dashboard";

export default function OrderSummaryPage() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* ✅ Compact White Header */}
      <header className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur-md">
        <AtmHeader />
      </header>

      {/* ✅ Page Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-5xl w-full shadow-md border border-gray-300">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
              Order Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col md:flex-row gap-8 p-6">
            {/* Left Side - Product */}
            <div className="flex flex-col items-center md:items-start w-full md:w-1/2 border border-gray-200 rounded-xl p-4 bg-white">
              <img
                src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp14-silver-select-202410?wid=940&hei=1112&fmt=png-alpha&.v=1728070180241"
                alt="MacBook Pro M4 Silver"
                className="w-72 h-auto rounded-lg shadow-sm border border-gray-200"
              />
              <div className="mt-6 text-center md:text-left">
                <h2 className="text-xl font-medium text-gray-900">
                  MacBook Pro M4 — Silver
                </h2>
                <p className="text-sm text-muted-foreground">14-inch Display</p>
              </div>
            </div>

            {/* Right Side - Payment Info */}
            <div className="flex flex-col justify-center w-full md:w-1/2 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              {/* Price Details */}
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  Price Details
                </h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span>USD 3686</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Shipping & Handling:
                  </span>
                  <span>USD 0</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>USD 3686</span>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Payment Information
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-xl">
                    VISA
                  </div>
                  <span className="font-medium text-sm">**** 1234</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Bank: Smart Bank
                </p>
                <Separator className="mb-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span>USD 3686.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Amount Remaining:
                    </span>
                    <span>USD 0</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Order Total:</span>
                    <span>USD 3686</span>
                  </div>
                </div>

                {/* ✅ Pay Now Button */}
                <Button
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  onClick={() => setShowPopup(true)}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* ✅ Purchase Completed Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
            <DialogTitle className="text-xl font-semibold">
              Purchase Completed
            </DialogTitle>
            <DialogDescription>
              Your payment has been successfully processed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => alert("📄 Viewing receipt...")}
            >
              View Receipt
            </Button>
            <Button onClick={() => setShowPopup(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
