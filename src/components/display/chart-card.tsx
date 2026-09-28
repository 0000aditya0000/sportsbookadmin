export function ChartCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card shadow-[var(--shadow-card)]">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </header>
      <div className="px-2 py-3 sm:px-4">{children}</div>
      {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
    </section>
  );
}
