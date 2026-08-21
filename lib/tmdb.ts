const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

// TMDB's official movie genre IDs — a small, stable list, so it's
// cheaper to hardcode than to fetch /genre/movie/list on every build.
const GENRE_NAMES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface TmdbSearchResult {
  id: number;
  poster_path: string | null;
  genre_ids?: number[];
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[];
}

interface TmdbCrewMember {
  job: string;
  name: string;
}

interface TmdbCreditsResponse {
  crew: TmdbCrewMember[];
}

export interface TmdbEnrichment {
  posterUrl: string | null;
  genres: string[];
  director: string | null;
}

const EMPTY: TmdbEnrichment = { posterUrl: null, genres: [], director: null };

async function fetchDirector(movieId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: THIRTY_DAYS } },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as TmdbCreditsResponse;
    return data.crew?.find((c) => c.job === "Director")?.name ?? null;
  } catch {
    return null;
  }
}

/**
 * Looks up a film on TMDB by title/year and returns its poster, genres,
 * and director. Returns all-null/empty when TMDB_API_KEY isn't
 * configured or no match is found — callers should fall back to a
 * text-only card in that case.
 */
export async function fetchTmdbEnrichment(
  name: string,
  year: number,
): Promise<TmdbEnrichment> {
  if (!TMDB_API_KEY) return EMPTY;

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
    if (!res.ok) return EMPTY;

    const data = (await res.json()) as TmdbSearchResponse;
    const result = data.results?.[0];
    if (!result) return EMPTY;

    const posterUrl = result.poster_path
      ? `${TMDB_IMAGE_BASE}${result.poster_path}`
      : null;
    const genres = (result.genre_ids ?? [])
      .map((id) => GENRE_NAMES[id])
      .filter((g): g is string => Boolean(g));

    const director = await fetchDirector(result.id);

    return { posterUrl, genres, director };
  } catch {
    return EMPTY;
  }
}
