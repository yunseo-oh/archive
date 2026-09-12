"use client";

import { useEffect, useMemo, useState } from "react";
import { getMovieDetails, getSeriesDetails, searchBooks, searchMovies, searchSeries } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";

type Category = "book" | "movie" | "series" | "gallery";
type Season = { seasonNumber: number; watched: boolean };
type CommonRecord = { id: string; archiveYear: number; category: Category; createdAt: string; updatedAt: string };
type BookRecord = CommonRecord & { category: "book"; title: string; author: string; publisher: string; coverUrl: string; isbn?: string; externalSource?: string; externalId?: string };
type MovieRecord = CommonRecord & { category: "movie"; titleEnglish: string; releaseYear: string; directorNames: string; posterUrl: string; tmdbId?: string };
type SeriesRecord = CommonRecord & { category: "series"; titleEnglish: string; posterUrl: string; tmdbId?: string; seasons: Season[] };
type GalleryRecord = CommonRecord & { category: "gallery"; city: string; museum: string; exhibition: string };
type ArchiveRecord = BookRecord | MovieRecord | SeriesRecord | GalleryRecord;
type Result = { id: string; title: string; subtitle?: string; imageUrl?: string; year?: string; meta?: Record<string, string> };
type FormState = { title: string; author: string; publisher: string; coverUrl: string; titleEnglish: string; releaseYear: string; directorNames: string; posterUrl: string; city: string; museum: string; exhibition: string; seasons: Season[]; tmdbId: string; isbn: string; externalSource: string; externalId: string };

const STORAGE_KEY = "archive-records-v1";
const categories: Array<{ id: Category; label: string }> = [{ id: "book", label: "Book" }, { id: "movie", label: "Movie" }, { id: "series", label: "Series" }, { id: "gallery", label: "Gallery" }];
const emptyForm: FormState = { title: "", author: "", publisher: "", coverUrl: "", titleEnglish: "", releaseYear: "", directorNames: "", posterUrl: "", city: "", museum: "", exhibition: "", seasons: [], tmdbId: "", isbn: "", externalSource: "", externalId: "" };

function freshId() { return crypto.randomUUID(); }
function placeholder(label: string) { return <div className="archive-placeholder" aria-hidden="true">{label.slice(0, 1).toUpperCase()}</div>; }
function imageOrPlaceholder(url: string | undefined, label: string) { return url ? <img src={url} alt="" className="archive-thumb" loading="lazy" /> : placeholder(label); }

export default function Home() {
  const currentYear = new Date().getFullYear();
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [years, setYears] = useState<number[]>([currentYear]);
  const [category, setCategory] = useState<Category>("book");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"search" | "form">("search");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ArchiveRecord[];
      setRecords(saved);
      setYears(Array.from(new Set([currentYear, ...saved.map((record) => record.archiveYear)])).sort((a, b) => b - a));
    } catch { setRecords([]); }
  }, [currentYear]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }, [records]);
  useEffect(() => {
    if (!dialogOpen || dialogMode !== "search" || category === "gallery" || query.trim().length < 2) { setResults([]); return; }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearching(true); setError("");
      try { const next = category === "book" ? await searchBooks(query.trim()) : category === "movie" ? await searchMovies(query.trim()) : await searchSeries(query.trim()); if (!cancelled) setResults(next); }
      catch (cause) { if (!cancelled) setError(cause instanceof Error ? cause.message : "Search failed. Try again."); }
      finally { if (!cancelled) setSearching(false); }
    }, 420);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [category, dialogMode, dialogOpen, query]);

  const visibleRecords = useMemo(() => records.filter((record) => record.archiveYear === selectedYear && record.category === category), [records, selectedYear, category]);
  const counts = useMemo(() => Object.fromEntries(categories.map((item) => [item.id, records.filter((record) => record.archiveYear === selectedYear && record.category === item.id).length])) as Record<Category, number>, [records, selectedYear]);
  function persist(nextRecords: ArchiveRecord[]) { setRecords(nextRecords); setYears((current) => Array.from(new Set([...current, ...nextRecords.map((record) => record.archiveYear)])).sort((a, b) => b - a)); }
  function openAdd() { setEditingId(null); setForm(emptyForm); setQuery(""); setResults([]); setError(""); setDialogMode(category === "gallery" ? "form" : "search"); setDialogOpen(true); }
  function openEdit(record: ArchiveRecord) {
    setEditingId(record.id); setError(""); setDialogMode("form"); setDialogOpen(true);
    if (record.category === "book") setForm({ ...emptyForm, title: record.title, author: record.author, publisher: record.publisher, coverUrl: record.coverUrl, isbn: record.isbn ?? "", externalSource: record.externalSource ?? "", externalId: record.externalId ?? "" });
    if (record.category === "movie") setForm({ ...emptyForm, titleEnglish: record.titleEnglish, releaseYear: record.releaseYear, directorNames: record.directorNames, posterUrl: record.posterUrl, tmdbId: record.tmdbId ?? "" });
    if (record.category === "series") setForm({ ...emptyForm, titleEnglish: record.titleEnglish, posterUrl: record.posterUrl, tmdbId: record.tmdbId ?? "", seasons: record.seasons });
    if (record.category === "gallery") setForm({ ...emptyForm, city: record.city, museum: record.museum, exhibition: record.exhibition });
  }
  function selectFormValue(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  async function chooseResult(result: Result) {
    setLoadingSelection(true); setError("");
    try {
      if (category === "book") setForm({ ...emptyForm, title: result.title, author: result.meta?.author ?? "", publisher: result.meta?.publisher ?? "", coverUrl: result.imageUrl ?? "", isbn: result.meta?.isbn ?? "", externalSource: "kakao", externalId: result.id });
      if (category === "movie") setForm({ ...emptyForm, ...(await getMovieDetails(result.id)) });
      if (category === "series") setForm({ ...emptyForm, ...(await getSeriesDetails(result.id)) });
      setDialogMode("form");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Couldn’t load that selection."); }
    finally { setLoadingSelection(false); }
  }
  function saveRecord() {
    const now = new Date().toISOString();
    if (category === "book" && !form.title.trim()) return setError("Add a book title first.");
    if (category === "movie" && !form.titleEnglish.trim()) return setError("Add a movie title first.");
    if (category === "series" && !form.titleEnglish.trim()) return setError("Add a series title first.");
    if (category === "gallery" && (!form.city.trim() || !form.museum.trim())) return setError("Add a city and museum or gallery first.");
    let next: ArchiveRecord;
    const base = { id: editingId ?? freshId(), archiveYear: selectedYear, category, createdAt: now, updatedAt: now } as const;
    if (category === "book") next = { ...base, category: "book", title: form.title.trim(), author: form.author.trim(), publisher: form.publisher.trim(), coverUrl: form.coverUrl.trim(), isbn: form.isbn, externalSource: form.externalSource, externalId: form.externalId };
    else if (category === "movie") next = { ...base, category: "movie", titleEnglish: form.titleEnglish.trim(), releaseYear: form.releaseYear.trim(), directorNames: form.directorNames.trim(), posterUrl: form.posterUrl.trim(), tmdbId: form.tmdbId };
    else if (category === "series") next = { ...base, category: "series", titleEnglish: form.titleEnglish.trim(), posterUrl: form.posterUrl.trim(), tmdbId: form.tmdbId, seasons: form.seasons.map((season) => ({ ...season })) };
    else next = { ...base, category: "gallery", city: form.city.trim(), museum: form.museum.trim(), exhibition: form.exhibition.trim() };
    persist(editingId ? records.map((record) => record.id === editingId ? { ...next, createdAt: record.createdAt } : record) : [next, ...records]); setDialogOpen(false);
  }
  function deleteRecord() { if (!editingId || !window.confirm("Delete this record?")) return; persist(records.filter((record) => record.id !== editingId)); setDialogOpen(false); }
  function toggleSeason(recordId: string, seasonNumber: number) { persist(records.map((record) => record.id === recordId && record.category === "series" ? { ...record, updatedAt: new Date().toISOString(), seasons: record.seasons.map((season) => season.seasonNumber === seasonNumber ? { ...season, watched: !season.watched } : season) } : record)); }
  function manualSeriesSeasons(value: string) { const count = Math.max(0, Math.min(99, Number(value) || 0)); setForm((current) => ({ ...current, seasons: Array.from({ length: count }, (_, index) => ({ seasonNumber: index + 1, watched: current.seasons[index]?.watched ?? false })) })); }
  const field = (label: string, key: keyof FormState, required = false, type = "text") => <label className="archive-field"><span>{label}{required ? " *" : ""}</span><Input value={String(form[key] ?? "")} type={type} onChange={(event) => selectFormValue(key, event.target.value)} /></label>;

  return <main className="archive-app">
    <header className="archive-header"><h1>ARCHIVE</h1><div className="archive-year-control"><select aria-label="Archive year" value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select><button type="button" aria-label="Add archive year" onClick={() => { const value = window.prompt("Add an archive year", String(selectedYear)); const year = Number(value); if (Number.isInteger(year) && year >= 1900 && year <= 2200) { setYears((current) => Array.from(new Set([...current, year])).sort((a, b) => b - a)); setSelectedYear(year); } }}>+</button></div></header>
    <nav className="archive-tabs" aria-label="Archive categories">{categories.map((item) => <button key={item.id} className={category === item.id ? "is-active" : ""} onClick={() => setCategory(item.id)}><span>{item.label}</span><strong>{counts[item.id]}</strong></button>)}</nav>
    <section className="archive-list" aria-live="polite">{visibleRecords.length === 0 ? <div className="archive-empty"><p>No {category === "gallery" ? "gallery visits" : `${category}s`} yet.</p><span>Tap + to add one.</span></div> : visibleRecords.map((record) => <article className="archive-row" key={record.id} onClick={() => openEdit(record)}>
      {record.category === "book" && <>{imageOrPlaceholder(record.coverUrl, record.title)}<div className="archive-row-copy"><h2>{record.title}</h2><p>{[record.author, record.publisher].filter(Boolean).join(" · ") || "No author or publisher"}</p></div></>}
      {record.category === "movie" && <>{imageOrPlaceholder(record.posterUrl, record.titleEnglish)}<div className="archive-row-copy"><h2>{record.titleEnglish}</h2><p>{[record.releaseYear, record.directorNames].filter(Boolean).join(" · ") || "No release details"}</p></div></>}
      {record.category === "series" && <><div className="archive-row-copy archive-series-copy"><h2>{record.titleEnglish}</h2><div className="season-strip" onClick={(event) => event.stopPropagation()}>{record.seasons.length ? record.seasons.map((season) => <button key={season.seasonNumber} className={season.watched ? "watched" : ""} aria-label={`Season ${season.seasonNumber} ${season.watched ? "watched" : "unwatched"}`} onClick={() => toggleSeason(record.id, season.seasonNumber)}>{season.watched ? "■" : "□"}</button>) : <span>No seasons</span>}</div></div>{imageOrPlaceholder(record.posterUrl, record.titleEnglish)}</>}
      {record.category === "gallery" && <div className="archive-row-copy"><h2>{record.museum}</h2><p>{record.city}</p>{record.exhibition && <p>{record.exhibition}</p>}</div>}
    </article>)}</section>
    <Button className="archive-add" size="icon" aria-label={`Add ${category}`} onClick={openAdd}><Plus size={25} strokeWidth={2} /></Button>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="archive-dialog"><DialogHeader><DialogTitle>{editingId ? `Edit ${category}` : dialogMode === "search" ? `Add ${category}` : `New ${category}`}</DialogTitle><DialogDescription>{editingId ? "Update this record or delete it." : dialogMode === "search" ? "Search first, or enter it yourself." : "Keep the details simple. You can edit them later."}</DialogDescription></DialogHeader>
      {dialogMode === "search" && <div className="archive-search-mode"><div className="archive-search-box"><Search size={17} /><Input autoFocus placeholder={`Search ${category === "book" ? "books" : category === "movie" ? "movies" : "series"}`} value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="archive-results">{searching && <p className="archive-state">Searching…</p>}{!searching && query.trim().length >= 2 && results.length === 0 && !error && <p className="archive-state">No results found.</p>}{results.map((result) => <button className="archive-result" key={result.id} onClick={() => chooseResult(result)} disabled={loadingSelection}>{imageOrPlaceholder(result.imageUrl, result.title)}<span><strong>{result.title}</strong><small>{[result.year, result.subtitle].filter(Boolean).join(" · ")}</small></span></button>)}{error && <p className="archive-error">{error}</p>}</div><div className="archive-dialog-actions"><Button variant="outline" onClick={() => { setDialogMode("form"); setForm(emptyForm); setError(""); }}>Enter Manually</Button><Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button></div></div>}
      {dialogMode === "form" && <div className="archive-form">{category === "book" && <>{field("Title", "title", true)}{field("Author", "author")}{field("Publisher", "publisher")}{field("Cover URL", "coverUrl")}</>}{category === "movie" && <>{field("Title", "titleEnglish", true)}{field("Release year", "releaseYear")}{field("Director", "directorNames")}{field("Poster URL", "posterUrl")}</>}{category === "series" && <>{field("Title", "titleEnglish", true)}{field("Poster URL", "posterUrl")}{!editingId && form.seasons.length === 0 && field("Number of seasons", "releaseYear", false, "number")}{!editingId && form.seasons.length === 0 && <Button type="button" variant="outline" onClick={() => manualSeriesSeasons(form.releaseYear)}>Create seasons</Button>}{form.seasons.length > 0 && <div className="season-editor"><span>Seasons</span><div>{form.seasons.map((season) => <button type="button" key={season.seasonNumber} className={season.watched ? "watched" : ""} onClick={() => setForm((current) => ({ ...current, seasons: current.seasons.map((item) => item.seasonNumber === season.seasonNumber ? { ...item, watched: !item.watched } : item) }))}>{season.watched ? "■" : "□"} {season.seasonNumber}</button>)}</div></div>}</>}{category === "gallery" && <>{field("City", "city", true)}{field("Museum or gallery", "museum", true)}{field("Exhibition", "exhibition")}</>} {error && <p className="archive-error">{error}</p>}<div className="archive-dialog-actions"><Button onClick={saveRecord}>Save</Button><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>{editingId && <Button className="archive-delete" variant="ghost" onClick={deleteRecord}><Trash2 size={16} /> Delete</Button>}</div></div>}
    </DialogContent></Dialog>
  </main>;
}
