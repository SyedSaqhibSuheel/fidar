import React, { useState } from "react";
import AppSidebar from "@/components/sidebar/app-sidebar";
import RecentTransactionsCard from "./dashboard/RecentTransactionCard";
import TransactionsChart from "@/components/dashboard/transactions-chart";
import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);

  const recentTransactions = [
    { id: 1, type: "credit", amount: "+$1,200.00", description: "Salary Deposit", time: "2 hours ago", status: "completed" },
    { id: 2, type: "debit", amount: "-$85.50", description: "Grocery Store", time: "5 hours ago", status: "completed" },
    { id: 3, type: "debit", amount: "-$45.00", description: "Gas Station", time: "1 day ago", status: "completed" },
    { id: 4, type: "credit", amount: "+$500.00", description: "Freelance Payment", time: "2 days ago", status: "completed" },
    { id: 5, type: "debit", amount: "-$120.00", description: "Utility Bill", time: "3 days ago", status: "pending" },
  ];

  return (
    <div className="min-h-screen">
      <DashboardHeader open={open} onOpenChange={setOpen} />
      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar />
        </div>
        <main className="flex-1 w-full px-4 lg:px-8 py-6">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-6 space-y-4">
              <BalanceCard
                name="Shabeer"
                balanceLabel="Your balance is"
                balanceValue="USD 1,745.00"
              />
              <QuickActionsGrid />
              <button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10">
                <i className="fa-solid fa-mobile-screen-button h-4 w-4" />
                Authorize secondary device
              </button>
              <div className="my-2 h-px bg-border" />
            </section>

            <section className="lg:col-span-6 space-y-4">
              <RecentTransactionsCard items={recentTransactions} />
            </section>

            <section className="lg:col-span-12">
              <div className="rounded-lg border bg-card">
                <div className="p-6 pb-2">
                  <h3 className="font-semibold leading-none tracking-tight">Transactions Overview</h3>
                  <p className="text-sm text-muted-foreground">Credits vs Debits (last 6 months)</p>
                </div>
                <div className="p-6 pt-1">
                  <TransactionsChart heightClass="h-56 xs:h-64 sm:h-72 lg:h-96" />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
