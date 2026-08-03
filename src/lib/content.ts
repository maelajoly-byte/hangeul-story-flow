import { supabase } from "@/integrations/supabase/client";

export interface StoryPart {
  id: string;
  series_id: string;
  episode: number;
  part: number;
  title: string;
  optional: boolean;
}

export interface StorySlide {
  id: string;
  part_id: string;
  position: number;
  media_url: string | null;
  hangeul: string;
  sfx_url: string | null;
  ambient_url: string | null;
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

export async function updatePart(id: string, patch: Partial<Pick<StoryPart, "title" | "optional" | "part">>) {
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

export async function updateSlide(id: string, patch: Partial<Pick<StorySlide, "media_url" | "hangeul" | "sfx_url" | "ambient_url" | "position">>) {
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
