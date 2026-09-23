"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Money } from "@/components/money";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCategoryPriorityAction } from "@/actions/categories";
import { PRIORITIES, type Priority } from "@/types";

const PRIORITY_LABELS: Record<Priority, string> = {
  essential: "Essential",
  high: "High priority",
  moderate: "Moderate",
  low: "Low priority",
  avoidable: "Avoidable",
};

interface PriorityTableProps {
  rows: {
    id: string;
    name: string;
    priority: Priority;
    spent: number;
    budget: number;
  }[];
  currency: string;
}

export function PriorityTable({ rows, currency }: PriorityTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function changePriority(id: string, priority: Priority) {
    setPendingId(id);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("priority", priority);
      const result = await updateCategoryPriorityAction(undefined, formData);
      setPendingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Priority updated");
      router.refresh();
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="text-right">Spent</TableHead>
          <TableHead className="text-right">Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>
              <Select
                value={row.priority}
                onValueChange={(v) => changePriority(row.id, v as Priority)}
                disabled={pendingId === row.id}
              >
                <SelectTrigger className="h-8 w-40" aria-label={`Priority for ${row.name}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              <Money value={row.spent} currency={currency} />
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {row.budget > 0 ? <Money value={row.budget} currency={currency} /> : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
