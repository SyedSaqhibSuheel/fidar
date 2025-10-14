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

  const fetchData = async () => {
    try {
      // 1) Fetch session token
      const tokenRes = await fetch(`${API_BASE}/iam/accounts/token`);
      const tokenString = await tokenRes.text();
      const token = tokenString.split('"')[1];

      // Store token in localStorage for other components
      localStorage.setItem("authToken", token);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      setUser({ token });

      // 2) Fetch wallet(s) and normalize balance
      const walletRes = await fetch(`${API_BASE}/iam/wallets`, { headers });
      const walletData = await walletRes.json();

      let normalizedBalance = null;
      if (walletData?.balance?.amount != null) {
        normalizedBalance = walletData.balance;
      } else if (Array.isArray(walletData) && walletData[0]?.balance?.amount != null) {
        normalizedBalance = walletData[0].balance;
      } else if (walletData?._embedded?.wallets?.[0]?.balance?.amount != null) {
        normalizedBalance = walletData._embedded.wallets[0].balance;
      }
      setBalance(normalizedBalance);

      // 3) Fetch recent transactions
      const txRes = await fetch(
        `${API_BASE}/iam/transactions?page=0&size=10&sort=createdAt,desc`,
        { headers }
      );
      const txJson = await txRes.json();
      const txItems =
        txJson?._embedded?.transactions ?? txJson?.content ?? (Array.isArray(txJson) ? txJson : []);

      const normalized = txItems.map((t) => {
        const isCredit = t.category === "DEPOSIT";
        const amountNumber = Number(t?.amount?.amount ?? 0);
        const amountStr = `USD ${amountNumber.toFixed(2)}`;
        const timeStr = t.createdAt ? new Date(t.createdAt).toLocaleString() : "";
        const description =
          t.category === "DEPOSIT"
            ? "Deposit"
            : t.category === "TRANSFER"
            ? "Transfer"
            : t.category || "Transaction";
        return {
          id: t.id,
          type: isCredit ? "credit" : "debit",
          amount: amountStr,
          description,
          time: timeStr,
          status: t.active ? "completed" : "pending",
          _raw: t,
        };
      });

      setTransactions(normalized);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build chart data: monthly credit vs debit from normalized transactions
  const chartData = useMemo(() => {
    const buckets = new Map(); // YYYY-MM -> { month, credit, debit }

    const toMonthKey = (iso) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    };
    const toMonthLabel = (iso) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime())
        ? ""
        : d.toLocaleString(undefined, { month: "short" });
    };

    for (const it of transactions) {
      const raw = it?._raw;
      const createdAt = raw?.createdAt;
      const amtNum = Number(raw?.amount?.amount ?? 0);
      if (!createdAt || !Number.isFinite(amtNum)) continue;

      const key = toMonthKey(createdAt);
      if (!key) continue;
      if (!buckets.has(key)) {
        buckets.set(key, { month: toMonthLabel(createdAt), credit: 0, debit: 0 });
      }

      if (it.type === "credit") {
        buckets.get(key).credit += amtNum;
      } else if (it.type === "debit") {
        buckets.get(key).debit += amtNum;
      }
    }

    const sorted = Array.from(buckets.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([, v]) => v);

    return sorted.slice(-6);
  }, [transactions]);

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
                name={user ? "Wallet" : "Loading..."}
                balanceLabel="Your balance is"
                balanceValue={
                  balance?.amount != null ? `USD ${Number(balance.amount).toFixed(2)}` : "Loading..."
                }
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
              <div className="rounded-lg bg-card border border-gray-300 dark:border-border">
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
