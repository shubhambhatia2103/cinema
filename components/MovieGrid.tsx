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

export default function MovieGrid({ movies }: { movies: Movie[] }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const filtered = useMemo(() => {
    if (!trimmed) return movies;
    return movies.filter((m) => m.name.toLowerCase().includes(trimmed));
  }, [movies, trimmed]);

  const years = useMemo(() => groupByYear(movies), [movies]);

  return (
    <div>
      <div className="mb-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a film…"
          aria-label="Search films"
          className="w-full max-w-xs rounded-md border border-ink/15 bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
        />
      </div>

      {isSearching ? (
        filtered.length === 0 ? (
          <p className="text-muted">No films match &ldquo;{query.trim()}&rdquo;.</p>
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
          {years.map(([year, entries]) => (
            <section key={year}>
              <h2 className="mb-4 font-serif text-2xl text-ink/90">{year}</h2>
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
