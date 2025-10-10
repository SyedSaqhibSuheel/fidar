import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { ATM_COLORS } from "./atm-constants";

export default function ReceiptSheet({ open, onOpenChange, message }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Receipt</SheetTitle>
          <SheetDescription>Detach along the dotted line</SheetDescription>
        </SheetHeader>
        <div className="mt-4 whitespace-pre-wrap text-sm font-mono">
          {message || "No recent receipt"}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <span className="text-sm">Print Progress</span>
          <Progress value={message ? 100 : 0} />
        </div>
        <SheetFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} className={`${ATM_COLORS.primary} text-white`}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
