export interface DiaryEntry {
  name: string;
  year: number;
  watchedDate: string;
  rating: number | null;
  rewatch: boolean;
  tags: string[];
  letterboxdUri: string;
  slug: string;
}

export interface Movie extends DiaryEntry {
  posterUrl: string | null;
  review: string | null;
  genres: string[];
  director: string | null;
}
