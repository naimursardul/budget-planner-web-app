"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Money } from "@/components/money";
import { TransactionFormDialog } from "@/components/transactions/transaction-form";
import { deleteTransactionAction } from "@/actions/transactions";
import { formatDate } from "@/lib/utils";
import type { TransactionRecord } from "@/components/transactions/transaction-form";
import type { CategoryOption } from "@/components/transactions/transaction-form";
import type { DateFormat, TransactionType } from "@/types";

const TYPE_BADGE: Record<TransactionType, { label: string; variant: "sage" | "blush" | "lavender" | "sky" | "peach" }> = {
  income: { label: "Income", variant: "sage" },
  expense: { label: "Expense", variant: "blush" },
  savings: { label: "Savings", variant: "lavender" },
  bill: { label: "Bill", variant: "sky" },
  debt: { label: "Debt", variant: "peach" },
};

interface TransactionsTableProps {
  records: TransactionRecord[];
  categories: CategoryOption[];
  currency: string;
  dateFormat: DateFormat;
}

export function TransactionsTable({ records, categories, currency, dateFormat }: TransactionsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editRecord, setEditRecord] = useState<TransactionRecord | null>(null);

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", deleteId);
    try {
      await deleteTransactionAction(formData);
      toast.success("Transaction deleted");
    } catch {
      toast.error("We couldn't delete that transaction. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Sub-category</TableHead>
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="hidden sm:table-cell">Account</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => {
            const badge = TYPE_BADGE[r.type];
            return (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(r.date, dateFormat)}
                </TableCell>
                <TableCell>
                  <Badge variant={badge.variant}>
                    {badge.label}
                    {r.recurring && <Repeat className="size-3" aria-label="Recurring" />}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{r.categoryName}</TableCell>
                <TableCell className="hidden max-w-[10rem] truncate text-muted-foreground md:table-cell">
                  {r.subcategory || "—"}
                </TableCell>
                <TableCell className="hidden max-w-[14rem] truncate text-muted-foreground lg:table-cell">
                  {r.description || "—"}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  <Money
                    value={r.amount}
                    currency={currency}
                    precise
                    className={r.type === "income" ? "text-success" : ""}
                  />
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{r.account}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.categoryName}`}>
                        <MoreHorizontal aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setEditRecord(r)}>
                        <Pencil aria-hidden /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleteId(r.id)}
                      >
                        <Trash2 aria-hidden /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TransactionFormDialog
        categories={categories}
        editRecord={editRecord ?? undefined}
        open={editRecord !== null}
        onOpenChange={(v) => !v && setEditRecord(null)}
      />

      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this transaction?</DialogTitle>
            <DialogDescription>
              This can&apos;t be undone. Your dashboard and budget totals will update automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
