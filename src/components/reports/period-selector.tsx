"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OPTIONS = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_3", label: "Last 3 months" },
  { value: "last_6", label: "Last 6 months" },
  { value: "this_year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export function ReportPeriodSelector({
  period,
  from,
  to,
}: {
  period: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  function go(nextPeriod: string) {
    const params = new URLSearchParams({ period: nextPeriod });
    if (nextPeriod === "custom") {
      params.set("from", customFrom);
      params.set("to", customTo);
    }
    router.push(`/reports?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-2" aria-label="Report period">
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={period === option.value ? "default" : "outline"}
            aria-pressed={period === option.value}
            onClick={() => go(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {period === "custom" && (
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go("custom");
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="report-from" className="text-xs">From</Label>
            <Input
              id="report-from"
              type="date"
              className="h-9"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="report-to" className="text-xs">To</Label>
            <Input
              id="report-to"
              type="date"
              className="h-9"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" variant="soft">
            Apply
          </Button>
        </form>
      )}
    </div>
  );
}
