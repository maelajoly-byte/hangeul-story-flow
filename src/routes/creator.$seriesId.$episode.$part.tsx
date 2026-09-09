import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/lib/user-store";
import {
  addSlide, createSlidesBulk, deleteSlide, listLexicon, listParts, listSlides,
  addLexiconEntry, updateLexiconEntry, deleteLexiconEntry, updateSlide, updatePart,
  listEpisodes, upsertEpisode, insertSlideAt,
} from "@/lib/content";
import { DbSlideReader } from "@/components/db-slide-reader";
import { resolveLexiconRequests } from "@/lib/lexicon.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUBBLES, BUBBLE_POSITIONS, getBubble } from "@/lib/bubbles";
import { readDocxParagraphs, parseScript, BUBBLE_LABELS, type ParsedLine } from "@/lib/docx-script";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Save, Trash2, Layers, Globe, EyeOff, FileText, Eraser } from "lucide-react";
import { toast } from "sonner";


const MEDIA_BASES: Record<string, string> = {
  "ghost-of-the-past": "https://media.sebastien-rebiere.fr/Ghost_Of_The_Past/GP1_Slides/",
};
const DEFAULT_MEDIA_BASE = "https://media.sebastien-rebiere.fr/";

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
  const mediaBase = MEDIA_BASES[seriesId] ?? DEFAULT_MEDIA_BASE;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const resolve = useServerFn(resolveLexiconRequests);

  const [active, setActive] = useState(0);
  const [slideDrafts, setSlideDrafts] = useState<Record<string, Partial<{ media_url: string; hangeul: string; sfx_url: string; ambient_url: string; bubble_type: string; bubble_position: string; speaker_name: string }>>>({});
  const [lexDrafts, setLexDrafts] = useState<Record<string, Partial<{ term: string; explanation: string; slide_position: number }>>>({});
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFrom, setBulkFrom] = useState("1");
  const [bulkTo, setBulkTo] = useState("10");
  const [bulkBase, setBulkBase] = useState(mediaBase);
  const [bulkPattern, setBulkPattern] = useState("{NUM}-GP1_E1_S{NUM}_nosound.mp4");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [importName, setImportName] = useState("");
  const [importError, setImportError] = useState("");
  const [parsed, setParsed] = useState<ParsedLine[]>([]);
  const [fromFile, setFromFile] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"end" | "at">("end");
  const [addPos, setAddPos] = useState("1");
  const [clearBusy, setClearBusy] = useState(false);


  const [publishing, setPublishing] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [bubbleTypes, setBubbleTypes] = useState<Record<string, string>>({});
  const [titleDraft, setTitleDraft] = useState<Partial<{ title: string; title_ko: string }>>({});
  const [epDraft, setEpDraft] = useState<Partial<{ title: string; title_ko: string }>>({});

  const { data: parts = [] } = useQuery({ queryKey: ["parts", seriesId], queryFn: () => listParts(seriesId), enabled: isAdmin });
  const current = parts.find((p) => p.episode === Number(episode) && p.part === Number(part));
  const { data: slides = [] } = useQuery({ queryKey: ["slides", current?.id], queryFn: () => listSlides(current!.id), enabled: !!current });
  const { data: lexicon = [] } = useQuery({ queryKey: ["lexicon", current?.id], queryFn: () => listLexicon(current!.id), enabled: !!current });
  const { data: episodes = [] } = useQuery({ queryKey: ["episodes", seriesId], queryFn: () => listEpisodes(seriesId), enabled: isAdmin });
  const epMeta = episodes.find((e) => e.episode === Number(episode));

  const activeSlideId = slides[active]?.id;
  useEffect(() => {
    if (!activeSlideId) return;
    cardRefs.current[activeSlideId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSlideId]);

  // À l'ouverture de la fenêtre d'import, préremplir le tableau avec les diapos existantes.
  useEffect(() => {
    if (!importOpen) return;
    setParsed((prev) => {
      if (prev.length > 0) return prev;
      return slides.map((s, i) => {
        const bt = (s.bubble_type ?? "") as string;
        const type: ParsedLine["bubble_type"] =
          bt === "bp-normal" || bt === "bpp-classic" || bt === "bpp-narrator" ? bt : "bpp-narrator";
        return { index: i + 1, bubble_type: type, speaker_name: s.speaker_name ?? "", text: s.hangeul ?? "" };
      });
    });
  }, [importOpen, slides]);

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

  const dirty =
    Object.keys(slideDrafts).length > 0 ||
    Object.keys(lexDrafts).length > 0 ||
    Object.keys(titleDraft).length > 0 ||
    Object.keys(epDraft).length > 0;

  const goToSlidePosition = (pos: number) => {
    const i = slides.findIndex((s) => s.position === pos);
    if (i >= 0) setActive(i);
  };

  const bulkPlan = (() => {
    const from = Number(bulkFrom);
    const to = Number(bulkTo);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) {
      return { error: "Indiquez une plage valide (première ≤ dernière).", rows: [] as { position: number; media_url: string }[], skipped: [] as number[], preview: [] as string[] };
    }
    if (to - from + 1 > 500) {
      return { error: "Plage trop large (500 diapos maximum).", rows: [], skipped: [], preview: [] };
    }
    if (!bulkPattern.includes("{NUM}")) {
      return { error: "Le modèle doit contenir {NUM}.", rows: [], skipped: [], preview: [] };
    }
    const base = bulkBase.endsWith("/") ? bulkBase : bulkBase + "/";
    const existing = new Set(slides.map((s) => s.position));
    const rows: { position: number; media_url: string }[] = [];
    const skipped: number[] = [];
    for (let n = from; n <= to; n++) {
      if (existing.has(n)) { skipped.push(n); continue; }
      rows.push({ position: n, media_url: base + bulkPattern.replaceAll("{NUM}", String(n).padStart(3, "0")) });
    }
    const preview = rows.length <= 6
      ? rows.map((r) => r.media_url)
      : [...rows.slice(0, 3).map((r) => r.media_url), "…", ...rows.slice(-3).map((r) => r.media_url)];
    return { error: "", rows, skipped, preview };
  })();

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
      if (Object.keys(titleDraft).length > 0) {
        await updatePart(current.id, titleDraft);
        await qc.invalidateQueries({ queryKey: ["parts", seriesId] });
      }
      if (Object.keys(epDraft).length > 0) {
        await upsertEpisode({
          series_id: seriesId,
          episode: Number(episode),
          title: epDraft.title ?? epMeta?.title ?? "",
          title_ko: epDraft.title_ko ?? epMeta?.title_ko ?? "",
        });
        await qc.invalidateQueries({ queryKey: ["episodes", seriesId] });
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
      setTitleDraft({});
      setEpDraft({});
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

  const insertAt = async (position: number) => {
    try {
      await insertSlideAt(current.id, position);
      refresh();
      toast.success(`Diapo insérée en position ${position}`);
    } catch {
      toast.error("Impossible d'insérer la diapo.");
    }
  };

  /* --- édition de l'aperçu d'import --- */
  const updateLine = (i: number, patch: Partial<ParsedLine>) =>
    setParsed((prev) => prev.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const insertLine = (i: number) =>
    setParsed((prev) => {
      const copy = [...prev];
      copy.splice(i, 0, { index: i + 1, bubble_type: "bpp-narrator", speaker_name: "", text: "" });
      return copy.map((l, k) => ({ ...l, index: k + 1 }));
    });
  const removeLine = (i: number) =>
    setParsed((prev) => prev.filter((_, k) => k !== i).map((l, k) => ({ ...l, index: k + 1 })));
  const moveLine = (i: number, delta: number) =>
    setParsed((prev) => {
      const t = i + delta;
      if (t < 0 || t >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[t]] = [copy[t]!, copy[i]!];
      return copy.map((l, k) => ({ ...l, index: k + 1 }));
    });


  const onPickFile = async (file: File) => {
    setImportError("");
    setParsed([]);
    setImportName(file.name);
    try {
      const buf = await file.arrayBuffer();
      setParsed(parseScript(readDocxParagraphs(buf)));
      setFromFile(true);
    } catch {
      setImportError("Impossible de lire ce fichier .docx.");
      setFromFile(false);
    }
  };

  const mismatch =
    parsed.length === 0 || parsed.length === slides.length
      ? ""
      : parsed.length < slides.length
        ? `${slides.length} diapos · ${parsed.length} textes — il manque ${slides.length - parsed.length} texte(s). Ajoutez des lignes (même vides) ci-dessous.`
        : `${slides.length} diapos · ${parsed.length} textes — ${parsed.length - slides.length} texte(s) en trop. Supprimez des lignes ci-dessous.`;

  const runImport = async () => {
    setImportBusy(true);
    try {
      for (let i = 0; i < parsed.length; i++) {
        const line = parsed[i]!;
        const slide = slides[i]!;
        await updateSlide(slide.id, {
          hangeul: line.text,
          bubble_type: line.text.trim() ? line.bubble_type : "none",
          bubble_position: "center",
          speaker_name: line.bubble_type === "bp-normal" ? line.speaker_name : "",
        });
      }
      setImportOpen(false);
      setFromFile(false);
      setSlideDrafts({});
      refresh();
      toast.success(`${parsed.length} diapos mises à jour`);
    } catch {
      toast.error("Impossible d'importer le script.");
    } finally {
      setImportBusy(false);
    }
  };

  /** Vide le texte, le type de bulle et le nom du personnage de toutes les diapos. */
  const clearImported = async () => {
    setClearBusy(true);
    try {
      for (const s of slides) {
        await updateSlide(s.id, { hangeul: "", bubble_type: "none", speaker_name: "" });
      }
      setSlideDrafts({});
      refresh();
      toast.success("Script importé supprimé");
    } catch {
      toast.error("Impossible de supprimer le script importé.");
    } finally {
      setClearBusy(false);
    }
  };


  const counts = {
    bp: parsed.filter((p) => p.bubble_type === "bp-normal").length,
    classic: parsed.filter((p) => p.bubble_type === "bpp-classic").length,
    narrator: parsed.filter((p) => p.bubble_type === "bpp-narrator").length,
  };
  const filledPositions = parsed.length === slides.length
    ? slides.filter((s) => (s.hangeul ?? "").trim().length > 0).map((s) => s.position)
    : [];



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
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Link to="/creator/$seriesId" params={{ seriesId }}>
              <Button size="sm" variant="ghost" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Toutes les parties
              </Button>
            </Link>
            <Select
              value={`${episode}/${part}`}
              onValueChange={(v) => {
                const [ep, pt] = v.split("/");
                setActive(0);
                navigate({ to: "/creator/$seriesId/$episode/$part", params: { seriesId, episode: ep!, part: pt! } });
              }}
            >
              <SelectTrigger className="h-8 w-[280px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {parts
                  .filter((p) => p.episode === Number(episode))
                  .sort((a, b) => a.part - b.part)
                  .map((p) => (
                    <SelectItem key={p.id} value={`${p.episode}/${p.part}`}>
                      Partie {p.part} — {p.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
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
          </div>

          <div className="rounded-xl border border-border/60 p-3 mb-4 grid gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2 text-xs uppercase tracking-wider text-muted-foreground">
              Titres — Épisode {episode} · Partie {part}
            </div>
            <Input key={`epko-${epMeta?.id ?? "new"}`} defaultValue={epMeta?.title_ko ?? ""} className="font-korean"
              placeholder="Nom coréen de l'épisode" onChange={(e) => setEpDraft((d) => ({ ...d, title_ko: e.target.value }))} />
            <Input key={`epfr-${epMeta?.id ?? "new"}`} defaultValue={epMeta?.title ?? ""}
              placeholder="Nom français de l'épisode" onChange={(e) => setEpDraft((d) => ({ ...d, title: e.target.value }))} />
            <Input defaultValue={current.title_ko ?? ""} className="font-korean"
              placeholder="Nom coréen de la partie" onChange={(e) => setTitleDraft((d) => ({ ...d, title_ko: e.target.value }))} />
            <Input defaultValue={current.title ?? ""}
              placeholder="Nom français de la partie" onChange={(e) => setTitleDraft((d) => ({ ...d, title: e.target.value }))} />
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
                  <Input defaultValue={s.media_url ?? mediaBase} placeholder="URL de la vidéo / image"
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
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setParsed([]); setImportError(""); setImportName(""); setImportOpen(true); }}>
                  <FileText className="h-3.5 w-3.5" /> Importer le script (.docx)
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setBulkOpen(true)}>
                  <Layers className="h-3.5 w-3.5" /> Créer des diapos en masse
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5"
                  onClick={() => { setAddMode("end"); setAddPos(String(slides.length + 1)); setAddOpen(true); }}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter une diapo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="lex" className="space-y-3 mt-4">
              {lexicon.map((l) => (
                <div key={l.id}
                  onClick={() => goToSlidePosition((lexDrafts[l.id]?.slide_position ?? l.slide_position) as number)}
                  className="rounded-xl border border-border/60 p-3 grid gap-2 sm:grid-cols-[80px_1fr_2fr_auto] items-start">
                  <Input type="number" defaultValue={l.slide_position}
                    onChange={(e) => {
                      const pos = Number(e.target.value);
                      setLexField(l.id, "slide_position", pos);
                      goToSlidePosition(pos);
                    }} />
                  <Input defaultValue={l.term} className="font-korean"
                    onFocus={() => goToSlidePosition((lexDrafts[l.id]?.slide_position ?? l.slide_position) as number)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Création de diapos en masse</DialogTitle>
            <DialogDescription>
              Les URL vidéo sont générées automatiquement. {"{NUM}"} est remplacé par le numéro sur 3 chiffres.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Première diapo
                <Input type="number" min={1} value={bulkFrom} onChange={(e) => setBulkFrom(e.target.value)} />
              </label>
              <label className="text-sm">Dernière diapo
                <Input type="number" min={1} value={bulkTo} onChange={(e) => setBulkTo(e.target.value)} />
              </label>
            </div>
            <label className="text-sm">URL de base du dossier média
              <Input value={bulkBase} onChange={(e) => setBulkBase(e.target.value)} />
            </label>
            <label className="text-sm">Modèle de nom de fichier
              <Input value={bulkPattern} onChange={(e) => setBulkPattern(e.target.value)} />
            </label>

            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs">
              {bulkPlan.error ? (
                <p className="text-destructive">{bulkPlan.error}</p>
              ) : (
                <>
                  <p className="mb-1 font-medium">
                    Aperçu — {bulkPlan.rows.length} diapo(s) à créer
                    {bulkPlan.skipped.length > 0 && ` · ${bulkPlan.skipped.length} déjà existante(s), ignorée(s) : ${bulkPlan.skipped.join(", ")}`}
                  </p>
                  <ul className="space-y-0.5 break-all font-mono">
                    {bulkPlan.preview.map((line, i) => (
                      <li key={i} className={line === "…" ? "text-muted-foreground" : ""}>{line}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Annuler</Button>
            <Button
              disabled={!!bulkPlan.error || bulkPlan.rows.length === 0 || bulkBusy}
              onClick={async () => {
                setBulkBusy(true);
                try {
                  const n = await createSlidesBulk(current.id, bulkPlan.rows);
                  setBulkOpen(false);
                  refresh();
                  toast.success(`${n} diapo(s) créée(s)`);
                } catch {
                  toast.error("Impossible de créer les diapos.");
                } finally {
                  setBulkBusy(false);
                }
              }}
            >
              Créer les diapos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Importer le script coréen (.docx)</DialogTitle>
            <DialogDescription>
              Le document couvre exactement cette partie : le 1<sup>er</sup> texte va sur la 1<sup>re</sup> diapo, et ainsi de suite.
              Les lignes « Nom : » et les lignes vides ne comptent pas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickFile(f); }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Choisir un fichier .docx</Button>
              <span className="text-xs text-muted-foreground">{importName || "Aucun fichier sélectionné"}</span>
            </div>

            {importError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{importError}</p>}

            {parsed.length > 0 && (
              <>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{slides.length} diapos dans la partie</span>
                  <span>{parsed.length} textes détectés</span>
                  <span>BP · Normal : {counts.bp}</span>
                  <span>BPP · Classic : {counts.classic}</span>
                  <span>BPP · Narrator : {counts.narrator}</span>
                </div>
                {filledPositions.length > 0 && !importError && (
                  <p className="rounded-xl bg-amber-500/10 p-3 text-xs">
                    Attention : {filledPositions.length} diapo(s) contiennent déjà du texte et seront remplacées
                    (n° {filledPositions.join(", ")}).
                  </p>
                )}
                {mismatch && <p className="rounded-xl bg-amber-500/10 p-3 text-xs">{mismatch}</p>}
                <div className="max-h-[45vh] overflow-y-auto rounded-xl border border-border/60">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/70">
                      <tr className="text-left">
                        <th className="p-2 w-12">N°</th>
                        <th className="p-2 w-36">Bulle</th>
                        <th className="p-2 w-28">Personnage</th>
                        <th className="p-2">Texte coréen</th>
                        <th className="p-2 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.map((l, i) => {
                        const existing = (slides[i]?.hangeul ?? "").trim().length > 0;
                        return (
                          <tr key={i} className="border-t border-border/50 align-top">
                            <td className="p-2">
                              {slides[i]?.position ?? l.index}
                              {existing && <span className="ml-1 text-amber-600" title="Texte déjà présent">•</span>}
                            </td>
                            <td className="p-2">
                              <Select value={l.bubble_type} onValueChange={(v) => updateLine(i, { bubble_type: v as ParsedLine["bubble_type"] })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(BUBBLE_LABELS).map(([id, label]) => (
                                    <SelectItem key={id} value={id}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              {l.bubble_type === "bp-normal" ? (
                                <Input className="h-8 font-korean text-xs" value={l.speaker_name}
                                  onChange={(e) => updateLine(i, { speaker_name: e.target.value })} />
                              ) : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="p-2">
                              <Textarea rows={2} className="font-korean text-xs" value={l.text}
                                onChange={(e) => updateLine(i, { text: e.target.value })} />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <button onClick={() => moveLine(i, -1)} aria-label="Monter"><ChevronUp className="h-3.5 w-3.5" /></button>
                                <button onClick={() => moveLine(i, 1)} aria-label="Descendre"><ChevronDown className="h-3.5 w-3.5" /></button>
                                <button onClick={() => insertLine(i)} aria-label="Insérer une ligne vide ici"><Plus className="h-3.5 w-3.5" /></button>
                                <button onClick={() => removeLine(i)} aria-label="Supprimer la ligne"><Trash2 className="h-3.5 w-3.5 hover:text-destructive" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 self-start" onClick={() => insertLine(parsed.length)}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter une ligne vide à la fin
                </Button>
              </>
            )}
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" className="gap-1.5 mr-auto" disabled={clearBusy} onClick={clearImported}>
              <Eraser className="h-3.5 w-3.5" /> Supprimer le script importé
            </Button>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Annuler</Button>
            <Button disabled={!!importError || !!mismatch || parsed.length === 0 || importBusy} onClick={runImport}>
              Confirmer l'import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajouter une diapo</DialogTitle>
            <DialogDescription>Choisissez où placer la nouvelle diapo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Select value={addMode} onValueChange={(v) => setAddMode(v as "end" | "at")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="end">Dernière diapo</SelectItem>
                <SelectItem value="at">Choisir l'emplacement</SelectItem>
              </SelectContent>
            </Select>
            {addMode === "at" && (
              <label className="text-sm">Numéro de la nouvelle diapo
                <Input type="number" min={1} max={slides.length + 1} value={addPos} onChange={(e) => setAddPos(e.target.value)} />
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button
              onClick={async () => {
                const pos = Number(addPos);
                setAddOpen(false);
                if (addMode === "end") await addSlides(1);
                else if (Number.isInteger(pos) && pos >= 1 && pos <= slides.length + 1) await insertAt(pos);
                else toast.error("Numéro de diapo invalide.");
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
