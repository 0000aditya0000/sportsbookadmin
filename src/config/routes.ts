export type AppRoute = {
  href: string;
  title: string;
  description: string;
  group: string;
  links?: { href: string; label: string }[];
};

export const appRoutes: readonly AppRoute[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Platform health, turnover, exposure, and live betting activity.",
    group: "Overview",
  },
  {
    href: "/agents",
    title: "Agents",
    description: "Agent accounts, balances, turnover, and commission.",
    group: "Management",
  },
  {
    href: "/agents/:agentId",
    title: "Agent detail",
    description: "Agent performance, users, wallet, and activity.",
    group: "Management",
  },
  {
    href: "/users",
    title: "Users",
    description: "Platform users, account status, and betting activity.",
    group: "Management",
  },
  {
    href: "/users/:userId",
    title: "User detail",
    description: "User profile, wallet, bets, sessions, and risk.",
    group: "Management",
  },
  {
    href: "/sports",
    title: "Sports",
    description: "Monitor configured sports, competitions and event activity.",
    group: "Sports operations",
  },
  {
    href: "/sports/:sportId",
    title: "Sport detail",
    description: "Competitions and events for a configured sport.",
    group: "Sports operations",
  },
  {
    href: "/events",
    title: "Events",
    description: "Monitor scheduled and live sporting events across configured competitions.",
    group: "Sports operations",
  },
  {
    href: "/events/:eventId",
    title: "Event detail",
    description: "Event status, participants, and provider reference.",
    group: "Sports operations",
  },
  {
    href: "/markets",
    title: "Markets",
    description: "Provider markets, selection state, and platform limits.",
    group: "Sports operations",
  },
  {
    href: "/markets/:marketId",
    title: "Market detail",
    description: "Market status, selections, and the latest provider update.",
    group: "Sports operations",
  },
  {
    href: "/live-betting",
    title: "Live betting",
    description: "Live events, odds movement, exposure, and operator alerts.",
    group: "Sports operations",
  },
  {
    href: "/bets",
    title: "Bets",
    description: "Bet monitoring across users, agents, and providers.",
    group: "Sports operations",
  },
  {
    href: "/bets/:betId",
    title: "Bet detail",
    description: "Stake, odds, settlement, and provider reference.",
    group: "Sports operations",
  },
  {
    href: "/wallet",
    title: "Wallet",
    description: "Monitor platform wallet balances, held funds and financial liability.",
    group: "Finance",
    links: [{ href: "/wallet/ledger", label: "Ledger" }],
  },
  {
    href: "/wallet/ledger",
    title: "Ledger",
    description: "Backend-derived debit and credit entries. Balances are not edited here.",
    group: "Finance",
  },
  {
    href: "/transactions",
    title: "Transactions",
    description: "Monitor wallet movements across users and agents.",
    group: "Finance",
  },
  {
    href: "/transactions/:transactionId",
    title: "Transaction detail",
    description: "Transaction status, amount, and reference.",
    group: "Finance",
  },
  {
    href: "/deposits",
    title: "Deposits",
    description: "Review inbound deposits from pending through completion.",
    group: "Finance",
  },
  {
    href: "/deposits/:depositId",
    title: "Deposit detail",
    description: "Deposit status and review actions.",
    group: "Finance",
  },
  {
    href: "/withdrawals",
    title: "Withdrawals",
    description: "Review withdrawal requests. Approval and rejection require confirmation.",
    group: "Finance",
  },
  {
    href: "/withdrawals/:withdrawalId",
    title: "Withdrawal detail",
    description: "Withdrawal status and review actions.",
    group: "Finance",
  },
  {
    href: "/referrals",
    title: "Referral Management",
    description: "Monitor referral relationships, six-level network activity and referral commission.",
    group: "Referrals",
    links: [
      { href: "/referrals/tree", label: "Referral tree" },
      { href: "/referrals/commissions", label: "Commission history" },
      { href: "/referrals/commission-config", label: "Commission config" },
      { href: "/referrals/reports", label: "Referral reports" },
    ],
  },
  {
    href: "/referrals/tree",
    title: "Referral Tree",
    description: "Inspect the six-level referral hierarchy for a selected user.",
    group: "Referrals",
  },
  {
    href: "/referrals/commissions",
    title: "Referral Commission History",
    description: "Inspect referral commissions generated from qualifying bets.",
    group: "Referrals",
  },
  {
    href: "/referrals/commission-config",
    title: "Referral Commission Configuration",
    description: "Configure commission percentages for the six referral levels.",
    group: "Referrals",
  },
  {
    href: "/referrals/reports",
    title: "Referral Reports",
    description: "Aggregated referral commission and registration statistics.",
    group: "Referrals",
  },
  {
    href: "/risk",
    title: "Risk",
    description: "Exposure, large bets, and unusual activity from the backend.",
    group: "Risk and analytics",
    links: [
      { href: "/risk/exposure", label: "Exposure" },
      { href: "/risk/limits", label: "Limits" },
      { href: "/risk/rules", label: "Rules" },
    ],
  },
  {
    href: "/risk/exposure",
    title: "Exposure",
    description: "Backend-calculated exposure by event, market, user, and agent.",
    group: "Risk and analytics",
  },
  {
    href: "/risk/limits",
    title: "Limits",
    description: "Platform limits once a backend contract is connected.",
    group: "Risk and analytics",
  },
  {
    href: "/risk/rules",
    title: "Rules",
    description: "Risk rules once a backend contract is connected.",
    group: "Risk and analytics",
  },
  {
    href: "/reports",
    title: "Reports",
    description: "Financial, betting, sports, and agent reports.",
    group: "Risk and analytics",
  },
  {
    href: "/sessions",
    title: "Sessions",
    description: "Active, revoked, and expired sessions.",
    group: "Security",
  },
  {
    href: "/audit-logs",
    title: "Audit logs",
    description: "Administrative actions, actors, and request identifiers.",
    group: "Security",
  },
  {
    href: "/notifications",
    title: "Notifications",
    description: "Operational alerts by severity.",
    group: "System",
  },
  {
    href: "/system/providers",
    title: "Providers",
    description: "Provider availability, latency, and synchronization.",
    group: "System",
    links: [{ href: "/system/health", label: "System health" }],
  },
  {
    href: "/system/health",
    title: "System health",
    description: "API, data stores, sockets, provider, and payment services.",
    group: "System",
  },
  {
    href: "/settings",
    title: "Settings",
    description: "Settings appear here only when a backend contract exists.",
    group: "System",
    links: [
      { href: "/settings/security", label: "Security" },
      { href: "/settings/permissions", label: "Permissions" },
    ],
  },
  {
    href: "/settings/security",
    title: "Security",
    description: "Profile, password, two-factor authentication, and this admin session.",
    group: "System",
  },
  {
    href: "/settings/permissions",
    title: "Permissions",
    description: "Permission-aware navigation. The backend remains the security boundary.",
    group: "System",
  },
];

export type MatchedRoute = {
  route: AppRoute;
  params: Record<string, string>;
};

export function matchAppRoute(pathname: string): MatchedRoute | null {
  const path = pathname.split("?")[0] ?? pathname;
  const actual = path.split("/").filter(Boolean);

  for (const route of appRoutes) {
    const pattern = route.href.split("/").filter(Boolean);
    if (pattern.length !== actual.length) continue;
    const params: Record<string, string> = {};
    let matched = true;
    for (let index = 0; index < pattern.length; index += 1) {
      const token = pattern[index] ?? "";
      const value = actual[index] ?? "";
      if (token.startsWith(":")) {
        params[token.slice(1)] = decodeURIComponent(value);
      } else if (token !== value) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }

  return null;
}

export function breadcrumbsFor(pathname: string): { label: string; href?: string }[] {
  const match = matchAppRoute(pathname);
  if (!match) return [{ label: "Meridian" }];
  const parent = appRoutes.find(
    (route) => route.group === match.route.group && !route.href.includes(":"),
  );
  const crumbs: { label: string; href?: string }[] = [
    { label: match.route.group, href: parent?.href },
  ];
  if (match.route.title !== match.route.group) {
    crumbs.push({ label: match.route.title });
  }
  return crumbs;
}
