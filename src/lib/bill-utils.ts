/** Calendar events for a bill, derived from its frequency up to ~1 year out. */
export function billOccurrenceDates(dueDate: Date, frequency: string): Date[] {
  const dates: Date[] = [new Date(dueDate)];
  const now = new Date();
  const horizon = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  if (frequency === "one_time") return dates;

  const step = (date: Date) => {
    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "monthly":
      default:
        date.setMonth(date.getMonth() + 1);
        break;
    }
  };

  let cursor = new Date(dueDate);
  while (cursor <= horizon && dates.length < 60) {
    step(cursor);
    dates.push(new Date(cursor));
  }
  return dates.filter((dt) => dt >= new Date(now.getFullYear(), now.getMonth(), 1));
}
