import React from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChartColumn,
  faCreditCard,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

export default function AppSidebar({ onNavigate }) {
  const items = [
    { label: "Overview", icon: faHouse },
    { label: "Analytics", icon: faChartColumn },
    { label: "Cards", icon: faCreditCard },
    { label: "Settings", icon: faGear },
  ];

  return (
    <aside
      className="
        w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground
        lg:sticky lg:top-14 lg:h-[calc(100vh-56px)]
      "
      role="navigation"
      aria-label="Sidebar"
    >
      <nav className="p-3 space-y-1.5">
        {items.map((it) => (
          <Button
            key={it.label}
            variant="ghost"
            className="h-14 w-full justify-start gap-3 px-3 text-base font-medium tracking-tight hover:bg-sidebar-accent"
            onClick={() => onNavigate?.(it.label)}
          >
            <FontAwesomeIcon icon={it.icon} className="h-6 w-6" />
            <span className="truncate">{it.label}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
}

