import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Receipt,
  CalendarDays,
  PiggyBank,
  Landmark,
  Flag,
  BarChart3,
  Settings,
  CircleHelp,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: Target },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/debt", label: "Debt", icon: Landmark },
  { href: "/priorities", label: "Priorities", icon: Flag },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

/** Bottom bar on mobile — 5 items max for tap comfort. */
export const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: Target },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export const FOOTER_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/faq", label: "Help", icon: CircleHelp },
];

export const LOGOUT_ICON = LogOut;
