import React from "react";
import AppSidebar from "@/components/sidebar/app-sidebar";
import ModeToggle from "@/components/theme-provider/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import logo from "@/assets/banklogo.jpg";

export default function DashboardHeader({ open, onOpenChange }) {
  return (
    <header className="bg-card border-b border-border px-4 lg:px-8 shadow-sm sticky top-0 z-40">
      <div className="flex items-center h-14 w-full">
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 rounded-md hover:bg-accent" aria-label="Open menu">
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 sm:w-80 bg-sidebar text-sidebar-foreground">
            <SheetHeader className="px-3 py-2 border-b">
              <SheetTitle className="flex items-center gap-2">
                <img src={logo} alt="Smart Bank Logo" className="h-6 w-auto rounded-sm" />
                <span>Smart Bank</span>
              </SheetTitle>
            </SheetHeader>
            <AppSidebar onNavigate={() => onOpenChange(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3 ml-2">
          <img src={logo} alt="Smart Bank Logo" className="h-8 w-auto object-contain rounded-md" draggable={false} />
          <span className="font-extrabold text-lg tracking-wide hidden sm:block select-none">Smart Bank</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Avatar className="h-9 w-9 ring-2 ring-blue-600">
            <AvatarImage src="/api/placeholder/40/40" alt="Shabeer" />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">S</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
