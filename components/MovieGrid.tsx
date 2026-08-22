"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MovieCard from "./MovieCard";
import type { Movie } from "@/lib/types";

function groupByYear(movies: Movie[]) {
  const groups = new Map<string, Movie[]>();
  for (const movie of movies) {
    const year = movie.watchedDate.slice(0, 4) || "Undated";
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(movie);
  }
  return [...groups.entries()];
}

function distinctGenres(movies: Movie[]): string[] {
  const genres = new Set<string>();
  for (const m of movies) {
    for (const g of m.genres) genres.add(g);
  }
  return [...genres].sort();
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-3 py-2 text-sm transition ${
        active
          ? "border-accent bg-accent text-paper"
          : "border-ink/15 bg-card text-ink/80 hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

export default function MovieGrid({ movies }: { movies: Movie[] }) {
  const [query, setQuery] = useState("");
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [genre, setGenre] = useState<string | null>(null);

  const trimmed = query.trim().toLowerCase();
  const isFiltered = Boolean(trimmed || topRatedOnly || genre);
  const allGenres = useMemo(() => distinctGenres(movies), [movies]);

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (trimmed && !m.name.toLowerCase().includes(trimmed)) return false;
      if (topRatedOnly && (m.rating == null || m.rating < 4)) return false;
      if (genre && !m.genres.includes(genre)) return false;
      return true;
    });
  }, [movies, trimmed, topRatedOnly, genre]);

  const groupedAll = useMemo(() => groupByYear(movies), [movies]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a film…"
            aria-label="Search films"
            className="flex-1 min-w-0 max-w-xs rounded-md border border-ink/15 bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
          />
          <Toggle active={topRatedOnly} onClick={() => setTopRatedOnly((v) => !v)}>
            4★+
          </Toggle>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/collections"
            className="text-sm text-ink/80 underline decoration-ink/20 underline-offset-2 hover:text-ink"
          >
            Collections
          </Link>
          <Link
            href="/stats"
            className="text-sm text-ink/80 underline decoration-ink/20 underline-offset-2 hover:text-ink"
          >
            Stats →
          </Link>
        </div>
      </div>

      {allGenres.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {allGenres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre((cur) => (cur === g ? null : g))}
              aria-pressed={genre === g}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                genre === g
                  ? "border-accent bg-accent text-paper"
                  : "border-ink/15 bg-card text-ink/70 hover:border-ink/30"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {isFiltered ? (
        filtered.length === 0 ? (
          <p className="text-muted">No films match these filters.</p>
        ) : (
          <section>
            <h2 className="mb-4 font-serif text-2xl text-ink/90">
              {filtered.length} {filtered.length === 1 ? "match" : "matches"}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
              {filtered.map((movie) => (
                <MovieCard key={movie.slug} movie={movie} />
              ))}
            </div>
          </section>
        )
      ) : (
        <div className="space-y-12">
          {groupedAll.map(([y, entries]) => (
            <section key={y}>
              <h2 className="mb-4 font-serif text-2xl text-ink/90">{y}</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
                {entries.map((movie) => (
                  <MovieCard key={movie.slug} movie={movie} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
