"use client";

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

function distinctYears(movies: Movie[]) {
  const years = new Set(movies.map((m) => m.watchedDate.slice(0, 4)).filter(Boolean));
  return [...years].sort().reverse();
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
  const [year, setYear] = useState("");
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [rewatchOnly, setRewatchOnly] = useState(false);

  const trimmed = query.trim().toLowerCase();
  const isFiltered = Boolean(trimmed || year || topRatedOnly || rewatchOnly);
  const years = useMemo(() => distinctYears(movies), [movies]);

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (trimmed && !m.name.toLowerCase().includes(trimmed)) return false;
      if (year && m.watchedDate.slice(0, 4) !== year) return false;
      if (topRatedOnly && (m.rating == null || m.rating < 4)) return false;
      if (rewatchOnly && !m.rewatch) return false;
      return true;
    });
  }, [movies, trimmed, year, topRatedOnly, rewatchOnly]);

  const groupedAll = useMemo(() => groupByYear(movies), [movies]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a film…"
          aria-label="Search films"
          className="w-full max-w-xs rounded-md border border-ink/15 bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
        />
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Filter by year"
          className="rounded-md border border-ink/15 bg-card px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <Toggle active={topRatedOnly} onClick={() => setTopRatedOnly((v) => !v)}>
          4★+
        </Toggle>
        <Toggle active={rewatchOnly} onClick={() => setRewatchOnly((v) => !v)}>
          Rewatches
        </Toggle>
      </div>

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
