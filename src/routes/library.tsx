import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SeriesCard } from "@/components/series-card";
import { SERIES } from "@/lib/data";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Bibliothèque — 9 histoires en coréen pour B1/B2 | K·Intermédiaire" },
      { name: "description", content: "Neuf histoires illustrées en coréen, dans l'ordre de difficulté croissante, pour passer du B1 au B2. La première est offerte." },
      { property: "og:title", content: "Bibliothèque — K·Intermédiaire" },
      { property: "og:description", content: "9 histoires pour progresser en coréen, du B1 au B2." },
      { property: "og:url", content: "/library" },
    ],
    links: [{ rel: "canonical", href: "/library" }],
  }),
  component: Library,
});

function Library() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 max-w-3xl">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Bibliothèque</div>
          <h1 className="font-display text-5xl text-balance">Neuf histoires, une progression.</h1>
          <p className="text-muted-foreground mt-4">
            Les neuf récits de l'autrice Sara Eonni, présentés dans leur ordre de création — donc de
            difficulté croissante. Chaque histoire ajoute une couche de grammaire, de vocabulaire et
            de registres. Commencez par « Ghost of the Past », offerte intégralement.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SERIES.map((s) => <SeriesCard key={s.id} s={s} />)}
        </div>
      </main>
    </div>
  );
}