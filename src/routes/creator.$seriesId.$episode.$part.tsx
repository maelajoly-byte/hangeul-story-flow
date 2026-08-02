import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/lib/user-store";
import {
  createSlide, deleteSlide, listLexicon, listParts, listSlides,
  upsertLexiconEntry, deleteLexiconEntry, updateSlide,
} from "@/lib/content";
import { DbSlideReader } from "@/components/db-slide-reader";
import { resolveLexiconRequests } from "@/lib/lexicon.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/creator/$seriesId/$episode/$part")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Éditeur de partie — Creator Mode | K·Intermédiaire" },
      { name: "description", content: "Éditer les diapos, le texte hangeul, les audios et le lexique d'une partie." },
      { property: "og:title", content: "Éditeur de partie — Creator Mode" },
      { property: "og:description", content: "Édition des diapos et du lexique." },
    ],
  }),
  component: Editor,
});

function Editor() {
  const { seriesId, episode, part } = Route.useParams();
  const { isAdmin } = useUser();
  const qc = useQueryClient();
  const resolve = useServerFn(resolveLexiconRequests);
  const [active, setActive] = useState(0);

  const { data: parts = [] } = useQuery({ queryKey: ["parts", seriesId], queryFn: () => listParts(seriesId), enabled: isAdmin });
  const current = parts.find((p) => p.episode === Number(episode) && p.part === Number(part));
  const { data: slides = [] } = useQuery({ queryKey: ["slides", current?.id], queryFn: () => listSlides(current!.id), enabled: !!current });
  const { data: lexicon = [] } = useQuery({ queryKey: ["lexicon", current?.id], queryFn: () => listLexicon(current!.id), enabled: !!current });

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center font-display text-3xl">Espace réservé</main>
      </div>
    );
  }
  if (!current) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">Partie introuvable.</main>
      </div>
    );
  }

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["slides", current.id] });
    qc.invalidateQueries({ queryKey: ["lexicon", current.id] });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="grid lg:grid-cols-2 gap-0 min-h-[calc(100vh-64px)]">
        <div className="border-r border-border/60">
          <DbSlideReader
            part={current}
            slides={slides}
            lexicon={lexicon}
            seriesId={seriesId}
            preview
            activeIndex={active}
            onIndexChange={setActive}
          />
        </div>

        <div className="p-5 overflow-auto">
          <Tabs defaultValue="main">
            <TabsList>
              <TabsTrigger value="main">Tableau principal</TabsTrigger>
              <TabsTrigger value="lex">Tableau lexique</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-3 mt-4">
              {slides.map((s, i) => (
                <div key={s.id} className={`rounded-xl border p-3 space-y-2 ${i === active ? "border-accent" : "border-border/60"}`} onClick={() => setActive(i)}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Diapo {s.position}</span>
                    <button onClick={async () => { await deleteSlide(s.id); refresh(); }} aria-label="Supprimer la diapo">
                      <Trash2 className="h-3.5 w-3.5 hover:text-destructive" />
                    </button>
                  </div>
                  <Input defaultValue={s.media_url ?? ""} placeholder="URL de la vidéo / image"
                    onBlur={async (e) => { await updateSlide(s.id, { media_url: e.target.value || null }); refresh(); }} />
                  <Textarea defaultValue={s.hangeul} rows={3} placeholder="Texte en hangeul pur" className="font-korean"
                    onBlur={async (e) => { await updateSlide(s.id, { hangeul: e.target.value }); refresh(); }} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input defaultValue={s.sfx_url ?? ""} placeholder="Audio fixe (bruitage)"
                      onBlur={async (e) => { await updateSlide(s.id, { sfx_url: e.target.value || null }); refresh(); }} />
                    <Input defaultValue={s.ambient_url ?? ""} placeholder="Audio ambiance (ou stop)"
                      onBlur={async (e) => { await updateSlide(s.id, { ambient_url: e.target.value || null }); refresh(); }} />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5"
                onClick={async () => {
                  await createSlide({ part_id: current.id, position: slides.length + 1, media_url: null, hangeul: "", sfx_url: null, ambient_url: null });
                  refresh();
                }}>
                <Plus className="h-3.5 w-3.5" /> Ajouter une diapo
              </Button>
            </TabsContent>

            <TabsContent value="lex" className="space-y-3 mt-4">
              {lexicon.map((l) => (
                <div key={l.id} className="rounded-xl border border-border/60 p-3 grid gap-2 sm:grid-cols-[80px_1fr_2fr_auto] items-start">
                  <Input type="number" defaultValue={l.slide_position}
                    onBlur={async (e) => { await upsertLexiconEntry({ ...l, slide_position: Number(e.target.value) }); refresh(); }} />
                  <Input defaultValue={l.term} className="font-korean"
                    onBlur={async (e) => { await upsertLexiconEntry({ ...l, term: e.target.value }); refresh(); }} />
                  <Textarea defaultValue={l.explanation} rows={2}
                    onBlur={async (e) => {
                      await upsertLexiconEntry({ ...l, explanation: e.target.value });
                      refresh();
                      if (e.target.value.trim()) {
                        await resolve({ data: {
                          partId: current.id, slidePosition: l.slide_position, term: l.term,
                          link: `/read/${seriesId}/${episode}/${part}`,
                        } }).catch(() => {});
                      }
                    }} />
                  <button onClick={async () => { await deleteLexiconEntry(l.id); refresh(); }} aria-label="Supprimer l'entrée">
                    <Trash2 className="h-4 w-4 hover:text-destructive" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5"
                onClick={async () => {
                  await upsertLexiconEntry({ part_id: current.id, slide_position: slides[active]?.position ?? 1, term: "", explanation: "" });
                  refresh();
                }}>
                <Plus className="h-3.5 w-3.5" /> Ajouter une entrée
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
