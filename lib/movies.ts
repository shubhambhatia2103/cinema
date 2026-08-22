import { loadDiary, loadReviews, reviewKey } from "./letterboxd";
import { fetchTmdbEnrichment, fetchTrailerKey } from "./tmdb";
import type { Movie, MovieDetail } from "./types";

const ENRICHMENT_CONCURRENCY = 8;

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export async function getMovies(): Promise<Movie[]> {
  const diary = loadDiary();
  const reviews = loadReviews();

  const enrichments = await mapWithConcurrency(
    diary,
    ENRICHMENT_CONCURRENCY,
    (entry) => fetchTmdbEnrichment(entry.name, entry.year),
  );

  return diary.map((entry, i) => ({
    ...entry,
    ...enrichments[i],
    review: reviews.get(reviewKey(entry.name, entry.watchedDate)) ?? null,
  }));
}

export function getAllSlugs(): string[] {
  return loadDiary().map((entry) => entry.slug);
}

/** Same enrichment as the grid, plus a trailer lookup for the one film. */
export async function getMovieDetail(
  slug: string,
): Promise<MovieDetail | null> {
  const entry = loadDiary().find((d) => d.slug === slug);
  if (!entry) return null;

  const enrichment = await fetchTmdbEnrichment(entry.name, entry.year);
  const trailerKey = enrichment.tmdbId
    ? await fetchTrailerKey(enrichment.tmdbId)
    : null;
  const reviews = loadReviews();

  return {
    ...entry,
    ...enrichment,
    review: reviews.get(reviewKey(entry.name, entry.watchedDate)) ?? null,
    trailerKey,
  };
}
