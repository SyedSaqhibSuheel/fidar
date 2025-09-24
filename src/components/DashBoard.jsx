import React, { useState, useEffect, useMemo } from "react";
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
      console.log("userRes", userRes)
      const userData = await userRes.json();
      console.log("userData", userRes)
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
      const txJson = await txRes.json();
      // Handle HAL _embedded.transactions; fallback to content or array
      const txItems =
        txJson?._embedded?.transactions ??
        txJson?.content ??
        (Array.isArray(txJson) ? txJson : []);
      setTransactions(txItems); // Normalize collection for table/card [web:152][web:157]
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
     if (token) fetchData();
  }, []);

  // Build chart data: monthly buckets of credit (DEPOSIT) vs debit (TRANSFER outflow)
  const chartData = useMemo(() => {
    // Helper: month key "YYYY-MM" and label "Sep"
    const toMonthKey = (iso) => {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    };
    const toMonthLabel = (iso) =>
      new Date(iso).toLocaleString(undefined, { month: "short" }); // Recharts expects string categories [web:146]

    const buckets = new Map(); // key: YYYY-MM -> { label, credit, debit }

    for (const t of transactions) {
      if (!t?.createdAt || !t?.amount?.amount) continue;
      const key = toMonthKey(t.createdAt);
      const label = toMonthLabel(t.createdAt);
      if (!buckets.has(key)) buckets.set(key, { month: label, credit: 0, debit: 0 });

      const amt = Number(t.amount.amount) || 0;
      if (t.category === "DEPOSIT") {
        buckets.get(key).credit += amt;
      } else if (t.category === "TRANSFER") {
        // Treat transfers here as outflow from this wallet, show as debit magnitude
        buckets.get(key).debit += amt;
      }
      // If more categories exist (WITHDRAWAL, PAYMENT), extend mapping as needed. [web:146]
    }

    // Sort by key asc and return latest 6 months for the chart
    const sorted = Array.from(buckets.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([, v]) => v);
    const last6 = sorted.slice(-6);
    return last6.length ? last6 : [];
  }, [transactions]); // Build Recharts-ready array of { month, credit, debit } [web:146][web:151]

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
                  <TransactionsChart
                    data={chartData}
                    heightClass="h-56 xs:h-64 sm:h-72 lg:h-96"
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
