import { supabase } from "@/integrations/supabase/client";
import type { Series, SeriesStatus } from "@/lib/data";

export interface SeriesRow {
  id: string;
  order_index: number;
  title: string;
  title_ko: string;
  synopsis: string;
  stars: number;
  episodes: number;
  status: string;
  moods: string[];
  cover_from: string;
  cover_to: string;
  cover_symbol: string;
  cover_image_url: string | null;
  free: boolean;
  warnings: string[];
  tips: string[];
}

export function rowToSeries(r: SeriesRow): Series {
  return {
    id: r.id,
    order: r.order_index,
    title: r.title,
    titleKo: r.title_ko,
    synopsis: r.synopsis,
    stars: Number(r.stars),
    episodes: r.episodes,
    status: r.status as SeriesStatus,
    moods: r.moods ?? [],
    cover: { from: r.cover_from, to: r.cover_to, symbol: r.cover_symbol },
    coverImageUrl: r.cover_image_url,
    free: r.free,
    warnings: r.warnings ?? [],
    tips: r.tips ?? [],
  };
}

export async function listSeriesRows(): Promise<SeriesRow[]> {
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("order_index");
  if (error) throw error;
  return (data ?? []) as unknown as SeriesRow[];
}

export async function updateSeriesRow(id: string, patch: Partial<SeriesRow>) {
  const { error } = await supabase.from("series").update(patch as never).eq("id", id);
  if (error) throw error;
}
