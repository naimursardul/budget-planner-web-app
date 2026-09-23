"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_NAMES, addMonths, monthKey, monthLabel, parseMonthKey } from "@/lib/utils";

interface MonthSwitcherProps {
  month: string; // YYYY-MM
}

/** Month pager: < September 2026 >, plus a year selector. Updates ?month= in the URL. */
export function MonthSwitcher({ month }: MonthSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { year } = parseMonthKey(month);
  const now = new Date();

  function go(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Select month">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => go(addMonths(month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <div className="min-w-[9.5rem] text-center text-sm font-semibold">{monthLabel(month)}</div>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => go(addMonths(month, 1))}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
      <Select
        value={String(year)}
        onValueChange={(y) => {
          const { month: m } = parseMonthKey(month);
          go(monthKey(new Date(Number(y), m - 1, 1)));
        }}
      >
        <SelectTrigger className="ml-2 h-8 w-[6.5rem]" aria-label="Select year">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
