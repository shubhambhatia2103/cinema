import Image from "next/image";
import type { Movie } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-accent text-xs tracking-tight">
      {"★".repeat(full)}
      {half && "½"}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="group relative">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-card ring-1 ring-ink/10">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.name} poster`}
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="font-serif text-lg leading-tight text-ink/90">
              {movie.name}
            </span>
            <span className="text-xs text-muted">{movie.year || ""}</span>
          </div>
        )}

        {movie.rewatch && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-paper/90">
            Rewatch
          </span>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        {movie.posterUrl && (
          <p className="truncate text-sm text-ink/80">{movie.name}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted">
            {formatDate(movie.watchedDate)}
          </span>
          {movie.rating != null && <Stars rating={movie.rating} />}
        </div>
      </div>
    </article>
  );
}
