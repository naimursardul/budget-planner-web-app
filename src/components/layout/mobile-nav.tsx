"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { MOBILE_NAV, MAIN_NAV, FOOTER_NAV } from "@/lib/nav";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

/** Bottom navigation bar (mobile) + slide-down menu for the remaining pages. */
export function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden />
      )}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Mobile navigation"
      >
        {menuOpen && (
          <div className="max-h-[60dvh] overflow-y-auto border-b border-border p-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                All pages
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1 hover:bg-accent"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {MAIN_NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
              {FOOTER_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              ))}
              <form action={logoutAction} className="contents">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-accent"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Logout
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5">
          {MOBILE_NAV.slice(0, 4).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("size-5", active && "text-primary")} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="More pages"
            className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
          >
            <Menu className="size-5" aria-hidden />
            More
          </button>
        </div>
      </nav>
    </>
  );
}
