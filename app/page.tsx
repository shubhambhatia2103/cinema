import Link from "next/link";
import { getMovies } from "@/lib/movies";
import MovieGrid from "@/components/MovieGrid";

export default async function Home() {
  const movies = await getMovies();
  const rated = movies.filter((m) => m.rating != null);
  const avgRating = rated.length
    ? (
        rated.reduce((sum, m) => sum + (m.rating ?? 0), 0) / rated.length
      ).toFixed(1)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-ink/10 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          shubhambhatia.in
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          Cinema
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          A running log of everything I&apos;ve watched, exported from my{" "}
          <a
            href="https://letterboxd.com/cinemaormai/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-ink/20 underline-offset-2 hover:text-ink"
          >
            Letterboxd
          </a>{" "}
          diary.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6 text-sm text-ink/80">
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
          <Link
            href="/stats"
            className="rounded-md border border-ink/15 bg-card px-3 py-1.5 text-sm text-ink/80 hover:border-ink/30 hover:text-ink"
          >
            View stats →
          </Link>
        </div>
      </header>

      {movies.length === 0 ? (
        <p className="text-muted">
          No entries yet — drop your Letterboxd diary export at{" "}
          <code className="text-ink/80">data/diary.csv</code>.
        </p>
      ) : (
        <MovieGrid movies={movies} />
      )}
    </main>
  );
}
