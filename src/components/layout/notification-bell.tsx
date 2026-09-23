"use client";

import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/actions/notifications";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell({ notifications }: { notifications: NotificationItem[] }) {
  const unread = notifications.filter((n) => !n.read);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell aria-hidden />
          {unread.length > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
              aria-hidden
            >
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unread.length > 0 && (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="ghost" size="sm" className="h-7 text-xs">
                <CheckCheck aria-hidden /> Mark all read
              </Button>
            </form>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex-col items-start gap-0.5 whitespace-normal py-2.5",
                  !notification.read && "bg-accent/60"
                )}
                onSelect={(e) => e.preventDefault()}
              >
                <form
                  action={markNotificationReadAction}
                  className="w-full text-left"
                >
                  <input type="hidden" name="id" value={notification.id} />
                  <button
                    type="submit"
                    className="w-full text-left disabled:cursor-default"
                    disabled={notification.read}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      {!notification.read && (
                        <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-label="Unread" />
                      )}
                      {notification.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                  </button>
                </form>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
