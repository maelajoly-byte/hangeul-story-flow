import { supabase } from "@/integrations/supabase/client";

export interface StoryPart {
  id: string;
  series_id: string;
  episode: number;
  part: number;
  title: string;
  title_ko: string;
  optional: boolean;
  published: boolean;
}

export interface StoryEpisode {
  id: string;
  series_id: string;
  episode: number;
  title: string;
  title_ko: string;
}

export interface StorySlide {
  id: string;
  part_id: string;
  position: number;
  media_url: string | null;
  hangeul: string;
  sfx_url: string | null;
  ambient_url: string | null;
  bubble_type: string;
  bubble_position: string;
  speaker_name: string;
}

export interface LexiconEntry {
  id: string;
  part_id: string;
  slide_position: number;
  term: string;
  explanation: string;
}

export interface LexiconRequest {
  id: string;
  user_id: string;
  part_id: string;
  slide_position: number;
  term: string;
  question: string;
  status: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

/* ---------- reads ---------- */

export async function listEpisodes(seriesId: string): Promise<StoryEpisode[]> {
  const { data, error } = await supabase
    .from("story_episodes")
    .select("*")
    .eq("series_id", seriesId)
    .order("episode");
  if (error) throw error;
  return (data ?? []) as StoryEpisode[];
}

export async function upsertEpisode(input: { series_id: string; episode: number; title: string; title_ko: string }) {
  const { error } = await supabase
    .from("story_episodes")
    .upsert(input as never, { onConflict: "series_id,episode" });
  if (error) throw error;
}

export async function listParts(seriesId: string): Promise<StoryPart[]> {
  const { data, error } = await supabase
    .from("story_parts")
    .select("*")
    .eq("series_id", seriesId)
    .order("episode")
    .order("part");
  if (error) throw error;
  return (data ?? []) as StoryPart[];
}

export async function getPart(seriesId: string, episode: number, part: number): Promise<StoryPart | null> {
  const { data, error } = await supabase
    .from("story_parts")
    .select("*")
    .eq("series_id", seriesId)
    .eq("episode", episode)
    .eq("part", part)
    .maybeSingle();
  if (error) throw error;
  return (data as StoryPart | null) ?? null;
}

export async function listSlides(partId: string): Promise<StorySlide[]> {
  const { data, error } = await supabase
    .from("story_slides")
    .select("*")
    .eq("part_id", partId)
    .order("position");
  if (error) throw error;
  return (data ?? []) as StorySlide[];
}

export async function listLexicon(partId: string): Promise<LexiconEntry[]> {
  const { data, error } = await supabase
    .from("lexicon_entries")
    .select("*")
    .eq("part_id", partId)
    .order("slide_position");
  if (error) throw error;
  return (data ?? []) as LexiconEntry[];
}

/* ---------- admin writes (RLS: is_admin()) ---------- */

export async function createPart(input: { series_id: string; episode: number; part: number; title: string; optional?: boolean }) {
  const { data, error } = await supabase.from("story_parts").insert(input).select().single();
  if (error) throw error;
  return data as StoryPart;
}

export async function updatePart(id: string, patch: Partial<Pick<StoryPart, "title" | "title_ko" | "optional" | "part" | "published">>) {
  const { error } = await supabase.from("story_parts").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deletePart(id: string) {
  const { error } = await supabase.from("story_parts").delete().eq("id", id);
  if (error) throw error;
}

/** Deletes a part along with its slides and lexicon entries. */
export async function deletePartDeep(id: string) {
  const { error: lexErr } = await supabase.from("lexicon_entries").delete().eq("part_id", id);
  if (lexErr) throw lexErr;
  const { error: slideErr } = await supabase.from("story_slides").delete().eq("part_id", id);
  if (slideErr) throw slideErr;
  await deletePart(id);
}

export async function addSlide(partId: string, position: number) {
  const { data, error } = await supabase
    .from("story_slides")
    .insert({ part_id: partId, position, hangeul: "" })
    .select()
    .single();
  if (error) throw error;
  return data as StorySlide;
}

/** Inserts a slide at `position`, shifting following slides one step down. */
export async function insertSlideAt(partId: string, position: number) {
  const slides = await listSlides(partId);
  const toShift = slides.filter((s) => s.position >= position).sort((a, b) => b.position - a.position);
  for (const s of toShift) {
    const { error } = await supabase.from("story_slides").update({ position: s.position + 1 }).eq("id", s.id);
    if (error) throw error;
  }
  return addSlide(partId, position);
}

/** Renumbers slides of a part to 1..n following the given id order. */
export async function reorderSlides(orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("story_slides").update({ position: 10000 + i }).eq("id", orderedIds[i]!);
    if (error) throw error;
  }
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("story_slides").update({ position: i + 1 }).eq("id", orderedIds[i]!);
    if (error) throw error;
  }
}

/** Renumbers parts of an episode to 1..n following the given id order. */
export async function reorderParts(orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("story_parts").update({ part: 10000 + i }).eq("id", orderedIds[i]!);
    if (error) throw error;
  }
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("story_parts").update({ part: i + 1 }).eq("id", orderedIds[i]!);
    if (error) throw error;
  }
}


export async function updateSlide(
  id: string,
  patch: Partial<Pick<StorySlide, "media_url" | "hangeul" | "sfx_url" | "ambient_url" | "position" | "bubble_type" | "bubble_position" | "speaker_name">>,
) {
  const { error } = await supabase.from("story_slides").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSlide(id: string) {
  const { error } = await supabase.from("story_slides").delete().eq("id", id);
  if (error) throw error;
}

export async function addLexiconEntry(input: { part_id: string; slide_position: number; term: string; explanation?: string }) {
  const { data, error } = await supabase.from("lexicon_entries").insert(input).select().single();
  if (error) throw error;
  return data as LexiconEntry;
}

export async function updateLexiconEntry(id: string, patch: Partial<Pick<LexiconEntry, "term" | "explanation" | "slide_position">>) {
  const { error } = await supabase.from("lexicon_entries").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteLexiconEntry(id: string) {
  const { error } = await supabase.from("lexicon_entries").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- notifications ---------- */

export async function listNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as AppNotification[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

/** Bulk-create slides with a generated media URL. Skips positions that already exist. */
export async function createSlidesBulk(
  partId: string,
  rows: { position: number; media_url: string }[],
): Promise<number> {
  if (rows.length === 0) return 0;
  const { data, error } = await supabase
    .from("story_slides")
    .insert(rows.map((r) => ({ part_id: partId, position: r.position, media_url: r.media_url, hangeul: "" })))
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}
