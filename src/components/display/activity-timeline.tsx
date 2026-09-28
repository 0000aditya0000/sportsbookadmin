import { formatTime } from "@/lib/format";

export function ActivityTimeline({
  items,
}: {
  items: { id: string; title: string; detail: string; at: string }[];
}) {
  return (
    <ol className="grid gap-3">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[4.5rem_1fr] gap-3">
          <time className="pt-0.5 font-mono text-[11px] text-muted-foreground" dateTime={item.at}>
            {formatTime(item.at)}
          </time>
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
