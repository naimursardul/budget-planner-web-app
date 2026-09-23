"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatPercent, MONTH_NAMES, parseMonthKey } from "@/lib/utils";
import type { CashFlowPoint } from "@/services/analytics";

/* ---- shared chrome -------------------------------------------------- */

const SERIES = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)", "var(--viz-5)", "var(--viz-6)"];

function monthShort(key: string): string {
  const { month } = parseMonthKey(key);
  return MONTH_NAMES[month - 1].slice(0, 3);
}

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-sm shadow-lg" role="tooltip">
      {label && <p className="mb-1 font-medium">{label}</p>}
      <ul className="space-y-0.5">
        {payload.map((entry, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-0.5 w-4 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="font-semibold tabular-nums">
              {formatNumber(Number(entry.value ?? 0), currency)}
            </span>
            <span className="text-muted-foreground">{entry.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-hidden>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block size-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/* ---- Income vs Expense (grouped bars, monthly comparison) ------------ */

export function IncomeExpenseChart({ data, currency }: { data: CashFlowPoint[]; currency: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Legend
          items={[
            { label: "Income", color: SERIES[0] },
            { label: "Expenses", color: SERIES[1] },
          ]}
        />
      </div>
      <div className="h-64" role="img" aria-label="Income versus expenses by month">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--viz-grid)" strokeWidth={1} />
            <XAxis
              dataKey="month"
              tickFormatter={monthShort}
              tickLine={false}
              axisLine={{ stroke: "var(--viz-grid)" }}
              tick={{ fill: "var(--viz-axis)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 12 }}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar dataKey="income" name="Income" fill={SERIES[0]} barSize={16} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill={SERIES[1]} barSize={16} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---- Spending breakdown (donut, ≤6 segments: top 5 + Other) ---------- */

export function SpendingDonut({
  byCategory,
  currency,
}: {
  byCategory: { categoryName: string; amount: number }[];
  currency: string;
}) {
  const sorted = [...byCategory].sort((a, b) => b.amount - a.amount);
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const total = sorted.reduce((sum, c) => sum + c.amount, 0);

  const segments = [
    ...top.map((c, i) => ({ name: c.categoryName, value: c.amount, color: SERIES[i] })),
    ...(rest.length > 0
      ? [{ name: "Other", value: rest.reduce((s, c) => s + c.amount, 0), color: "var(--viz-axis)" }]
      : []),
  ];

  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0" role="img" aria-label="Spending by category">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={1.5}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {segments.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-lg font-bold">{formatNumber(total, currency)}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5">
        {segments.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <span className="inline-block size-2.5 rounded-sm" aria-hidden style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
            </span>
            <span className="font-medium tabular-nums">
              {formatNumber(s.value, currency)}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {formatPercent((s.value / total) * 100)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- Cash flow (multi-line, 3 series) -------------------------------- */

export function CashFlowChart({ data, currency }: { data: CashFlowPoint[]; currency: string }) {
  return (
    <div>
      <div className="mb-3">
        <Legend
          items={[
            { label: "Income", color: SERIES[0] },
            { label: "Expenses", color: SERIES[1] },
            { label: "Savings", color: SERIES[2] },
          ]}
        />
      </div>
      <div className="h-64" role="img" aria-label="Income, expenses and savings over recent months">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--viz-grid)" strokeWidth={1} />
            <XAxis
              dataKey="month"
              tickFormatter={monthShort}
              tickLine={false}
              axisLine={{ stroke: "var(--viz-grid)" }}
              tick={{ fill: "var(--viz-axis)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 12 }}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={SERIES[0]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: SERIES[0] }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={SERIES[1]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: SERIES[1] }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke={SERIES[2]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: SERIES[2] }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---- Debt reduction (area line) -------------------------------------- */

export function DebtReductionChart({
  data,
  currency,
}: {
  data: { month: string; balance: number }[];
  currency: string;
}) {
  return (
    <div className="h-64" role="img" aria-label="Total debt balance over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--viz-grid)" strokeWidth={1} />
          <XAxis
            dataKey="month"
            tickFormatter={monthShort}
            tickLine={false}
            axisLine={{ stroke: "var(--viz-grid)" }}
            tick={{ fill: "var(--viz-axis)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 12 }}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          />
          <Tooltip content={<ChartTooltip currency={currency} />} />
          <Line
            type="monotone"
            dataKey="balance"
            name="Total debt"
            stroke={SERIES[1]}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: SERIES[1] }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
