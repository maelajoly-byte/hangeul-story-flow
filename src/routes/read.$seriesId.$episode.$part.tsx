import { createFileRoute, notFound } from "@tanstack/react-router";
import { SlideReader } from "@/components/slide-reader";
import { Comments } from "@/components/comments";
import { getEpisodePart, getSeries, type EpisodePart } from "@/lib/data";

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
  return (
    <div className="min-h-screen">
      <SlideReader ep={ep} seriesId={series.id} />
      <Comments episodeKey={`${series.id}-e${ep.episode}-p${ep.part}`} />
      <div className="h-16" />
    </div>
  );
}