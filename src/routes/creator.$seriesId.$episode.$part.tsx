import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/lib/user-store";
import {
  addSlide, deleteSlide, listLexicon, listParts, listSlides,
  addLexiconEntry, updateLexiconEntry, deleteLexiconEntry, updateSlide, updatePart,
} from "@/lib/content";
import { DbSlideReader } from "@/components/db-slide-reader";
import { resolveLexiconRequests } from "@/lib/lexicon.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUBBLES, BUBBLE_POSITIONS, getBubble } from "@/lib/bubbles";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Save, Trash2, Layers, Globe, EyeOff } from "lucide-react";
import { toast } from "sonner";

const MEDIA_BASE = "https://media.sebastien-rebiere.fr/";

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
  const [slideDrafts, setSlideDrafts] = useState<Record<string, Partial<{ media_url: string; hangeul: string; sfx_url: string; ambient_url: string; bubble_type: string; bubble_position: string; speaker_name: string }>>>({});
  const [lexDrafts, setLexDrafts] = useState<Record<string, Partial<{ term: string; explanation: string; slide_position: number }>>>({});
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState("5");
  const [publishing, setPublishing] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [bubbleTypes, setBubbleTypes] = useState<Record<string, string>>({});

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

  const previewSlides = slides.map((s) => {
    const d = slideDrafts[s.id];
    if (!d) return s;
    return {
      ...s,
      ...(d.media_url !== undefined ? { media_url: d.media_url || null } : {}),
      ...(d.hangeul !== undefined ? { hangeul: d.hangeul } : {}),
      ...(d.sfx_url !== undefined ? { sfx_url: d.sfx_url || null } : {}),
      ...(d.ambient_url !== undefined ? { ambient_url: d.ambient_url || null } : {}),
      ...(d.bubble_type !== undefined ? { bubble_type: d.bubble_type } : {}),
      ...(d.bubble_position !== undefined ? { bubble_position: d.bubble_position } : {}),
      ...(d.speaker_name !== undefined ? { speaker_name: d.speaker_name } : {}),
    };
  });

  const dirty = Object.keys(slideDrafts).length > 0 || Object.keys(lexDrafts).length > 0;

  const setSlideField = (id: string, key: "media_url" | "hangeul" | "sfx_url" | "ambient_url" | "bubble_type" | "bubble_position" | "speaker_name", value: string) =>
    setSlideDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const setLexField = (id: string, key: "term" | "explanation" | "slide_position", value: string | number) =>
    setLexDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const [id, d] of Object.entries(slideDrafts)) {
        await updateSlide(id, {
          ...(d.media_url !== undefined ? { media_url: d.media_url || null } : {}),
          ...(d.hangeul !== undefined ? { hangeul: d.hangeul } : {}),
          ...(d.sfx_url !== undefined ? { sfx_url: d.sfx_url || null } : {}),
          ...(d.ambient_url !== undefined ? { ambient_url: d.ambient_url || null } : {}),
          ...(d.bubble_type !== undefined ? { bubble_type: d.bubble_type } : {}),
          ...(d.bubble_position !== undefined ? { bubble_position: d.bubble_position } : {}),
          ...(d.speaker_name !== undefined ? { speaker_name: d.speaker_name } : {}),
        });
      }
      for (const [id, d] of Object.entries(lexDrafts)) {
        await updateLexiconEntry(id, d);
        const entry = lexicon.find((l) => l.id === id);
        const explanation = d.explanation ?? entry?.explanation ?? "";
        const term = d.term ?? entry?.term ?? "";
        const pos = d.slide_position ?? entry?.slide_position ?? 1;
        if (explanation.trim() && term.trim()) {
          await resolve({ data: { partId: current.id, slidePosition: pos, term, link: `/read/${seriesId}/${episode}/${part}` } }).catch(() => {});
        }
      }
      setSlideDrafts({});
      setLexDrafts({});
      refresh();
      toast.success("Modifications enregistrées");
    } catch {
      toast.error("Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  const addSlides = async (count: number) => {
    try {
      let next = slides.length;
      for (let i = 0; i < count; i++) {
        next += 1;
        await addSlide(current.id, next);
      }
      refresh();
      toast.success(count > 1 ? `${count} diapos ajoutées` : "Diapo ajoutée");
    } catch {
      toast.error("Impossible d'ajouter les diapos.");
    }
  };

  const togglePublish = async () => {
    setPublishing(true);
    try {
      await updatePart(current.id, { published: !current.published });
      await qc.invalidateQueries({ queryKey: ["parts", seriesId] });
      toast.success(current.published ? "Partie dépubliée" : "Partie publiée pour les lecteurs");
    } catch {
      toast.error("Impossible de modifier la publication.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="grid lg:grid-cols-2 gap-0 min-h-[calc(100vh-64px)] items-start">
        <div className="border-r border-border/60 lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
          <DbSlideReader
            part={current}
            slides={previewSlides}
            lexicon={lexicon}
            seriesId={seriesId}
            preview
            activeIndex={active}
            onIndexChange={setActive}
          />
        </div>

        <div className="p-5 overflow-auto">
          <div className="flex items-center justify-end gap-2 mb-3">
            <Button size="sm" className="gap-1.5" onClick={saveAll} disabled={!dirty || saving}>
              <Save className="h-3.5 w-3.5" /> {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button
              size="sm"
              variant={current.published ? "outline" : "default"}
              className="gap-1.5"
              onClick={togglePublish}
              disabled={publishing}
            >
              {current.published ? <EyeOff className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
              {current.published ? "Dépublier" : "Publier"}
            </Button>
          </div>
          <Tabs defaultValue="main">
            <TabsList>
              <TabsTrigger value="main">Tableau principal</TabsTrigger>
              <TabsTrigger value="lex">Tableau lexique</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-3 mt-4">
              {slides.map((s, i) => {
                const bubbleId = bubbleTypes[s.id] ?? s.bubble_type ?? "none";
                const hasNameTag = !!getBubble(bubbleId).nameTag;
                return (
                <div
                  key={s.id}
                  ref={(el) => { cardRefs.current[s.id] = el; }}
                  className={`rounded-xl border p-3 space-y-2 ${i === active ? "border-accent" : "border-border/60"}`}
                  onClick={() => setActive(i)}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Diapo {s.position}</span>
                    <button onClick={async () => { await deleteSlide(s.id); refresh(); }} aria-label="Supprimer la diapo">
                      <Trash2 className="h-3.5 w-3.5 hover:text-destructive" />
                    </button>
                  </div>
                  <Input defaultValue={s.media_url ?? MEDIA_BASE} placeholder="URL de la vidéo / image"
                    onChange={(e) => setSlideField(s.id, "media_url", e.target.value)} />
                  <Textarea defaultValue={s.hangeul} rows={3} placeholder="Texte en hangeul pur" className="font-korean"
                    onChange={(e) => setSlideField(s.id, "hangeul", e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input defaultValue={s.sfx_url ?? ""} placeholder="Audio fixe (bruitage)"
                      onChange={(e) => setSlideField(s.id, "sfx_url", e.target.value)} />
                    <Input defaultValue={s.ambient_url ?? ""} placeholder="Audio ambiance (ou stop)"
                      onChange={(e) => setSlideField(s.id, "ambient_url", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      defaultValue={s.bubble_type || "none"}
                      onValueChange={(v) => { setSlideField(s.id, "bubble_type", v); setBubbleTypes((p) => ({ ...p, [s.id]: v })); }}
                    >
                      <SelectTrigger><SelectValue placeholder="Type de bulle" /></SelectTrigger>
                      <SelectContent>
                        {BUBBLES.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      defaultValue={s.bubble_position || "bottom"}
                      onValueChange={(v) => setSlideField(s.id, "bubble_position", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Emplacement" /></SelectTrigger>
                      <SelectContent>
                        {BUBBLE_POSITIONS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasNameTag && (
                    <Input
                      defaultValue={s.speaker_name ?? ""}
                      placeholder="[nom] du personnage qui parle"
                      className="font-korean"
                      onChange={(e) => setSlideField(s.id, "speaker_name", e.target.value)}
                    />
                  )}
                </div>
                );
              })}
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setBulkOpen(true)}>
                  <Layers className="h-3.5 w-3.5" /> Ajouter des diapos
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addSlides(1)}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter une diapo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="lex" className="space-y-3 mt-4">
              {lexicon.map((l) => (
                <div key={l.id} className="rounded-xl border border-border/60 p-3 grid gap-2 sm:grid-cols-[80px_1fr_2fr_auto] items-start">
                  <Input type="number" defaultValue={l.slide_position}
                    onChange={(e) => setLexField(l.id, "slide_position", Number(e.target.value))} />
                  <Input defaultValue={l.term} className="font-korean"
                    onChange={(e) => setLexField(l.id, "term", e.target.value)} />
                  <Textarea defaultValue={l.explanation} rows={2}
                    onChange={(e) => setLexField(l.id, "explanation", e.target.value)} />
                  <button onClick={async () => { await deleteLexiconEntry(l.id); refresh(); }} aria-label="Supprimer l'entrée">
                    <Trash2 className="h-4 w-4 hover:text-destructive" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5"
                onClick={async () => {
                  await addLexiconEntry({ part_id: current.id, slide_position: slides[active]?.position ?? 1, term: "", explanation: "" });
                  refresh();
                }}>
                <Plus className="h-3.5 w-3.5" /> Ajouter une entrée
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des diapos</DialogTitle>
            <DialogDescription>Combien de diapos souhaitez-vous ajouter&nbsp;?</DialogDescription>
          </DialogHeader>
          <Input type="number" min={1} max={100} value={bulkCount} onChange={(e) => setBulkCount(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Annuler</Button>
            <Button
              onClick={async () => {
                const n = Math.max(1, Math.min(100, Number(bulkCount) || 1));
                setBulkOpen(false);
                await addSlides(n);
              }}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
