import React from "react";
import { Button } from "@/components/ui/button";
import { ATM_COLORS, SOFT_LEFT, SOFT_RIGHT } from "./atm-constants";

export function SoftKeysLeft({ onSelect }) {
  return (
    <div className="hidden sm:flex sm:col-span-12 md:col-span-2 md:flex-col justify-between p-1 md:p-3 gap-1 md:gap-2">
      {SOFT_LEFT.map((label, i) => (
        <Button
          key={label}
          onClick={() => onSelect(i)}
          variant="secondary"
          className={`${ATM_COLORS.secondary} text-zinc-100 h-9 text-xs md:h-12 md:text-sm rounded-md`}
          aria-label={`Soft key left ${label}`}
        >
          <span className="hidden md:inline">◀</span>
          <span className="md:ml-2 truncate">{label}</span>
        </Button>
      ))}
    </div>
  );
}

export function SoftKeysRight({ onSelect }) {
  return (
    <div className="hidden sm:flex sm:col-span-12 md:col-span-2 md:flex-col justify-between p-1 md:p-3 gap-1 md:gap-2">
      {SOFT_RIGHT.map((label, i) => (
        <Button
          key={label}
          onClick={() => onSelect(i)}
          variant="secondary"
          className={`${ATM_COLORS.secondary} text-zinc-100 h-9 text-xs md:h-12 md:text-sm rounded-md`}
          aria-label={`Soft key right ${label}`}
        >
          <span className="md:mr-2 truncate">{label}</span>
          <span className="hidden md:inline">▶</span>
        </Button>
      ))}
    </div>
  );
}
