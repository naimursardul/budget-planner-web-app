"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { BillFormDialog, type BillRecord } from "@/components/bills/bill-form";
import { markBillPaidAction, deleteBillAction } from "@/actions/bills";

interface BillActionsProps {
  bill: BillRecord;
  categories: { id: string; name: string }[];
}

export function BillActions({ bill, categories }: BillActionsProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function markPaid() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", bill.id);
      try {
        await markBillPaidAction(formData);
        toast.success("Bill marked as paid");
        router.refresh();
      } catch {
        toast.error("We couldn't mark that bill paid. Please try again.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", bill.id);
      try {
        await deleteBillAction(formData);
        toast.success("Bill deleted");
        setConfirmDelete(false);
        router.refresh();
      } catch {
        toast.error("We couldn't delete that bill. Please try again.");
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="soft" onClick={markPaid} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
          Mark paid
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${bill.name}`}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Pencil aria-hidden /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setConfirmDelete(true)}
            >
              <Trash2 aria-hidden /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BillFormDialog
        categories={categories}
        editRecord={bill}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this bill?</DialogTitle>
            <DialogDescription>
              The bill and its calendar entries will be removed. Existing payments stay in your
              transaction history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
