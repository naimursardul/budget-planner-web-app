"use client";

import { useForm } from "react-hook-form";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionFilter } from "@/lib/validations/transaction";
import { TRANSACTION_TYPES } from "@/types";

interface TransactionFiltersProps {
  filters: TransactionFilter;
  categories: { name: string; type: string }[];
  accounts: string[];
}

const TYPE_LABELS: Record<string, string> = {
  all: "All types",
  income: "Income",
  expense: "Expense",
  savings: "Savings",
  bill: "Bill",
  debt: "Debt",
};

export function TransactionFilters({ filters, categories, accounts }: TransactionFiltersProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      q: filters.q ?? "",
      type: filters.type,
      category: filters.category,
      account: filters.account,
      from: filters.from ?? "",
      to: filters.to ?? "",
      minAmount: filters.minAmount ?? "",
      maxAmount: filters.maxAmount ?? "",
      sort: filters.sort,
    },
  });

  return (
    <form
      action="/transactions"
      method="get"
      onSubmit={(e) => {
        // reset to page 1 whenever filters change
        handleSubmit(() => {
          const form = e.currentTarget as HTMLFormElement;
          const data = new FormData(form);
          data.delete("page");
          const params = new URLSearchParams();
          for (const [k, v] of data.entries()) {
            if (v) params.set(k, String(v));
          }
          window.location.search = params.toString();
          e.preventDefault();
        })(e);
      }}
      className="rounded-xl border border-border bg-card p-4"
      aria-label="Filter transactions"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-2 space-y-1.5 sm:col-span-3 lg:col-span-2">
          <Label htmlFor="f-q">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="f-q" placeholder="Search description, category…" className="pl-9" {...register("q")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-type">Type</Label>
          <Select name="type" defaultValue={filters.type}>
            <SelectTrigger id="f-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-sort">Sort</Label>
          <Select name="sort" defaultValue={filters.sort}>
            <SelectTrigger id="f-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest first</SelectItem>
              <SelectItem value="date_asc">Oldest first</SelectItem>
              <SelectItem value="amount_desc">Highest amount</SelectItem>
              <SelectItem value="amount_asc">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-category">Category</Label>
          <Select name="category" defaultValue={filters.category}>
            <SelectTrigger id="f-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={`${c.type}-${c.name}`} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-account">Account</Label>
          <Select name="account" defaultValue={filters.account}>
            <SelectTrigger id="f-account">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-from">From date</Label>
          <Input id="f-from" type="date" {...register("from")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-to">To date</Label>
          <Input id="f-to" type="date" {...register("to")} />
        </div>
        <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="f-min">Min amount</Label>
            <Input id="f-min" type="number" min="0" step="0.01" placeholder="0" {...register("minAmount")} />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="f-max">Max amount</Label>
            <Input id="f-max" type="number" min="0" step="0.01" placeholder="∞" {...register("maxAmount")} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <a href="/transactions" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <RotateCcw aria-hidden /> Reset
        </a>
        <Button type="submit" size="sm" variant="soft">
          <Filter aria-hidden /> Apply filters
        </Button>
      </div>
    </form>
  );
}
