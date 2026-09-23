import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DemoBanner } from "@/components/layout/demo-banner";
import { NotificationBell } from "@/components/layout/notification-bell";
import { AccessExpiredScreen } from "@/components/commerce/access-expired-screen";
import { requireOnboardedUser } from "@/lib/session";
import { getUnreadNotifications } from "@/services/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();

  // Access guard: expired prepaid windows pause the workspace (data preserved).
  if (!user.access.hasAccess) {
    return <AccessExpiredScreen name={user.name} />;
  }

  const notifications = await getUnreadNotifications(user.id, 10);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <div className="lg:pl-60">
        {user.isDemo && <DemoBanner />}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-end px-4">
            <NotificationBell
              notifications={notifications.map((n) => ({
                id: String(n._id),
                type: n.type,
                title: n.title,
                message: n.message,
                read: n.read,
                createdAt: n.createdAt.toISOString(),
              }))}
            />
          </div>
        </header>
        <div className="hidden justify-end px-6 pt-4 lg:flex">
          <NotificationBell
            notifications={notifications.map((n) => ({
              id: String(n._id),
              type: n.type,
              title: n.title,
              message: n.message,
              read: n.read,
              createdAt: n.createdAt.toISOString(),
            }))}
          />
        </div>
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:pb-10 lg:pt-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
