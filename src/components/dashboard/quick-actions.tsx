"use client";

import { ArrowDownCircle, ArrowUpCircle, Receipt, PiggyBank, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TransactionFormDialog,
  type CategoryOption,
} from "@/components/transactions/transaction-form";
import { BillFormDialog } from "@/components/bills/bill-form";

interface QuickActionsProps {
  categories: CategoryOption[];
  billCategories: { id: string; name: string }[];
}

/** Dashboard quick actions — each opens a modal form; everything recalculates on save. */
export function QuickActions({ categories, billCategories }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Quick actions">
      <TransactionFormDialog
        categories={categories}
        defaultType="income"
        trigger={
          <Button variant="soft">
            <ArrowDownCircle aria-hidden /> Add Income
          </Button>
        }
      />
      <TransactionFormDialog
        categories={categories}
        defaultType="expense"
        trigger={
          <Button variant="soft">
            <ArrowUpCircle aria-hidden /> Add Expense
          </Button>
        }
      />
      <BillFormDialog
        categories={billCategories}
        trigger={
          <Button variant="soft">
            <Receipt aria-hidden /> Add Bill
          </Button>
        }
      />
      <TransactionFormDialog
        categories={categories}
        defaultType="savings"
        trigger={
          <Button variant="soft">
            <PiggyBank aria-hidden /> Add Savings
          </Button>
        }
      />
      <TransactionFormDialog
        categories={categories}
        defaultType="debt"
        trigger={
          <Button variant="soft">
            <Landmark aria-hidden /> Add Debt Payment
          </Button>
        }
      />
    </div>
  );
}
