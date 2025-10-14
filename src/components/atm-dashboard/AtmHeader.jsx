import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark, ShieldCheck } from "lucide-react";
import { ATM_COLORS } from "./atm-constants";

export default function AtmHeader() {
  return (
    <CardHeader className={`p-0 ${ATM_COLORS.bezel}`}>
      <div className="relative p-4 sm:p-5">
        <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-zinc-700 shadow-inner" />
        <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-zinc-700 shadow-inner" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-100">
            <Landmark className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base sm:text-lg">Smart Bank ATM</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Secure Session</span>
          </div>
        </div>
        <CardDescription className="text-zinc-400 mt-1 text-xs sm:text-sm">
          Use side buttons to select options.
        </CardDescription>
      </div>
      <div className={`h-1 ${ATM_COLORS.bezelAccent}`} />
    </CardHeader>
  );
}
