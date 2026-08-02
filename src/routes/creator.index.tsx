import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SERIES } from "@/lib/data";
import { useUser } from "@/lib/user-store";
import { PenLine } from "lucide-react";

export const Route = createFileRoute("/creator/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Creator Mode — K·Intermédiaire" },
      { name: "description", content: "Espace d'édition réservé à l'autrice : diapos, textes en hangeul, audio et lexique." },
      { property: "og:title", content: "Creator Mode — K·Intermédiaire" },
      { property: "og:description", content: "Espace d'édition des histoires." },
    ],
  }),
  component: CreatorHome,
});

function CreatorHome() {
  const { isAdmin } = useUser();
  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Espace réservé</h1>
          <p className="text-muted-foreground mt-3">Ce mode est accessible uniquement au compte administrateur.</p>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-center gap-3 mb-8">
          <PenLine className="h-5 w-5 text-accent" />
          <h1 className="font-display text-4xl">Creator Mode</h1>
        </div>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Aucune histoire n'est verrouillée ici. Choisissez une série, puis une partie à éditer.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERIES.map((s) => (
            <Link
              key={s.id}
              to="/creator/$seriesId"
              params={{ seriesId: s.id }}
              className="rounded-xl border border-border/70 bg-card p-5 hover:border-accent transition-colors"
            >
              <div className="font-display text-xl">{s.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.episodes} épisodes</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
