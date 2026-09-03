import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { DbSlideReader } from "@/components/db-slide-reader";
import { Comments } from "@/components/comments";
import { listParts, listSlides, listLexicon, listEpisodes } from "@/lib/content";
import { useUser } from "@/lib/user-store";

export const Route = createFileRoute("/read/$seriesId/$episode/$part")({
  head: ({ params }) => ({
    meta: [
      { title: `Lecture · Épisode ${params.episode} — K·Intermédiaire` },
      { name: "description", content: "Lisez l'histoire en coréen, diapo par diapo, avec le lexique intégré." },
      { property: "og:title", content: "Lecture — K·Intermédiaire" },
      { property: "og:description", content: "Une histoire coréenne illustrée, adaptée au niveau B1/B2." },
    ],
  }),
  component: ReaderPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><p className="text-muted-foreground">Épisode introuvable.</p></div>
  ),
});

function ReaderPage() {
  const { seriesId, episode, part } = Route.useParams();
  const epNum = Number(episode);
  const partNum = Number(part);
  const { user } = useUser();
  const [warn, setWarn] = useState(false);

  const { data: parts, isLoading } = useQuery({
    queryKey: ["parts", seriesId],
    queryFn: () => listParts(seriesId),
  });
  const { data: episodes } = useQuery({
    queryKey: ["episodes", seriesId],
    queryFn: () => listEpisodes(seriesId),
  });

  const current = parts?.find((p) => p.episode === epNum && p.part === partNum) ?? null;

  const { data: slides } = useQuery({
    queryKey: ["slides", current?.id],
    queryFn: () => listSlides(current!.id),
    enabled: !!current,
  });
  const { data: lexicon } = useQuery({
    queryKey: ["lexicon", current?.id],
    queryFn: () => listLexicon(current!.id),
    enabled: !!current,
  });

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Chargement…</div>;
  }
  if (!current) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <p className="text-muted-foreground">Cette partie n'est pas encore publiée.</p>
          <Link to="/series/$id" params={{ id: seriesId }} className="text-accent text-sm underline underline-offset-4 mt-3 inline-block">
            Retour à l'histoire
          </Link>
        </div>
      </div>
    );
  }

  const ordered = parts ?? [];
  const currIdx = ordered.findIndex((p) => p.id === current.id);
  const nextEp = currIdx >= 0 ? ordered[currIdx + 1] : undefined;
  const partKey = `${epNum}-${partNum}`;
  const done = (user.completedParts[seriesId] ?? []).includes(partKey) || current.optional;
  const epMeta = episodes?.find((e) => e.episode === epNum);

  return (
    <div className="min-h-screen">
      {(epMeta?.title || epMeta?.title_ko) && (
        <div className="mx-auto max-w-5xl px-6 pt-6 text-center">
          {epMeta.title_ko && <div className="font-korean text-lg text-foreground/70">{epMeta.title_ko}</div>}
          {epMeta.title && <h1 className="font-display text-2xl">{epMeta.title}</h1>}
        </div>
      )}
      <DbSlideReader
        part={current}
        slides={slides ?? []}
        lexicon={lexicon ?? []}
        seriesId={seriesId}
        contextLabel={`${seriesId} · Ép. ${epNum} · Partie ${partNum}`}
      />
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
                params={{ seriesId, episode: String(nextEp.episode), part: String(nextEp.part) }}
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
      <Comments episodeKey={`${seriesId}-e${epNum}-p${partNum}`} />
      <div className="h-16" />
    </div>
  );
}
