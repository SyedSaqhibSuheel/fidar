import React, { useMemo } from "react";
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

export default function TransactionsChart({
  data,
  heightClass = "h-80",
  currency = "USD",
  locale = undefined,
}) {
  const creditColor = "hsl(var(--chart-2))";
  const debitColor = "hsl(var(--chart-1))";
  const gridColor = "hsl(var(--border))";

  const hasData = Array.isArray(data) && data.length > 0;

  const fmt = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      });
    } catch {
      return { format: (n) => `$${Math.round(n)}` };
    }
  }, [currency, locale]);

  return (
    <div className={`relative w-full ${heightClass} min-h-[12rem] sm:min-h-[16rem]`}>
      {!hasData && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          No data to display
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={hasData ? data : []} margin={{ top: 6, right: 8, left: 0, bottom: 2 }}>
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

          <XAxis
            dataKey="month"
            interval="preserveStartEnd"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            width={48}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(v) => fmt.format(v)}
          />

          <ReTooltip
            formatter={(value, name) => [fmt.format(value), name]}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{ fontSize: 12, padding: 8 }}
            cursor={{ stroke: gridColor }}
          />

          <g className="hidden sm:block">
            <Legend verticalAlign="top" height={24} />
          </g>

          <Area
            type="monotone"
            dataKey="credit"
            name="Credit"
            stroke={creditColor}
            fill="url(#creditFill)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="debit"
            name="Debit"
            stroke={debitColor}
            fill="url(#debitFill)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
