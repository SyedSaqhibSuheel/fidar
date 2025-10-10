import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, Receipt, ArrowLeftRight, Landmark, Wallet, Circle, CheckCircle2 } from "lucide-react";
import { ATM_COLORS } from "./atm-constants";
import NumericKeypad from "./NumericKeypad";

export default function FooterPanel({
  dispensing,
  onSoftLeft,
  onSoftRight,
  onOpenReceipt,
  onKeypad,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full items-start">
      <div className="flex items-center gap-4">
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

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => onSoftLeft(0)} className={`${ATM_COLORS.primary} text-white`} size="sm">
          <Wallet className="h-4 w-4 mr-2" /> Balance
        </Button>
        <Button onClick={() => onSoftLeft(1)} variant="secondary" size="sm" className="text-white">
          <Landmark className="h-4 w-4 mr-2" /> Withdraw
        </Button>
        <Button onClick={() => onSoftLeft(2)} variant="secondary" size="sm" className="text-white">
          <Landmark className="h-4 w-4 mr-2" /> Deposit
        </Button>
        <Button onClick={() => onSoftRight(0)} variant="secondary" size="sm" className="text-white">
          <ArrowLeftRight className="h-4 w-4 mr-2" /> Transfer
        </Button>
      </div>

      <div className="w-full space-y-3">
        <NumericKeypad onKey={onKeypad} />
      </div>
    </div>
  );
}
