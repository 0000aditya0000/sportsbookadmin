import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModulePlaceholder } from "@/features/system/module-placeholder";
import { matchAppRoute } from "@/config/routes";

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const match = matchAppRoute(`/${slug.join("/")}`);
  return { title: match?.route.title ?? "Not found" };
}

export default async function ModuleRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const pathname = `/${slug.join("/")}`;
  const match = matchAppRoute(pathname);
  if (!match || match.route.href === "/dashboard") notFound();
  return <ModulePlaceholder route={match.route} params={match.params} />;
}
