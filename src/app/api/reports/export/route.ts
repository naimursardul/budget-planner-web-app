import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "@/models";
import { getCurrentUser } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";

/**
 * CSV export of transactions in a date range.
 * Identity is derived from the session — never from query parameters.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  if (!from || !to || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  await connectDB();
  const rows = await Transaction.find({
    userId: user.id as never,
    date: { $gte: new Date(from), $lte: new Date(`${to}T23:59:59.999`) },
  })
    .sort({ date: 1 })
    .lean();

  const header = ["Date", "Type", "Category", "Sub-category", "Description", "Amount", "Account"];
  const escape = (value: string | number) => {
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.date.toISOString().slice(0, 10),
        row.type,
        row.categoryName,
        row.subcategory ?? "",
        row.description ?? "",
        row.amount.toFixed(2),
        row.account,
      ]
        .map(escape)
        .join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${from}-to-${to}.csv"`,
    },
  });
}
