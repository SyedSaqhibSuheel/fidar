import React from "react";
import { Button } from "@/components/ui/button";
import { Circle, CreditCard, Receipt } from "lucide-react";
import { ATM_COLORS } from "./atm-constants";
import NumericKeypad from "./NumericKeypad";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FooterPanel({
  dispensing,
  onSoftLeft,
  onSoftRight,
  onOpenReceipt,
  onKeypad,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full items-start">
      <div className="flex items-center gap-4 min-h-0">
        <div className="flex items-center gap-2">
          <Circle className={`h-3 w-3 ${dispensing ? ATM_COLORS.ledOn : ATM_COLORS.ledOff}`} aria-hidden />
          <span className="text-xs text-zinc-300">{dispensing ? "Dispensing cash..." : "Dispenser idle"}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Card Slot
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert/Tap card to start</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onOpenReceipt} className="gap-2">
                <Receipt className="h-4 w-4" />
                Receipt Slot
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open last receipt</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="w-full">
        <div className="max-w-md ml-auto">
          <NumericKeypad onKey={onKeypad} />
        </div>
      </div>
    </div>
  );
}