import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getMovieDetail } from "@/lib/movies";
import { formatDate } from "@/lib/format";
import Stars from "@/components/Stars";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovieDetail(slug);
  return { title: movie ? `${movie.name} — Cinema` : "Cinema" };
}

export default async function FilmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovieDetail(slug);
  if (!movie) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="text-xs uppercase tracking-[0.2em] text-muted underline decoration-ink/20 underline-offset-2 hover:text-ink"
      >
        ← Log
      </Link>

      {movie.backdropUrl && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-md bg-card ring-1 ring-ink/10">
          <Image
            src={movie.backdropUrl}
            alt={`${movie.name} backdrop`}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-6 flex gap-6">
        {movie.posterUrl && (
          <div className="relative hidden aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-md bg-card ring-1 ring-ink/10 sm:block">
            <Image
              src={movie.posterUrl}
              alt={`${movie.name} poster`}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">
            {movie.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {movie.year}
            {movie.director && ` · Directed by ${movie.director}`}
          </p>

          {movie.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-ink/15 bg-card px-3 py-1 text-xs text-ink/70"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <span className="text-xs uppercase tracking-wide text-muted">
                You watched
              </span>
              <p className="text-sm text-ink/80">
                {formatDate(movie.watchedDate)}
                {movie.rewatch && " (rewatch)"}
              </p>
            </div>
            {movie.rating != null && (
              <div>
                <span className="text-xs uppercase tracking-wide text-muted">
                  Your rating
                </span>
                <p>
                  <Stars rating={movie.rating} className="text-accent text-sm" />
                </p>
              </div>
            )}
            {movie.voteAverage != null && (
              <div>
                <span className="text-xs uppercase tracking-wide text-muted">
                  TMDB rating
                </span>
                <p className="text-sm text-ink/80">
                  {movie.voteAverage.toFixed(1)}/10
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {movie.overview && (
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink/80">
          {movie.overview}
        </p>
      )}

      {movie.review && (
        <blockquote className="mt-6 border-l-2 border-accent/40 pl-4 text-sm italic text-ink/70">
          &ldquo;{movie.review}&rdquo;
        </blockquote>
      )}

      {movie.cast.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-muted">
            Cast
          </h2>
          <p className="text-sm text-ink/80">{movie.cast.join(", ")}</p>
        </div>
      )}

      {movie.trailerKey && (
        <div className="mt-8">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-muted">
            Trailer
          </h2>
          <div className="aspect-video overflow-hidden rounded-md bg-card ring-1 ring-ink/10">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerKey}`}
              title={`${movie.name} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </main>
  );
}
