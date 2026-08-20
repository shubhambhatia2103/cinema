import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import type { DiaryEntry } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "diary.csv");

function slugify(name: string, year: number, watchedDate: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${year}-${watchedDate}`;
}

/**
 * Reads data/diary.csv, Letterboxd's own diary export format:
 * Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
 * See README for how to export this file from your account.
 */
export function loadDiary(): DiaryEntry[] {
  if (!fs.existsSync(DATA_PATH)) return [];

  const raw = fs.readFileSync(DATA_PATH, "utf8");
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
