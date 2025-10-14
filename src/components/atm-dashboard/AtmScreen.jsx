import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ATM_COLORS } from "./atm-constants";
import { fmtCurrency } from "./atm-utils";
import ScreenRow from "./ScreenRow";
import { Info } from "lucide-react";

export default function AtmScreen({ balance, currency, onSelectOption }) {
  return (
    <div
      className={`w-full sm:col-span-12 md:col-span-8 px-2 pt-2 pb-4 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} relative min-h-0 flex flex-col`}
    >

      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-emerald-500/10 rounded-sm" />
      <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm text-zinc-400">
        <div>Account • Checking</div>
        <div>Balance • {fmtCurrency(balance, currency)}</div>
      </div>
      <Separator className="my-2 sm:my-3 bg-zinc-700" />
      <div className="space-y-2 sm:space-y-3 flex-1 min-h-0">
        <div className={`text-base sm:text-2xl font-semibold ${ATM_COLORS.accent}`}>
          Select an option
        </div>

        <div className="block sm:block">
          <ScreenRow left="Balance Inquiry" right="Funds Transfer" activeLeft />
          <ScreenRow left="Cash Withdrawal" right="PIN Change" />
          <ScreenRow left="Cash Deposit" right="Help" />
          <ScreenRow left="Mini Statement" right="Exit" activeRight />
          <Separator className="my-2 sm:my-3 bg-zinc-700" />
          <div className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm text-zinc-400">
            <Info className="h-4 w-4" />
            <span>Use side buttons or keypad.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {[
            "Balance",
            "Withdraw",
            "Deposit",
            "Mini stmt",
            "Transfer",
            "PIN change",
            "Help",
            "Exit",
          ].map((label) => (
            <Button
              key={label}
              variant="secondary"
              className={`${ATM_COLORS.secondary} text-zinc-100 h-10`}
              onClick={() => onSelectOption?.(label)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

