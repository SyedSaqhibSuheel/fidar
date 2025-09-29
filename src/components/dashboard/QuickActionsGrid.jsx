import React from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faPlus, faRightLeft } from "@fortawesome/free-solid-svg-icons";

export default function QuickActionsGrid({ onDeposit, onWithdraw, onAdd, onTransfer }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
      {/* <Button onClick={onDeposit} className="h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5 border-border bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-emerald-600">
        <FontAwesomeIcon icon={faArrowUp} className="h-5 w-5" />
        <span className="text-xs font-medium">Deposit</span>
      </Button>
      <Button onClick={onWithdraw} className="h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5 border-border bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-rose-600">
        <FontAwesomeIcon icon={faArrowDown} className="h-5 w-5 text-rose-600" />
        <span className="text-xs font-medium">Withdraw</span>
      </Button> */}
      <Button onClick={onAdd} className="h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5 border border-gray-300 dark:border-border bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sky-600">
        <FontAwesomeIcon icon={faPlus} className="h-5 w-10" />
        <span className="text-xs font-medium">Add</span>
      </Button>
      <Button onClick={onTransfer} className="h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5 border border-gray-300 dark:border-border bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-violet-600">
        <FontAwesomeIcon icon={faRightLeft} className="h-5 w-10" />
        <span className="text-xs font-medium">Transfer</span>
      </Button>
    </div>
  );
}
