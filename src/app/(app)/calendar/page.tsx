import { CalendarDays, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { MonthSwitcher } from "@/components/month-switcher";
import { EventFormDialog } from "@/components/calendar/event-form";
import { EventActions } from "@/components/calendar/event-actions";
import { AddEventButton } from "@/components/calendar/add-event-button";
import { connectDB } from "@/lib/mongodb";
import { CalendarEvent } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { cn, isValidMonthKey, monthRange, parseMonthKey } from "@/lib/utils";

export const metadata = { title: "Calendar" };

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_BADGE: Record<string, string> = {
  bill: "bg-peach/60",
  income: "bg-sage/60",
  debt: "bg-blush/60",
  savings: "bg-lavender/60",
  custom: "bg-sky/60",
};

export default async function CalendarPage({ searchParams }: PageProps) {
  const user = await requireOnboardedUser();
  const { month: rawMonth } = await searchParams;
  const month = isValidMonthKey(rawMonth)
    ? rawMonth
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const { year, month: m } = parseMonthKey(month);
  const { start, end } = monthRange(year, m);

  await connectDB();
  const events = await CalendarEvent.find({
    userId: user.id as never,
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  // Group events by day of month
  const byDay = new Map<number, typeof events>();
  for (const event of events) {
    const day = new Date(event.date).getDate();
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(event);
  }

  const firstDay = new Date(year, m - 1, 1);
  const daysInMonth = new Date(year, m, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const today = new Date();

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dateKey(day: number): string {
    return `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Bills, income dates, debt payments and your own events in one view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthSwitcher month={month} />
          <EventFormDialog
            trigger={
              <Button>
                <Plus aria-hidden /> Add Event
              </Button>
            }
          />
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing on your calendar yet"
          description="Bills you add appear here automatically. You can also add income dates, savings contributions, debt payments and custom events."
          action={
            <EventFormDialog
              trigger={
                <Button>
                  <Plus aria-hidden /> Add Event
                </Button>
              }
            />
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d[0]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const isToday =
                day !== null &&
                today.getFullYear() === year &&
                today.getMonth() === m - 1 &&
                today.getDate() === day;
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-24 border-b border-r border-border p-1 last:border-r-0 sm:min-h-28",
                    i % 7 === 6 && "border-r-0",
                    day === null && "bg-muted/30"
                  )}
                >
                  {day !== null && (
                    <>
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "ml-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                            isToday && "bg-primary text-primary-foreground"
                          )}
                          aria-label={isToday ? "Today" : undefined}
                        >
                          {day}
                        </span>
                        <AddEventButton date={dateKey(day)} />
                      </div>
                      <ul className="mt-1 space-y-1">
                        {(byDay.get(day) ?? []).map((event) => (
                          <li
                            key={String(event._id)}
                            className={cn(
                              "rounded-lg px-1.5 py-1 text-left",
                              TYPE_BADGE[event.type] ?? TYPE_BADGE.custom,
                              event.completed && "opacity-50 line-through"
                            )}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-[11px] font-medium leading-tight">
                                {event.title}
                              </span>
                              <EventActions
                                event={{
                                  id: String(event._id),
                                  title: event.title,
                                  date: new Date(event.date).toISOString().slice(0, 10),
                                  type: event.type,
                                  color: event.color,
                                  notes: event.notes,
                                  completed: event.completed,
                                  fromBill: event.sourceId !== null,
                                }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {[
          ["Bill", "bg-peach/60"],
          ["Income", "bg-sage/60"],
          ["Debt payment", "bg-blush/60"],
          ["Savings", "bg-lavender/60"],
          ["Custom", "bg-sky/60"],
        ].map(([label, color]) => (
          <Badge key={label} variant="outline" className="gap-1.5">
            <span className={cn("size-2.5 rounded-sm", color)} aria-hidden />
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
