import Image from "next/image";
import Link from "next/link";
import { getCollections } from "@/lib/collections";

export const metadata = {
  title: "Collections — Cinema",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 border-b border-ink/10 pb-8">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-muted underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          ← Log
        </Link>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          Collections
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Franchises from your log, grouped by TMDB&apos;s own collection
          data — dimmed posters are films you haven&apos;t logged yet.
        </p>
      </header>

      {collections.length === 0 ? (
        <p className="text-muted">
          No multi-film franchises detected in your log yet — this needs a
          TMDB key to look up collection membership.
        </p>
      ) : (
        <div className="space-y-12">
          {collections.map((c) => {
            const complete = c.watchedCount === c.totalCount;
            return (
              <section key={c.id}>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl text-ink/90">
                    {c.name}
                  </h2>
                  <span
                    className={`text-sm ${complete ? "text-accent" : "text-muted"}`}
                  >
                    {complete
                      ? `Complete · ${c.totalCount} of ${c.totalCount}`
                      : `${c.watchedCount} of ${c.totalCount} watched`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
                  {c.parts.map((p) => {
                    const card = (
                      <div className="group">
                        <div
                          className={`relative aspect-[2/3] overflow-hidden rounded-md bg-card ring-1 ring-ink/10 ${
                            p.slug ? "" : "opacity-40 grayscale"
                          }`}
                        >
                          {p.posterUrl ? (
                            <Image
                              src={p.posterUrl}
                              alt={`${p.title} poster`}
                              fill
                              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center">
                              <span className="font-serif text-sm leading-tight text-ink/90">
                                {p.title}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 truncate text-sm text-ink/80">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted">{p.year || ""}</p>
                      </div>
                    );

                    return p.slug ? (
                      <Link key={p.tmdbId} href={`/film/${p.slug}`}>
                        {card}
                      </Link>
                    ) : (
                      <a
                        key={p.tmdbId}
                        href={`https://www.themoviedb.org/movie/${p.tmdbId}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Not in your log yet — opens on TMDB"
                      >
                        {card}
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
