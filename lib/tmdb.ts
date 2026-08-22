const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
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
  backdrop_path: string | null;
  overview: string | null;
  vote_average: number | null;
  genre_ids?: number[];
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[];
}

interface TmdbCastMember {
  name: string;
  order: number;
}

interface TmdbCrewMember {
  job: string;
  name: string;
}

interface TmdbCreditsResponse {
  cast?: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

interface TmdbVideosResponse {
  results: TmdbVideo[];
}

export interface TmdbEnrichment {
  tmdbId: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  voteAverage: number | null;
  genres: string[];
  director: string | null;
  cast: string[];
}

const EMPTY: TmdbEnrichment = {
  tmdbId: null,
  posterUrl: null,
  backdropUrl: null,
  overview: null,
  voteAverage: null,
  genres: [],
  director: null,
  cast: [],
};

const CAST_SIZE = 6;

async function fetchCredits(
  movieId: number,
): Promise<{ director: string | null; cast: string[] }> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: THIRTY_DAYS } },
    );
    if (!res.ok) return { director: null, cast: [] };

    const data = (await res.json()) as TmdbCreditsResponse;
    const director = data.crew?.find((c) => c.job === "Director")?.name ?? null;
    const cast = [...(data.cast ?? [])]
      .sort((a, b) => a.order - b.order)
      .slice(0, CAST_SIZE)
      .map((c) => c.name);

    return { director, cast };
  } catch {
    return { director: null, cast: [] };
  }
}

/**
 * Looks up a film on TMDB by title/year and returns everything the grid
 * and the film detail page need from it — poster, backdrop, overview,
 * TMDB's own rating, genres, director, and top cast. Two calls total
 * (search + credits); returns all-null/empty when TMDB_API_KEY isn't
 * configured or no match is found.
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
    const backdropUrl = result.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${result.backdrop_path}`
      : null;
    const genres = (result.genre_ids ?? [])
      .map((id) => GENRE_NAMES[id])
      .filter((g): g is string => Boolean(g));

    const { director, cast } = await fetchCredits(result.id);

    return {
      tmdbId: result.id,
      posterUrl,
      backdropUrl,
      overview: result.overview || null,
      voteAverage: result.vote_average ?? null,
      genres,
      director,
      cast,
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Looks up a YouTube trailer key for a film. Only called from the film
 * detail page — the grid doesn't need it, so this isn't part of
 * fetchTmdbEnrichment (which every card on the grid pays for).
 */
export async function fetchTrailerKey(tmdbId: number): Promise<string | null> {
  if (!TMDB_API_KEY) return null;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: THIRTY_DAYS } },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as TmdbVideosResponse;
    const videos = data.results ?? [];
    const trailers = videos.filter(
      (v) => v.site === "YouTube" && v.type === "Trailer",
    );
    const best =
      trailers.find((v) => v.official) ?? trailers[0] ?? videos[0] ?? null;

    return best?.key ?? null;
  } catch {
    return null;
  }
}

interface TmdbMovieDetails {
  belongs_to_collection: { id: number; name: string } | null;
}

export interface TmdbCollectionRef {
  id: number;
  name: string;
}

/**
 * Looks up whether a film belongs to a TMDB collection (a franchise
 * grouping — e.g. all 4 John Wicks). Needs the movie details endpoint,
 * which isn't part of fetchTmdbEnrichment's search+credits calls, so
 * this is its own call, made only when building the collections page.
 */
export async function fetchCollectionRef(
  tmdbId: number,
): Promise<TmdbCollectionRef | null> {
  if (!TMDB_API_KEY) return null;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: THIRTY_DAYS } },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as TmdbMovieDetails;
    const collection = data.belongs_to_collection;
    return collection ? { id: collection.id, name: collection.name } : null;
  } catch {
    return null;
  }
}

interface TmdbCollectionPart {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
}

interface TmdbCollectionResponse {
  id: number;
  name: string;
  parts: TmdbCollectionPart[];
}

export interface CollectionPartInfo {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
}

export interface CollectionInfo {
  id: number;
  name: string;
  parts: CollectionPartInfo[];
}

/** Every film in a TMDB collection, oldest first. */
export async function fetchCollectionParts(
  collectionId: number,
): Promise<CollectionInfo | null> {
  if (!TMDB_API_KEY) return null;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/collection/${collectionId}?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: THIRTY_DAYS } },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as TmdbCollectionResponse;
    const parts = (data.parts ?? [])
      .map((p) => ({
        tmdbId: p.id,
        title: p.title,
        year: p.release_date ? Number(p.release_date.slice(0, 4)) || null : null,
        posterUrl: p.poster_path ? `${TMDB_IMAGE_BASE}${p.poster_path}` : null,
      }))
      .sort((a, b) => (a.year ?? 0) - (b.year ?? 0));

    return { id: data.id, name: data.name, parts };
  } catch {
    return null;
  }
}

interface TmdbRecommendationResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
}

interface TmdbRecommendationsResponse {
  results: TmdbRecommendationResult[];
}

export interface RecommendedFilmInfo {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
}

const RECOMMENDATION_COUNT = 4;

async function fetchMovieList(
  tmdbId: number,
  endpoint: "recommendations" | "similar",
): Promise<TmdbRecommendationResult[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}/${endpoint}?api_key=${TMDB_API_KEY}`,
    { next: { revalidate: THIRTY_DAYS } },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as TmdbRecommendationsResponse;
  return data.results ?? [];
}

/**
 * A handful of films similar to this one, straight from TMDB's own
 * catalog — regardless of whether you've logged them. Prefers TMDB's
 * "recommendations" (usually the better-curated engine), falling back
 * to "similar" if that comes back empty. Only called from the film
 * detail page, one extra call per film, paid once at build time.
 */
export async function fetchRecommendations(
  tmdbId: number,
): Promise<RecommendedFilmInfo[]> {
  if (!TMDB_API_KEY) return [];

  try {
    let results = await fetchMovieList(tmdbId, "recommendations");
    if (results.length === 0) {
      results = await fetchMovieList(tmdbId, "similar");
    }

    return results.slice(0, RECOMMENDATION_COUNT).map((r) => ({
      tmdbId: r.id,
      title: r.title,
      year: r.release_date ? Number(r.release_date.slice(0, 4)) || null : null,
      posterUrl: r.poster_path ? `${TMDB_IMAGE_BASE}${r.poster_path}` : null,
    }));
  } catch {
    return [];
  }
}
