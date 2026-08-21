import Link from "next/link";
import { loadDiary } from "@/lib/letterboxd";
import {
  busiestMonths,
  decadeBreakdown,
  highsAndLows,
  ratingDistribution,
  rewatchStats,
  watchDayPattern,
} from "@/lib/stats";
import StatBars from "@/components/StatBars";

export const metadata = {
  title: "Stats — Cinema",
};

export default function StatsPage() {
  const movies = loadDiary();
  const rated = movies.filter((m) => m.rating != null);
  const avgRating = rated.length
    ? (
        rated.reduce((sum, m) => sum + (m.rating ?? 0), 0) / rated.length
      ).toFixed(1)
    : null;

  const rewatch = rewatchStats(movies);
  const { highs, lows, lowRating } = highsAndLows(movies);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-ink/10 pb-8">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-muted underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          ← Log
        </Link>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          Stats
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Everything below is computed straight from the diary export — no
          extra lookups.
        </p>

        <div className="mt-5 flex flex-wrap gap-6 text-sm text-ink/80">
          <span>
            <strong className="font-serif text-lg text-ink">
              {movies.length}
            </strong>{" "}
            films logged
          </span>
          {avgRating && (
            <span>
              <strong className="font-serif text-lg text-ink">
                {avgRating}
              </strong>{" "}
              avg rating
            </span>
          )}
          <span>
            <strong className="font-serif text-lg text-ink">
              {rewatch.count}
            </strong>{" "}
            rewatches ({rewatch.percent}%)
          </span>
        </div>
      </header>

      {movies.length === 0 ? (
        <p className="text-muted">
          No entries yet — drop your Letterboxd diary export at{" "}
          <code className="text-ink/80">data/diary.csv</code>.
        </p>
      ) : (
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          <section>
            <h2 className="mb-4 font-serif text-xl text-ink/90">
              Rating distribution
            </h2>
            <StatBars buckets={ratingDistribution(movies)} />
          </section>

          <section>
            <h2 className="mb-4 font-serif text-xl text-ink/90">
              By decade
            </h2>
            <StatBars buckets={decadeBreakdown(movies)} />
          </section>

          <section>
            <h2 className="mb-4 font-serif text-xl text-ink/90">
              Watch-day pattern
            </h2>
            <StatBars buckets={watchDayPattern(movies)} />
          </section>

          <section>
            <h2 className="mb-4 font-serif text-xl text-ink/90">
              Busiest months
            </h2>
            <StatBars buckets={busiestMonths(movies)} />
          </section>

          <section className="sm:col-span-2">
            <h2 className="mb-4 font-serif text-xl text-ink/90">
              Highs and lows
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                  5★ ({highs.length})
                </p>
                <ul className="space-y-1 text-sm text-ink/80">
                  {highs.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
              {lowRating != null && (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                    Lowest rated ({Number(lowRating)}★)
                  </p>
                  <ul className="space-y-1 text-sm text-ink/80">
                    {lows.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
