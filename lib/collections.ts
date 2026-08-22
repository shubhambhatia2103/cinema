import { getMovies, mapWithConcurrency } from "./movies";
import { fetchCollectionParts, fetchCollectionRef } from "./tmdb";

export interface CollectionPart {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  /** Set when this part is one of your own diary entries. */
  slug: string | null;
}

export interface CollectionSummary {
  id: number;
  name: string;
  parts: CollectionPart[];
  watchedCount: number;
  totalCount: number;
}

const CONCURRENCY = 8;

/**
 * Franchise groupings across your library — e.g. all 4 John Wicks as
 * one entry with a "3 of 4 watched" progress count. Built from the
 * same movies the grid already enriches, plus two more TMDB calls per
 * unique franchise (collection membership, then the collection's full
 * part list) — only paid once, at build time, for this page.
 */
export async function getCollections(): Promise<CollectionSummary[]> {
  const movies = await getMovies();
  const withTmdbId = movies.filter(
    (m): m is typeof m & { tmdbId: number } => m.tmdbId != null,
  );

  const refs = await mapWithConcurrency(withTmdbId, CONCURRENCY, (m) =>
    fetchCollectionRef(m.tmdbId),
  );

  const uniqueCollectionIds = [
    ...new Set(refs.filter((r) => r != null).map((r) => r.id)),
  ];

  const details = await mapWithConcurrency(
    uniqueCollectionIds,
    CONCURRENCY,
    (id) => fetchCollectionParts(id),
  );

  const slugByTmdbId = new Map(movies.map((m) => [m.tmdbId, m.slug]));

  const summaries: CollectionSummary[] = [];
  for (const detail of details) {
    if (!detail || detail.parts.length < 2) continue;

    const parts: CollectionPart[] = detail.parts.map((p) => ({
      ...p,
      slug: slugByTmdbId.get(p.tmdbId) ?? null,
    }));
    const watchedCount = parts.filter((p) => p.slug != null).length;
    if (watchedCount === 0) continue;

    summaries.push({
      id: detail.id,
      name: detail.name,
      parts,
      watchedCount,
      totalCount: parts.length,
    });
  }

  summaries.sort(
    (a, b) =>
      Number(b.watchedCount === b.totalCount) -
        Number(a.watchedCount === a.totalCount) ||
      b.watchedCount - a.watchedCount ||
      a.name.localeCompare(b.name),
  );

  return summaries;
}
