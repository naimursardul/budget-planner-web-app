"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from "@/components/settings/category-manager";
import {
  updateSettingsAction,
  updateNotificationPrefsAction,
  changePasswordAction,
  type ActionState,
} from "@/actions/settings";
import { CURRENCIES } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import type { CategoryType, DateFormat, Priority } from "@/types";

interface SettingsUser {
  name: string;
  email: string;
  currency: string;
  dateFormat: DateFormat;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  notificationPrefs: {
    billReminders: boolean;
    budgetAlerts: boolean;
    savingsMilestones: boolean;
    monthlySummary: boolean;
  };
}

export interface ManagedCategory {
  id: string;
  name: string;
  type: CategoryType;
  priority: Priority;
  color: string;
  order: number;
  isDefault: boolean;
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {label}
    </Button>
  );
}

function ErrorBanner({ state }: { state?: ActionState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
      {state.error}
    </p>
  );
}

function SuccessBanner({ state }: { state?: ActionState }) {
  if (!state?.success) return null;
  return (
    <p role="status" className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
      {state.success}
    </p>
  );
}

export function SettingsView({
  user,
  categories,
}: {
  user: SettingsUser;
  categories: ManagedCategory[];
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profileState, profileAction, profilePending] = useActionState<
    ActionState | undefined,
    FormData
  >(updateSettingsAction, undefined);
  const [notifState, notifAction, notifPending] = useActionState<
    ActionState | undefined,
    FormData
  >(updateNotificationPrefsAction, undefined);
  const [passwordState, passwordAction, passwordPending] = useActionState<
    ActionState | undefined,
    FormData
  >(changePasswordAction, undefined);

  const [prefs, setPrefs] = useState(user.notificationPrefs);

  useEffect(() => {
    if (profileState?.success || notifState?.success || passwordState?.success) {
      router.refresh();
    }
  }, [profileState?.success, notifState?.success, passwordState?.success, router]);

  function togglePref(key: keyof SettingsUser["notificationPrefs"], value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList className="flex-wrap">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile & preferences</CardTitle>
            <CardDescription>Your currency choice reformats every amount in the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={profileAction} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="s-name">Name</Label>
                  <Input id="s-name" name="name" defaultValue={user.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" value={user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-currency">Currency</Label>
                  <Select name="currency" defaultValue={user.currency}>
                    <SelectTrigger id="s-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-dateformat">Date format</Label>
                  <Select name="dateFormat" defaultValue={user.dateFormat}>
                    <SelectTrigger id="s-dateformat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-income">Monthly income target</Label>
                  <Input
                    id="s-income"
                    name="monthlyIncome"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={user.monthlyIncome}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-savings">Monthly savings goal</Label>
                  <Input
                    id="s-savings"
                    name="monthlySavingsGoal"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={user.monthlySavingsGoal}
                  />
                </div>
              </div>
              <input type="hidden" name="theme" value={theme ?? "system"} />
              <ErrorBanner state={profileState} />
              <SuccessBanner state={profileState} />
              <SubmitButton pending={profilePending} label="Save changes" />
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <CategoryManager categories={categories} />
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose which alerts you want to see. We keep them minimal — no spam.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={notifAction} className="space-y-4">
              {(
                [
                  ["billReminders", "Bill reminders", "Alert me before a bill is due"],
                  ["budgetAlerts", "Budget alerts", "Tell me when I'm near or over a budget"],
                  ["savingsMilestones", "Savings milestones", "Celebrate goal progress"],
                  ["monthlySummary", "Monthly summary", "A recap when a new month starts"],
                ] as const
              ).map(([key, title, description]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div>
                    <Label htmlFor={`notif-${key}`}>{title}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    id={`notif-${key}`}
                    name={key}
                    checked={prefs[key]}
                    onCheckedChange={(v) => togglePref(key, v)}
                  />
                </div>
              ))}
              <ErrorBanner state={notifState} />
              <SuccessBanner state={notifState} />
              <SubmitButton pending={notifPending} label="Save notification settings" />
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Light, dark, or follow your system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
              {(
                [
                  ["light", "Light", Sun],
                  ["dark", "Dark", Moon],
                  ["system", "System", Monitor],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={theme === value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border border-border p-4 transition-colors hover:bg-accent",
                    theme === value && "border-primary ring-2 ring-ring"
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Use at least 8 characters with a letter and a number.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={passwordAction} className="max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-current">Current password</Label>
                <Input id="p-current" name="currentPassword" type="password" autoComplete="current-password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-new">New password</Label>
                <Input id="p-new" name="newPassword" type="password" autoComplete="new-password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-confirm">Confirm new password</Label>
                <Input id="p-confirm" name="confirmPassword" type="password" autoComplete="new-password" required />
              </div>
              <ErrorBanner state={passwordState} />
              <SuccessBanner state={passwordState} />
              <SubmitButton pending={passwordPending} label="Change password" />
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
