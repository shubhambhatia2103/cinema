const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

interface TmdbSearchResult {
  poster_path: string | null;
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[];
}

/**
 * Looks up a poster on TMDB for a given title/year. Returns null when
 * TMDB_API_KEY isn't configured or no match is found — callers should
 * fall back to a text-only card in that case.
 */
export async function fetchPosterUrl(
  name: string,
  year: number,
): Promise<string | null> {
  if (!TMDB_API_KEY) return null;

  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: name,
    ...(year ? { year: String(year) } : {}),
  });

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params.toString()}`,
      { next: { revalidate: THIRTY_DAYS } },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as TmdbSearchResponse;
    const posterPath = data.results?.[0]?.poster_path;
    return posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
  } catch {
    return null;
  }
}
