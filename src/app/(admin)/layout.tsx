import { cookies } from "next/headers";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const collapsed = jar.get("meridian_sidebar")?.value === "collapsed";
  return <AdminShell initialCollapsed={collapsed}>{children}</AdminShell>;
}
