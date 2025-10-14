import React from "react";
import { Separator } from "@/components/ui/separator";

export default function ScreenRow({ left, right, activeLeft, activeRight }) {
  return (
    <div className="grid grid-cols-12 items-center gap-2">
      <div className="col-span-5 flex justify-end pr-2">
        <span className={`text-right ${activeLeft ? "text-emerald-400" : ""}`}>
          {activeLeft ? "▶ " : ""}{left}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <Separator orientation="vertical" className="h-6 bg-zinc-600" />
      </div>
      <div className="col-span-5 pl-2">
        <span className={`${activeRight ? "text-emerald-400" : ""}`}>
          {right}{activeRight ? " ◀" : ""}
        </span>
      </div>
    </div>
  );
}
