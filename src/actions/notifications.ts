"use server";

import { revalidatePath } from "next/cache";
import { Notification } from "@/models";
import { requireUser } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await connectDB();
  await Notification.updateOne(
    { _id: id, userId: user.id as never },
    { $set: { read: true } }
  );
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await connectDB();
  await Notification.updateMany(
    { userId: user.id as never, read: false },
    { $set: { read: true } }
  );
  revalidatePath("/dashboard");
}
