import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ATM_COLORS } from "./atm-constants";

export default function NumericKeypad({ onKey }) {
  const keys = ["1","2","3","4","5","6","7","8","9","Clear","0","Enter"];

  useEffect(() => {
    const onDown = (e) => {
      if (e.key >= "0" && e.key <= "9") onKey(e.key);
      if (e.key === "Enter") onKey("Enter");
      if (e.key === "Escape") onKey("Cancel");
      if (e.key === "Backspace") onKey("Clear");
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [onKey]);

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {keys.map((k) => (
        <Button
          key={k}
          aria-label={`key ${k}`}
          onClick={() => onKey(k)}
          variant="secondary"
          className={[
            "h-10 sm:h-11 md:h-12 text-sm sm:text-base rounded-md shadow-sm",
            k === "Enter" ? ATM_COLORS.enter : "",
            k === "Clear" ? ATM_COLORS.clear : "",
            k !== "Enter" && k !== "Clear" ? ATM_COLORS.secondary + " text-white" : "",
          ].join(" ")}
        >
          {k}
        </Button>
      ))}
      <Button
        aria-label="key Cancel"
        onClick={() => onKey("Cancel")}
        className={`col-span-3 h-10 sm:h-11 md:h-12 text-sm sm:text-base rounded-md ${ATM_COLORS.cancel}`}
      >
        Cancel
      </Button>
    </div>
  );
}
