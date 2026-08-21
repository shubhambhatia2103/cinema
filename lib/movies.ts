import { loadDiary, loadReviews, reviewKey } from "./letterboxd";
import { fetchPosterUrl } from "./tmdb";
import type { Movie } from "./types";

const POSTER_CONCURRENCY = 8;

async function mapWithConcurrency<T, R>(
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

  const posterUrls = await mapWithConcurrency(
    diary,
    POSTER_CONCURRENCY,
    (entry) => fetchPosterUrl(entry.name, entry.year),
  );

  return diary.map((entry, i) => ({
    ...entry,
    posterUrl: posterUrls[i],
    review: reviews.get(reviewKey(entry.name, entry.watchedDate)) ?? null,
  }));
}
