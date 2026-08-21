# Roadmap

Plan for the next phase of cinema.shubhambhatia.in — new tabs, TMDB-enriched detail
pages, and stats computed from the diary export. Numbers below are real, pulled from
the 112-film log at the time this was written; they'll drift as the log grows, which
is the point.

Each phase ships as its own PR into `main`, in roughly this order. Check a phase off
once it's merged.

## Site structure

```
Home (/)                      — live today: year-grouped grid, live title search
├── Stats (/stats)            — new tab: a wrapped-style page from diary.csv
├── Film detail (/film/[slug])— new route: one page per watch, TMDB-enriched
└── Collections (/collections)— new tab: franchises completed or in progress
```

## Feature breakdown

| Surface | Shows | Data source | Effort |
|---|---|---|---|
| Reviews on cards | Letterboxd review text, revealed on hover/tap | `reviews.csv` (local only) | Low |
| Stats page | Rating histogram, films/year timeline, rewatch rate, binge months | `diary.csv` only | Low |
| Filters | By year, by rating (4★+), rewatches only | `diary.csv` only | Low |
| Genre + director on cards | A byline under the title, filterable chips | TMDB details + credits | Medium |
| Film detail pages | Backdrop, synopsis, cast, trailer, TMDB rating vs. yours | TMDB details, credits, videos | Medium |
| Collections | Franchise groupings — e.g. all 4 John Wicks as one card | TMDB collections | Medium |

## Analytics — ready today (diary.csv only, no TMDB)

- **Rating distribution** — a histogram of star ratings (currently 45/112 rated exactly 4★)
- **Binge months** — logging is bursty, not steady; worth a timeline (34 films in May 2026, 22 in Sept 2025)
- **Rewatch rate** — share of entries marked as a rewatch (currently 10/112, ~9%)
- **Watch-day pattern** — which day of the week you actually watch on (currently Thursday leads, 29 films)
- **Decade breakdown** — the `Year` column already gives this, no lookup needed (42 from the 2010s, 27 from the 2000s)
- **Highs and lows** — 5★ and lowest-rated entries called out by name

## Analytics — with TMDB enrichment

One extra API call per film (cached), same `TMDB_API_KEY` already set on Vercel.

- **Genre breakdown** — most-watched genre, and how the mix shifts year to year
- **Director frequency** — who you return to most
- **Runtime totals** — total hours watched, framed as "X days of your life"
- **You vs. TMDB** — films where your rating diverges most from the community average
- **Language mix** — original-language breakdown
- **Collections completed** — franchises finished vs. started (John Wick and Dumb and Dumber are already both complete)

## Phases

- [x] **Phase 1 — Make the existing data visible.** Zero new infrastructure.
  - [x] Reviews surfaced on cards (`reviews.csv`)
  - [x] Filters: 4★+ (year and rewatch-only were dropped — year filtering has a different design planned for a later phase, and rewatch wasn't useful enough to keep)
- [x] **Phase 2 — Ship the stats page.** Pure `diary.csv` math, no new API load.
  - [x] Rating histogram, decade breakdown, watch-day pattern
  - [x] Binge-month timeline (as top-5 busiest months), rewatch rate, highs/lows
- [x] **Phase 3 — Enrich the grid.** Extend the existing poster fetch to also cache genre + director.
  - [x] Director byline under each card
  - [x] Genre chips, filterable
- [ ] **Phase 4 — Film detail pages.** Where backdrop, trailer, cast, and TMDB-vs-you comparisons live.
  - [ ] `/film/[slug]` route, linked from every card
  - [ ] Synopsis, cast, trailer embed
- [ ] **Phase 5 — Collections.** Needs Phase 4's detail pages to link into.
  - [ ] Franchise grouping via TMDB collections
  - [ ] "Completed" vs. "in progress" state
