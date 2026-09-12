"use server";

import https from "node:https";

type SearchResult = { id: string; title: string; subtitle?: string; imageUrl?: string; year?: string; meta?: Record<string, string> };
type RequestSpec = { host: string; path: string; headers?: Record<string, string> };
type TmdbItem = Record<string, any>;
type TmdbPayload = { results?: TmdbItem[]; credits?: { crew?: TmdbItem[] }; seasons?: TmdbItem[]; [key: string]: any };

function requestJson<T>(spec: RequestSpec): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = https.request({ host: spec.host, path: spec.path, method: "GET", headers: spec.headers }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        if ((response.statusCode ?? 500) < 200 || (response.statusCode ?? 500) >= 300) { reject(new Error("The search service is unavailable right now.")); return; }
        try { resolve(JSON.parse(body) as T); } catch { reject(new Error("The search service returned an unexpected response.")); }
      });
    });
    request.on("error", () => reject(new Error("The search service is unavailable right now.")));
    request.end();
  });
}

function tmdbRequest(kind: "movieSearch" | "movieDetails" | "seriesSearch" | "seriesDetails", value: string): Promise<TmdbPayload> {
  const token = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) throw new Error("TMDB search is not connected yet.");
  const auth = apiKey && !token ? `&api_key=${encodeURIComponent(apiKey)}` : "";
  const bearer = token ? { Authorization: `Bearer ${token}` } : undefined;
  if (kind === "movieSearch") return requestJson<TmdbPayload>({ host: "api.themoviedb.org", path: `/3/search/movie?language=en-US&include_adult=false&page=1&query=${encodeURIComponent(value)}${auth}`, headers: bearer });
  if (kind === "seriesSearch") return requestJson<TmdbPayload>({ host: "api.themoviedb.org", path: `/3/search/tv?language=en-US&include_adult=false&page=1&query=${encodeURIComponent(value)}${auth}`, headers: bearer });
  if (kind === "movieDetails") return requestJson<TmdbPayload>({ host: "api.themoviedb.org", path: `/3/movie/${encodeURIComponent(value)}?language=en-US&append_to_response=credits${auth}`, headers: bearer });
  return requestJson<TmdbPayload>({ host: "api.themoviedb.org", path: `/3/tv/${encodeURIComponent(value)}?language=en-US${auth}`, headers: bearer });
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) throw new Error("Book search is not connected yet.");
  const data = await requestJson<{ documents?: TmdbItem[] }>({ host: "dapi.kakao.com", path: `/v3/search/book?query=${encodeURIComponent(query)}&sort=accuracy&page=1&size=20`, headers: { Authorization: `KakaoAK ${key}` } });
  return (data.documents ?? []).map((item: TmdbItem, index: number) => ({ id: String(item.isbn || item.title || index), title: String(item.title ?? ""), subtitle: [Array.isArray(item.authors) ? item.authors.join(", ") : "", item.publisher].filter(Boolean).join(" · "), imageUrl: typeof item.thumbnail === "string" ? item.thumbnail : undefined, meta: { author: Array.isArray(item.authors) ? item.authors.join(", ") : "", publisher: String(item.publisher ?? ""), isbn: String(item.isbn ?? ""), publicationDate: String(item.datetime ?? "") } }));
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  const data = await tmdbRequest("movieSearch", query);
  return (data.results ?? []).slice(0, 20).map((item: TmdbItem) => ({ id: String(item.id), title: String(item.title ?? ""), year: typeof item.release_date === "string" ? item.release_date.slice(0, 4) : "", imageUrl: typeof item.poster_path === "string" ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : undefined }));
}

export async function getMovieDetails(id: string) {
  const data = await tmdbRequest("movieDetails", id);
  const directors = (data.credits?.crew ?? []).filter((person: TmdbItem) => person.job === "Director").map((person: TmdbItem) => String(person.name));
  return { title: String(data.title ?? ""), releaseYear: typeof data.release_date === "string" ? data.release_date.slice(0, 4) : "", directorNames: directors.join(", "), posterUrl: typeof data.poster_path === "string" ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "", tmdbId: String(data.id ?? id) };
}

export async function searchSeries(query: string): Promise<SearchResult[]> {
  const data = await tmdbRequest("seriesSearch", query);
  return (data.results ?? []).slice(0, 20).map((item: TmdbItem) => ({ id: String(item.id), title: String(item.name ?? ""), year: typeof item.first_air_date === "string" ? item.first_air_date.slice(0, 4) : "", imageUrl: typeof item.poster_path === "string" ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : undefined }));
}

export async function getSeriesDetails(id: string) {
  const data = await tmdbRequest("seriesDetails", id);
  const seasons = (data.seasons ?? []).filter((season: TmdbItem) => Number(season.season_number) > 0 && Number(season.episode_count) > 0).sort((a: TmdbItem, b: TmdbItem) => Number(a.season_number) - Number(b.season_number)).map((season: TmdbItem) => ({ seasonNumber: Number(season.season_number), watched: false }));
  return { title: String(data.name ?? ""), posterUrl: typeof data.poster_path === "string" ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "", tmdbId: String(data.id ?? id), seasons };
}
