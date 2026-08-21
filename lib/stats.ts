import type { DiaryEntry } from "./types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface Bucket {
  label: string;
  count: number;
}

function toBuckets(counts: Map<string, number>, order?: string[]): Bucket[] {
  const labels = order ?? [...counts.keys()].sort();
  return labels
    .filter((label) => counts.has(label))
    .map((label) => ({ label, count: counts.get(label)! }));
}

/** Distribution across Letterboxd's half-star rating scale, 0.5–5. */
export function ratingDistribution(movies: DiaryEntry[]): Bucket[] {
  const counts = new Map<string, number>();
  for (let r = 0.5; r <= 5; r += 0.5) counts.set(r.toFixed(1), 0);

  for (const m of movies) {
    if (m.rating == null) continue;
    const key = m.rating.toFixed(1);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()].map(([label, count]) => ({
    label: `${Number(label)}★`,
    count,
  }));
}

/** Release-decade breakdown, from the diary's own Year column. */
export function decadeBreakdown(movies: DiaryEntry[]): Bucket[] {
  const counts = new Map<string, number>();
  for (const m of movies) {
    if (!m.year) continue;
    const decade = `${Math.floor(m.year / 10) * 10}s`;
    counts.set(decade, (counts.get(decade) ?? 0) + 1);
  }
  return toBuckets(counts);
}

/** Which day of the week you actually watch on. */
export function watchDayPattern(movies: DiaryEntry[]): Bucket[] {
  const counts = new Map<string, number>();
  for (const day of DAY_NAMES) counts.set(day, 0);

  for (const m of movies) {
    const d = new Date(`${m.watchedDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    const day = DAY_NAMES[d.getDay()];
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return toBuckets(counts, DAY_NAMES);
}

/** Top N busiest months by number of films logged. */
export function busiestMonths(movies: DiaryEntry[], n = 5): Bucket[] {
  const counts = new Map<string, number>();
  for (const m of movies) {
    const month = m.watchedDate.slice(0, 7);
    if (!month) continue;
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || b.label.localeCompare(a.label))
    .slice(0, n)
    .map(({ label, count }) => ({
      label: new Date(`${label}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      count,
    }));
}

export function rewatchStats(movies: DiaryEntry[]) {
  const rewatches = movies.filter((m) => m.rewatch).length;
  return {
    count: rewatches,
    percent: movies.length ? Math.round((rewatches / movies.length) * 100) : 0,
  };
}

/** 5★ films and the lowest-rated film(s), by name. */
export function highsAndLows(movies: DiaryEntry[]) {
  const rated = movies.filter((m) => m.rating != null) as (DiaryEntry & {
    rating: number;
  })[];
  if (!rated.length) return { highs: [], lows: [], lowRating: null };

  const highs = rated.filter((m) => m.rating === 5).map((m) => m.name);
  const lowRating = Math.min(...rated.map((m) => m.rating));
  const lows = rated
    .filter((m) => m.rating === lowRating)
    .map((m) => m.name);

  return { highs, lows, lowRating };
}
