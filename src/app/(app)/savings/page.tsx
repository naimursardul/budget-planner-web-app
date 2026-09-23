import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import { GoalFormDialog, ContributionDialog } from "@/components/savings/goal-forms";
import { DeleteGoalButton } from "@/components/savings/delete-goal-button";
import { connectDB } from "@/lib/mongodb";
import { SavingsGoal } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { formatPercent, MONTH_NAMES } from "@/lib/utils";

export const metadata = { title: "Savings" };

/** Months to reach target at the current contribution rate (null = not on track). */
function projectedMonth(goal: { currentAmount: number; targetAmount: number; monthlyContribution: number }): string | null {
  if (goal.currentAmount >= goal.targetAmount) return "Complete";
  if (goal.monthlyContribution <= 0) return null;
  const months = Math.ceil((goal.targetAmount - goal.currentAmount) / goal.monthlyContribution);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function SavingsPage() {
  const user = await requireOnboardedUser();
  await connectDB();

  const goals = await SavingsGoal.find({ userId: user.id as never }).sort({ createdAt: 1 }).lean();

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-sm text-muted-foreground">
            {goals.length > 0
              ? `${formatPercent(overallPercent)} of your combined goals funded`
              : "Create goals and watch your progress grow."}
          </p>
        </div>
        <GoalFormDialog
          trigger={
            <Button>
              <Plus aria-hidden /> New Goal
            </Button>
          }
        />
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No savings goals yet"
          description="Whether it's an emergency fund, a vacation, or a new home — set a target and track every contribution."
          action={
            <GoalFormDialog
              trigger={
                <Button>
                  <Plus aria-hidden /> Create your first goal
                </Button>
              }
            />
          }
        />
      ) : (
        <>
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total saved across all goals</p>
                <p className="text-2xl font-bold">
                  <Money value={totalSaved} currency={user.currency} />
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    of <Money value={totalTarget} currency={user.currency} />
                  </span>
                </p>
              </div>
              <Badge variant={overallPercent >= 100 ? "success" : "lavender"}>
                {formatPercent(overallPercent)} funded
              </Badge>
            </div>
            <div className="mt-3">
              <Progress
                value={overallPercent}
                aria-label={`Overall savings progress: ${overallPercent}%`}
                indicatorClassName="bg-success"
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {goals.map((goal) => {
              const percent =
                goal.targetAmount > 0
                  ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                  : 0;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const projection = projectedMonth(goal);
              const record = {
                id: String(goal._id),
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                deadline: goal.deadline ? new Date(goal.deadline).toISOString().slice(0, 10) : "",
                monthlyContribution: goal.monthlyContribution,
                color: goal.color,
              };

              return (
                <Card key={record.id} className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3.5 rounded-full"
                        style={{ background: goal.color }}
                        aria-hidden
                      />
                      <h3 className="font-semibold">{goal.name}</h3>
                    </div>
                    <Badge variant={percent >= 100 ? "success" : "outline"}>
                      {percent >= 100 ? "Complete" : `${percent}%`}
                    </Badge>
                  </div>

                  <p className="mt-3 text-xl font-bold">
                    <Money value={goal.currentAmount} currency={user.currency} />
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / <Money value={goal.targetAmount} currency={user.currency} />
                    </span>
                  </p>

                  <div className="mt-3">
                    <Progress
                      value={percent}
                      aria-label={`${goal.name}: ${percent}% funded`}
                      indicatorClassName="bg-[var(--viz-3)]"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Remaining:{" "}
                      <Money value={remaining} currency={user.currency} className="font-medium" />
                    </span>
                    {goal.monthlyContribution > 0 && (
                      <span>
                        Monthly:{" "}
                        <Money value={goal.monthlyContribution} currency={user.currency} className="font-medium" />
                      </span>
                    )}
                    {goal.deadline && (
                      <span>
                        Deadline:{" "}
                        <span className="font-medium">
                          {new Date(goal.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    )}
                    <span>
                      Projected:{" "}
                      <span className="font-medium">{projection ?? "Set a monthly contribution"}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <ContributionDialog goal={record} />
                    <div className="flex gap-1">
                      <GoalFormDialog
                        editRecord={record}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      <DeleteGoalButton goalId={record.id} goalName={goal.name} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
