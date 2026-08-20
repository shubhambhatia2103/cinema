import { getMovies } from "@/lib/movies";
import MovieCard from "@/components/MovieCard";

function groupByYear(movies: Awaited<ReturnType<typeof getMovies>>) {
  const groups = new Map<string, typeof movies>();
  for (const movie of movies) {
    const year = movie.watchedDate.slice(0, 4) || "Undated";
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(movie);
  }
  return [...groups.entries()];
}

export default async function Home() {
  const movies = await getMovies();
  const years = groupByYear(movies);
  const rated = movies.filter((m) => m.rating != null);
  const avgRating = rated.length
    ? (
        rated.reduce((sum, m) => sum + (m.rating ?? 0), 0) / rated.length
      ).toFixed(1)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-white/10 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          shubhambhatia.in
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          Cinema
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          A running log of everything I&apos;ve watched, exported from my{" "}
          <a
            href="https://letterboxd.com"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/20 underline-offset-2 hover:text-ink"
          >
            Letterboxd
          </a>{" "}
          diary.
        </p>
        <div className="mt-5 flex gap-6 text-sm text-ink/80">
          <span>
            <strong className="font-serif text-lg text-ink">
              {movies.length}
            </strong>{" "}
            films logged
          </span>
          {avgRating && (
            <span>
              <strong className="font-serif text-lg text-ink">
                {avgRating}
              </strong>{" "}
              avg rating
            </span>
          )}
        </div>
      </header>

      {movies.length === 0 ? (
        <p className="text-muted">
          No entries yet — drop your Letterboxd diary export at{" "}
          <code className="text-ink/80">data/diary.csv</code>.
        </p>
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
    </main>
  );
}
