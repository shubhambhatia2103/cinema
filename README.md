# cinema

A personal film log for [cinema.shubhambhatia.in](https://cinema.shubhambhatia.in), built from a
[Letterboxd](https://letterboxd.com) diary export. Part of a small series of projects on
[shubhambhatia.in](https://shubhambhatia.in), alongside
[tracker.shubhambhatia.in](https://tracker.shubhambhatia.in) (open-source habit tracker).

## How it works

There's no database and no live scraping — the site reads a CSV file at build time and
renders a grid of everything logged, grouped by year. Posters are optionally fetched from
TMDB and cached by Next.js's data cache.

## Updating your log

This is meant to be repeated every time you want the site to catch up to your real
Letterboxd diary — there's no live sync, so re-exporting is the update mechanism.

1. On Letterboxd: **Settings → Data → Export Your Data**. This downloads a zip.
2. Unzip it and drop the whole folder into `data/` — no need to dig out individual files.
   `lib/letterboxd.ts` searches `data/` for a file named `diary.csv` and uses whatever it finds.
3. Commit to a branch and open a PR into `main` (see workflow note below). Once merged,
   Vercel rebuilds from the new file automatically.

Letterboxd's export is always your *whole* diary, not just what changed since last time, so
the new `diary.csv` fully replaces the old one — new entries, edited ratings, and rewatches
all just show up correctly with no merge step.

**Workflow:** changes land on `main` via pull request, not direct pushes — including data
updates. Branch off `main`, commit the new `diary.csv`, open a PR, merge when it looks right.

Only `diary.csv` is ever read, and it's the only file from an export that `.gitignore` lets
into the repo — the rest (`watchlist.csv`, `comments.csv`, `likes/`, `reviews.csv`, ...) stays
on your machine, untracked, since that's more "private activity" than "movies I've watched."
If you'd rather commit the whole export as-is, adjust the `data/**` rules in `.gitignore`.

The expected columns (Letterboxd's own diary export format) are:

```
Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
```

`data/diary.csv` currently has a handful of sample entries so the site runs out of the box —
swap it for your real export whenever you're ready.

## Posters (optional)

Copy `.env.example` to `.env.local` and add a free [TMDB](https://www.themoviedb.org/settings/api)
API key as `TMDB_API_KEY`. Without it, cards fall back to a clean text-only design (title + year),
so this is entirely optional.

## Development

```bash
npm install
npm run dev
```

## Deploying

Any Next.js host works (Vercel is the obvious pick to match the other subdomains). Point
`cinema.shubhambhatia.in` at the deployment and set `TMDB_API_KEY` there too if you're using it.
