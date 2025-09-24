import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons";

export default function BalanceCard({ name, balanceLabel, balanceValue }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg h-52 lg:h-64 rounded-xl">
      <div className="pointer-events-none absolute -inset-[1.5px] rounded-xl bg-gradient-to-br from-blue-400/60 via-cyan-400/50 to-emerald-400/60 blur-[2px]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_35%,transparent_70%)] mix-blend-soft-light" aria-hidden="true" />

      <CardContent className="relative h-full p-5 lg:p-6 text-white flex items-center">
        <div className="flex w-full justify-between items-start">
          <div className="space-y-1.5">
            <p className="text-blue-100/90 text-sm font-semibold select-none">Hi,</p>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight select-text">{name}</h1>
            <p className="text-blue-100/80 text-xs select-none">{balanceLabel}</p>
            <p className="text-4xl lg:text-5xl font-extrabold mt-0.5 select-text">{balanceValue}</p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white/15 hover:bg-white/25 rounded-full p-3 cursor-pointer shadow-md ring-1 ring-white/30 transition-all select-none">
                  <FontAwesomeIcon icon={faBuildingColumns} className="h-7 w-7 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                <p>Secure & Trusted Bank</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
