"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { searchPlatform } from "@/lib/api/search";
import type { SearchResult } from "@/lib/validation/search";

const groupOrder = [
  "user",
  "agent",
  "sport",
  "event",
  "wallet",
  "bet",
  "transaction",
  "withdrawal",
  "deposit",
  "referral",
  "commission",
  "session",
] as const;

const groupLabels: Record<(typeof groupOrder)[number], string> = {
  user: "Users",
  agent: "Agents",
  sport: "Sports",
  event: "Events",
  wallet: "Wallets",
  bet: "Bets",
  transaction: "Transactions",
  withdrawal: "Withdrawals",
  deposit: "Deposits",
  referral: "Referrals",
  commission: "Commissions",
  session: "Sessions",
};

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), 200);
    return () => window.clearTimeout(timer);
  }, [value]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setValue("");
      setDebounced("");
    }
    onOpenChange(next);
  }

  const query = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchPlatform(debounced),
    enabled: open,
  });

  const groups = useMemo(() => {
    const results = query.data?.results ?? [];
    return groupOrder
      .map((type) => ({
        type,
        label: groupLabels[type],
        items: results.filter((item) => item.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [query.data]);

  function openResult(item: SearchResult) {
    handleOpenChange(false);
    router.push(item.href);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent hideClose className="top-[18%] w-[min(100%-2rem,40rem)] translate-y-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search the platform</DialogTitle>
        <DialogDescription className="sr-only">
          Search users, agents, bets, events, referrals, commissions, transactions, withdrawals, and deposits.
        </DialogDescription>
        <Command shouldFilter={false}>
          <CommandInput
            autoFocus
            value={value}
            onValueChange={setValue}
            placeholder="Search users, bets, events, references"
          />
          <CommandList>
            {query.isFetching ? <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p> : null}
            <CommandEmpty>No matches for “{debounced}”.</CommandEmpty>
            {debounced.trim().length === 0 && groups.length > 0 ? (
              <p className="px-2 pt-1 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Suggested
              </p>
            ) : null}
            {groups.map((group) => (
              <CommandGroup key={group.type} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem key={item.id} value={`${item.type}-${item.id}`} onSelect={() => openResult(item)}>
                    <span>
                      <span className="block font-medium">{item.title}</span>
                      <span className="block text-xs text-muted-foreground">{item.subtitle}</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{item.id}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
