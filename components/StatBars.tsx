import type { Bucket } from "@/lib/stats";

/**
 * A single-series horizontal bar list. Mark spec: bars capped at 20px
 * thick with a 4px rounded end (square at the baseline), a hairline
 * baseline per row, and the count as a direct label at the tip —
 * no legend, since there's only one series and the heading already
 * names it.
 */
export default function StatBars({ buckets }: { buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="space-y-2">
      {buckets.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-right text-xs text-muted">
            {b.label}
          </span>
          <div className="h-5 flex-1 border-b border-ink/10">
            <div
              className="h-5 rounded-r-[4px] bg-accent"
              style={{ width: `${(b.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-xs tabular-nums text-ink/70">
            {b.count || ""}
          </span>
        </div>
      ))}
    </div>
  );
}
