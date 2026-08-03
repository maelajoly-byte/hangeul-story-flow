import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SERIES } from "@/lib/data";
import { useUser } from "@/lib/user-store";
import { createPart, deletePartDeep, listParts, listSlides, listLexicon } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/creator/$seriesId/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Édition d'une histoire — Creator Mode | K·Intermédiaire" },
      { name: "description", content: "Gérer les épisodes et les parties d'une histoire." },
      { property: "og:title", content: "Édition d'une histoire — Creator Mode" },
      { property: "og:description", content: "Gérer les épisodes et les parties." },
    ],
  }),
  component: CreatorSeries,
});

function CreatorSeries() {
  const { seriesId } = Route.useParams();
  const { isAdmin } = useUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const series = SERIES.find((s) => s.id === seriesId);
  const [pending, setPending] = useState<{ id: string; label: string; hasContent: boolean } | null>(null);
  const { data: parts = [] } = useQuery({
    queryKey: ["parts", seriesId],
    queryFn: () => listParts(seriesId),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center font-display text-3xl">Espace réservé</main>
      </div>
    );
  }

  const episodeCount = typeof series?.episodes === "number" ? series.episodes : 1;
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1);
  const allEpisodes = Array.from(new Set([...episodes, ...parts.map((p) => p.episode)])).sort((a, b) => a - b);

  const addPart = async (episode: number) => {
    const existing = parts.filter((p) => p.episode === episode);
    const next = (existing.at(-1)?.part ?? 0) + 1;
    try {
      const created = await createPart({
        series_id: seriesId,
        episode,
        part: next,
        title: `Partie ${next}`,
        optional: false,
      });
      await qc.invalidateQueries({ queryKey: ["parts", seriesId] });
      toast.success("Partie ajoutée");
      navigate({
        to: "/creator/$seriesId/$episode/$part",
        params: { seriesId, episode: String(created.episode), part: String(created.part) },
      });
    } catch {
      toast.error("Impossible d'ajouter la partie.");
    }
  };

  const askDelete = async (partId: string, label: string) => {
    let hasContent = false;
    try {
      const [slides, lexicon] = await Promise.all([listSlides(partId), listLexicon(partId)]);
      hasContent =
        lexicon.length > 0 ||
        slides.some((s) => s.hangeul.trim() || s.media_url || s.sfx_url || s.ambient_url);
    } catch {
      hasContent = true;
    }
    setPending({ id: partId, label, hasContent });
  };

  const confirmDelete = async () => {
    if (!pending) return;
    try {
      await deletePartDeep(pending.id);
      await qc.invalidateQueries({ queryKey: ["parts", seriesId] });
      toast.success("Partie supprimée");
    } catch {
      toast.error("Impossible de supprimer la partie.");
    }
    setPending(null);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-display text-4xl mb-8">{series?.title ?? seriesId}</h1>
        <Accordion type="multiple" className="space-y-2">
          {allEpisodes.map((ep) => (
            <AccordionItem key={ep} value={`ep-${ep}`} className="border border-border/70 rounded-xl px-4">
              <AccordionTrigger className="font-display">Épisode {ep}</AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4">
                {parts
                  .filter((p) => p.episode === ep)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 hover:border-accent transition-colors"
                    >
                      <Link
                        to="/creator/$seriesId/$episode/$part"
                        params={{ seriesId, episode: String(ep), part: String(p.part) }}
                        className="flex-1"
                      >
                        Partie {p.part} — {p.title}
                        {p.optional && <span className="ml-2 text-xs text-muted-foreground">(optionnelle)</span>}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Supprimer la partie ${p.part}`}
                        onClick={() => askDelete(p.id, `Partie ${p.part} — ${p.title}`)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                <Button variant="outline" size="sm" onClick={() => addPart(ep)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Ajouter une partie
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {pending?.label} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.hasContent
                ? "Cette partie contient du contenu (diapos, textes ou lexique). Êtes-vous sûre de vouloir la supprimer ? Cette action est irréversible."
                : "Cette partie est vide. Elle sera définitivement supprimée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
