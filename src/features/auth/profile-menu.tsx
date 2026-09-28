"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/session-provider";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

export function ProfileMenu() {
  const session = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const name = session.status === "ready" ? session.admin.displayName : "Admin";

  async function confirmLogout() {
    setLoading(true);
    try {
      const result = await logout();
      if (!result.data.ended) {
        toast.error("Logout was not confirmed.");
        return;
      }
      queryClient.clear();
      toast.success("Session ended.", { description: result.requestId });
      router.replace("/login");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Logout failed.";
      toast.error(message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu" className="w-auto gap-2 px-1.5">
            <UserAvatar label={name} />
            <span className="hidden text-left leading-tight xl:block">
              <span className="block text-[13px] font-medium">{name}</span>
              <span className="block text-[11px] text-muted-foreground">Super Admin</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <span className="block text-sm font-medium text-foreground">{name}</span>
            <span className="block font-normal">{session.status === "ready" ? session.admin.email : "Loading profile"}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/security">Security</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/permissions">Permissions</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={open}
        title="End this session?"
        description="You will need the password and a 2FA code to sign in again. The server must confirm the session has ended."
        confirmLabel="Log out"
        variant="destructive"
        loading={loading}
        details={
          session.status === "ready"
            ? [
                { label: "Admin", value: session.admin.id },
                { label: "Session", value: session.sessionId },
              ]
            : undefined
        }
        onConfirm={() => void confirmLogout()}
        onOpenChange={setOpen}
      />
    </>
  );
}
