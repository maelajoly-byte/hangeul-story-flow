import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SeriesCard } from "@/components/series-card";
import { SERIES } from "@/lib/data";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Bibliothèque — K·Intermédiaire" },
      { name: "description", content: "Les 9 séries originales, dans l'ordre de progression recommandé." },
      { property: "og:title", content: "Bibliothèque — K·Intermédiaire" },
      { property: "og:description", content: "9 séries pour passer du B1 au B2." },
    ],
  }),
  component: Library,
});

function Library() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 max-w-3xl">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">Bibliothèque</div>
          <h1 className="font-display text-5xl text-balance">Neuf séries, une progression.</h1>
          <p className="text-muted-foreground mt-4">
            Chaque série a été conçue pour ajouter, à votre rythme, une couche de complexité grammaticale et culturelle.
            Commencez par « Ghost of the Past » — accessible gratuitement avec votre essai Premium activé.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SERIES.map((s) => <SeriesCard key={s.id} s={s} />)}
        </div>
      </main>
    </div>
  );
}