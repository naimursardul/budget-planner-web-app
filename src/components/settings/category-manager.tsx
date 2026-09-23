"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ManagedCategory } from "@/components/settings/settings-view";
import {
  createCategoryAction,
  renameCategoryAction,
  deleteCategoryAction,
  reorderCategoryAction,
} from "@/actions/categories";
import { CATEGORY_TYPES, type CategoryType } from "@/types";

const TYPE_LABELS: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expenses",
  savings: "Savings",
  bill: "Bills",
  debt: "Debt",
};

export function CategoryManager({ categories }: { categories: ManagedCategory[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedCategory | null>(null);
  const [renaming, setRenaming] = useState<ManagedCategory | null>(null);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as CategoryType,
  });

  async function handleAdd() {
    const formData = new FormData();
    formData.set("name", newCategory.name);
    formData.set("type", newCategory.type);
    const result = await createCategoryAction(undefined, formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Category created");
    setAddOpen(false);
    setNewCategory({ name: "", type: "expense" });
    router.refresh();
  }

  async function handleRename() {
    if (!renaming) return;
    const formData = new FormData();
    formData.set("id", renaming.id);
    formData.set("name", newName);
    const result = await renameCategoryAction(undefined, formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Category renamed");
    setRenaming(null);
    router.refresh();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", deleteTarget.id);
      const result = await deleteCategoryAction(undefined, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  function handleReorder(category: ManagedCategory, direction: "up" | "down") {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", category.id);
      formData.set("direction", direction);
      await reorderCategoryAction(undefined, formData);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Customize the categories available when adding transactions.
          </CardDescription>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus aria-hidden /> Add category
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {CATEGORY_TYPES.map((type) => {
          const items = categories.filter((c) => c.type === type);
          if (items.length === 0) return null;
          return (
            <div key={type}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {TYPE_LABELS[type]}
              </h3>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {items.map((category) => (
                  <li key={category.id} className="flex items-center gap-2 px-3 py-2">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ background: category.color }}
                      aria-hidden
                    />
                    <button
                      type="button"
                      className="flex-1 truncate text-left text-sm font-medium hover:underline"
                      onClick={() => {
                        setRenaming(category);
                        setNewName(category.name);
                      }}
                    >
                      {category.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Move ${category.name} up`}
                      onClick={() => handleReorder(category, "up")}
                      disabled={pending}
                    >
                      <ChevronUp aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Move ${category.name} down`}
                      onClick={() => handleReorder(category, "down")}
                      disabled={pending}
                    >
                      <ChevronDown aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>Add a custom category for any type.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-type">Type</Label>
              <Select
                value={newCategory.type}
                onValueChange={(v) => setNewCategory((p) => ({ ...p, type: v as CategoryType }))}
              >
                <SelectTrigger id="cat-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newCategory.name.trim()}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renaming !== null} onOpenChange={(v) => !v && setRenaming(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
            <DialogDescription>
              Existing transactions will update to the new name.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRename();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="rename-input">Name</Label>
              <Input
                id="rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenaming(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newName.trim()}>
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</DialogTitle>
            <DialogDescription>
              Categories with recorded transactions can&apos;t be deleted — rename instead, or
              delete the transactions first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
