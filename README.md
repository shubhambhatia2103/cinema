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

1. On Letterboxd: **Settings → Data → Export Your Data**. This downloads a zip.
2. From that zip, take `diary.csv` and replace `data/diary.csv` in this repo with it.
3. Commit and push (or redeploy) — the grid rebuilds from the new file.

The expected columns (Letterboxd's own export format) are:

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
