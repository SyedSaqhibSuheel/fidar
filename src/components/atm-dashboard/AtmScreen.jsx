import React from "react";
import { Separator } from "@/components/ui/separator";
import { ATM_COLORS } from "./atm-constants";
import { fmtCurrency } from "./atm-utils";
import ScreenRow from "./ScreenRow";
import { Info } from "lucide-react";

export default function AtmScreen({ balance, currency }) {
  return (
    <div className={`col-span-12 md:col-span-8 p-3 sm:p-5 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} relative`}>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-emerald-500/10 rounded-sm" />
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
        <div>Account • Checking</div>
        <div>Balance • {fmtCurrency(balance, currency)}</div>
      </div>
      <Separator className="my-3 bg-zinc-700" />
      <div className="space-y-3 sm:space-y-4">
        <div className={`text-lg sm:text-2xl font-semibold ${ATM_COLORS.accent}`}>
          Select an option
        </div>
        <ScreenRow left="Balance Inquiry" right="Funds Transfer" activeLeft />
        <ScreenRow left="Cash Withdrawal" right="PIN Change" />
        <ScreenRow left="Cash Deposit" right="Help" />
        <ScreenRow left="Mini Statement" right="Exit" activeRight />
        <Separator className="my-3 bg-zinc-700" />
        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
          <Info className="h-4 w-4" />
          <span>Use the left/right buttons or quick actions below.</span>
        </div>
      </div>
    </div>
  );
}
