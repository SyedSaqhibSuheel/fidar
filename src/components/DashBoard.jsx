import React, { useState, useEffect } from "react";
import AppSidebar from "@/components/sidebar/app-sidebar";
import RecentTransactionsCard from "./dashboard/RecentTransactionCard";
import TransactionsChart from "@/components/dashboard/transactions-chart";
import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const API_BASE = "http://localhost:8080";

  // get token (adjust if stored differently)
  const token = localStorage.getItem("authToken");

  const fetchData = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1. Get user info
      const userRes = await fetch(`${API_BASE}/iam/accounts/me`, { headers });
      const userData = await userRes.json();
      setUser(userData);

      // 2. Get wallet balance
      const walletRes = await fetch(`${API_BASE}/iam/wallets`, { headers });
      const walletData = await walletRes.json();
      setBalance(walletData.balance); // adjust if API shape is different

      // 3. Get transactions
      const txRes = await fetch(
        `${API_BASE}/iam/transactions?page=0&size=10&sort=createdAt,DESC`,
        { headers }
      );
      const txData = await txRes.json();
      setTransactions(txData.content || txData); // handle pagination wrapper
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, []);

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
                name={user?.name || "Loading..."}
                balanceLabel="Your balance is"
                balanceValue={balance ? `USD ${balance}` : "Loading..."}
              />
              <QuickActionsGrid />
              <button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10">
                <i className="fa-solid fa-mobile-screen-button h-4 w-4" />
                Authorize secondary device
              </button>
              <div className="my-2 h-px bg-border" />
            </section>

            <section className="lg:col-span-6 space-y-4">
              <RecentTransactionsCard items={transactions} />
            </section>

            <section className="lg:col-span-12">
              <div className="rounded-lg border bg-card">
                <div className="p-6 pb-2">
                  <h3 className="font-semibold leading-none tracking-tight">
                    Transactions Overview
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Credits vs Debits (last 6 months)
                  </p>
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
