// TransactionsChart.jsx
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";

const defaultData = [
  { month: "Jan", credit: 2200, debit: 1450 },
  { month: "Feb", credit: 1800, debit: 1600 },
  { month: "Mar", credit: 2450, debit: 1725 },
  { month: "Apr", credit: 2100, debit: 1900 },
  { month: "May", credit: 2350, debit: 2000 },
  { month: "Jun", credit: 2600, debit: 1880 },
];

export default function TransactionsChart({ data = defaultData, heightClass = "h-80" }) {
  const creditColor = "hsl(var(--chart-2))";
  const debitColor = "hsl(var(--chart-1))";
  const gridColor = "hsl(var(--border))";

  // Helper to detect small screens via CSS class rather than JS resize observers.
  // Keep container min-height for tiny devices.
  return (
    <div className={`w-full ${heightClass} min-h-[12rem] sm:min-h-[16rem]`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 6, right: 8, left: 0, bottom: 2 }} // tighter on mobile
        >
          <defs>
            <linearGradient id="creditFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={creditColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={creditColor} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="debitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={debitColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={debitColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />

          {/* Fewer ticks and smaller font on xs */}
          <XAxis
            dataKey="month"
            interval="preserveStartEnd"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            width={36}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(v) => `${Math.round(v/1000)}k`}
          />

          <ReTooltip
            contentStyle={{ fontSize: 12, padding: 8 }}
            cursor={{ stroke: gridColor }}
          />

          {/* Hide legend on very small screens using CSS utility */}
          <g className="hidden sm:block">
            <Legend verticalAlign="top" height={24} />
          </g>

          <Area type="monotone" dataKey="credit" stroke={creditColor} fill="url(#creditFill)" strokeWidth={2} />
          <Area type="monotone" dataKey="debit" stroke={debitColor} fill="url(#debitFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
