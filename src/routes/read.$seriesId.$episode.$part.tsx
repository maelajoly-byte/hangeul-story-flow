import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { SlideReader } from "@/components/slide-reader";
import { Comments } from "@/components/comments";
import { getEpisodePart, getSeries, EPISODES, type EpisodePart } from "@/lib/data";
import { useUser } from "@/lib/user-store";

export const Route = createFileRoute("/read/$seriesId/$episode/$part")({
  loader: ({ params }) => {
    const series = getSeries(params.seriesId);
    const ep = getEpisodePart(params.seriesId, Number(params.episode), Number(params.part));
    if (!series || !ep) throw notFound();
    return { series, ep };
  },
  head: ({ params }) => ({
    meta: [{ title: `Lecture · ${params.seriesId} — K·Intermédiaire` }],
  }),
  component: ReaderPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><p className="text-muted-foreground">Épisode introuvable.</p></div>
  ),
});

function ReaderPage() {
  const { series, ep } = Route.useLoaderData() as { series: { id: string }; ep: EpisodePart };
  const { user } = useUser();
  const list = EPISODES[series.id] ?? [];
  const currIdx = list.findIndex((e) => e.episode === ep.episode && e.part === ep.part);
  const nextEp = currIdx >= 0 ? list[currIdx + 1] : undefined;
  const partKey = `${ep.episode}-${ep.part}`;
  const done = (user.completedParts[series.id] ?? []).includes(partKey) || ep.optional;
  const [warn, setWarn] = useState(false);
  return (
    <div className="min-h-screen">
      <SlideReader ep={ep} seriesId={series.id} />
      {nextEp && (
        <div className="max-w-3xl mx-auto px-6 mt-8 flex justify-end">
          <div className="relative">
            {warn && (
              <div className="absolute right-0 bottom-full mb-2 whitespace-nowrap text-xs px-3 py-2 rounded-md bg-foreground text-background shadow-lg">
                Finis cette partie pour accéder à la partie suivante !
              </div>
            )}
            {done ? (
              <Link
                to="/read/$seriesId/$episode/$part"
                params={{ seriesId: series.id, episode: String(nextEp.episode), part: String(nextEp.part) }}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm transition-colors"
              >
                Partie suivante <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => { setWarn(true); setTimeout(() => setWarn(false), 2500); }}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 text-muted-foreground px-4 py-2 text-sm opacity-70"
              >
                Partie suivante <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
      <Comments episodeKey={`${series.id}-e${ep.episode}-p${ep.part}`} />
      <div className="h-16" />
    </div>
  );
}