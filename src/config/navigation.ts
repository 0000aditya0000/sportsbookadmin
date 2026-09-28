import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Bell,
  Cable,
  CalendarDays,
  ChartColumn,
  GitBranch,
  Layers,
  LayoutDashboard,
  MonitorSmartphone,
  Percent,
  Radio,
  Receipt,
  ScrollText,
  Settings,
  Share2,
  ShieldAlert,
  Trophy,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/config/permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigation: readonly NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/agents", label: "Agents", icon: Users, permission: PERMISSIONS.AGENT_VIEW },
      { href: "/users", label: "Users", icon: UserRound, permission: PERMISSIONS.USER_VIEW },
    ],
  },
  {
    label: "Sports operations",
    items: [
      { href: "/sports", label: "Sports", icon: Trophy, permission: PERMISSIONS.SPORT_VIEW },
      { href: "/events", label: "Events", icon: CalendarDays, permission: PERMISSIONS.EVENT_VIEW },
      { href: "/markets", label: "Markets", icon: Layers, permission: PERMISSIONS.DASHBOARD_VIEW },
      { href: "/live-betting", label: "Live betting", icon: Radio, permission: PERMISSIONS.DASHBOARD_VIEW },
      { href: "/bets", label: "Bets", icon: Receipt, permission: PERMISSIONS.DASHBOARD_VIEW },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/wallet", label: "Wallet", icon: Wallet, permission: PERMISSIONS.WALLET_VIEW },
      {
        href: "/transactions",
        label: "Transactions",
        icon: ArrowLeftRight,
        permission: PERMISSIONS.TRANSACTION_VIEW,
      },
      {
        href: "/deposits",
        label: "Deposits",
        icon: ArrowDownToLine,
        permission: PERMISSIONS.DEPOSIT_VIEW,
      },
      {
        href: "/withdrawals",
        label: "Withdrawals",
        icon: ArrowUpFromLine,
        permission: PERMISSIONS.WITHDRAWAL_VIEW,
      },
    ],
  },
  {
    label: "Referrals",
    items: [
      { href: "/referrals", label: "Referral overview", icon: Share2, permission: PERMISSIONS.REFERRAL_VIEW },
      { href: "/referrals/tree", label: "Referral tree", icon: GitBranch, permission: PERMISSIONS.REFERRAL_VIEW },
      {
        href: "/referrals/commissions",
        label: "Commission history",
        icon: Receipt,
        permission: PERMISSIONS.REFERRAL_COMMISSION_VIEW,
      },
      {
        href: "/referrals/commission-config",
        label: "Commission config",
        icon: Percent,
        permission: PERMISSIONS.REFERRAL_CONFIG_VIEW,
      },
      {
        href: "/referrals/reports",
        label: "Referral reports",
        icon: ChartColumn,
        permission: PERMISSIONS.REFERRAL_COMMISSION_VIEW,
      },
    ],
  },
  {
    label: "Risk and analytics",
    items: [
      { href: "/risk", label: "Risk", icon: ShieldAlert, permission: PERMISSIONS.DASHBOARD_VIEW },
      { href: "/reports", label: "Reports", icon: ChartColumn, permission: PERMISSIONS.REPORT_VIEW },
    ],
  },
  {
    label: "Security",
    items: [
      {
        href: "/sessions",
        label: "Sessions",
        icon: MonitorSmartphone,
        permission: PERMISSIONS.SESSION_VIEW,
      },
      { href: "/audit-logs", label: "Audit logs", icon: ScrollText, permission: PERMISSIONS.AUDIT_VIEW },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell, permission: PERMISSIONS.DASHBOARD_VIEW },
      { href: "/system/providers", label: "Providers", icon: Cable, permission: PERMISSIONS.PROVIDER_VIEW },
      { href: "/settings", label: "Settings", icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
