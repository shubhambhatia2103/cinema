import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import type { DiaryEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const MAX_SEARCH_DEPTH = 3;

function slugify(name: string, year: number, watchedDate: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${year}-${watchedDate}`;
}

/**
 * Letterboxd's export zip usually unpacks as a folder full of CSVs
 * (diary, ratings, watchlist, comments, likes/...). We only want
 * diary.csv, wherever it landed inside data/ — so a whole unzipped
 * export folder can be dropped in without the user hunting for the
 * one file we actually read.
 */
function findDiaryCsv(dir: string, depth: number): string | null {
  if (depth > MAX_SEARCH_DEPTH || !fs.existsSync(dir)) return null;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name === "diary.csv") {
      return path.join(dir, entry.name);
    }
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findDiaryCsv(path.join(dir, entry.name), depth + 1);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Reads a Letterboxd diary export (Date,Name,Year,Letterboxd URI,Rating,
 * Rewatch,Tags,Watched Date). Looks for diary.csv anywhere under data/,
 * so you can drop the whole unzipped export folder in as-is — see README.
 */
export function loadDiary(): DiaryEntry[] {
  const dataPath = findDiaryCsv(DATA_DIR, 0);
  if (!dataPath) return [];

  const raw = fs.readFileSync(/* turbopackIgnore: true */ dataPath, "utf8");
  const parsed = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
  });

  const entries = parsed.data
    .map((row): DiaryEntry => {
      const name = (row["Name"] ?? "").trim();
      const year = Number(row["Year"]) || 0;
      const watchedDate = (row["Watched Date"] || row["Date"] || "").trim();
      const ratingRaw = (row["Rating"] ?? "").trim();
      return {
        name,
        year,
        watchedDate,
        rating: ratingRaw ? Number(ratingRaw) : null,
        rewatch: (row["Rewatch"] ?? "").trim().toLowerCase() === "yes",
        tags: (row["Tags"] ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        letterboxdUri: (row["Letterboxd URI"] ?? "").trim(),
        slug: slugify(name, year, watchedDate),
      };
    })
    .filter((entry) => entry.name && entry.watchedDate);

  entries.sort((a, b) => b.watchedDate.localeCompare(a.watchedDate));
  return entries;
}
