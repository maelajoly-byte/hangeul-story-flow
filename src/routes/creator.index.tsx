import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SeriesCard } from "@/components/series-card";
import { listSeriesRows, rowToSeries, updateSeriesRow, type SeriesRow } from "@/lib/series-db";
import { useUser } from "@/lib/user-store";
import { PenLine, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/creator/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Creator Mode — K·Intermédiaire" },
      { name: "description", content: "Espace d'édition réservé à l'autrice : fiches des histoires, diapos, textes en hangeul, audio et lexique." },
      { property: "og:title", content: "Creator Mode — K·Intermédiaire" },
      { property: "og:description", content: "Espace d'édition des histoires." },
    ],
  }),
  component: CreatorHome,
});

function CreatorHome() {
  const { isAdmin } = useUser();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["series"],
    queryFn: listSeriesRows,
    enabled: isAdmin,
  });

  const editing = useMemo(() => rows?.find((r) => r.id === editingId) ?? null, [rows, editingId]);

  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SeriesRow> }) => updateSeriesRow(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["series"] });
      toast.success("Fiche enregistrée");
      setEditingId(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec de l'enregistrement"),
  });

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
      <main className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-center gap-3 mb-4">
          <PenLine className="h-5 w-5 text-accent" />
          <h1 className="font-display text-4xl">Creator Mode</h1>
        </div>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Aucune histoire n'est verrouillée ici. « Éditer la fiche » modifie la couverture, le titre, la note,
          le synopsis et les thématiques ; « Modifier » ouvre les épisodes et les parties.
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(rows ?? []).map((r) => (
              <SeriesCard key={r.id} s={rowToSeries(r)} creator onEdit={() => setEditingId(r.id)} />
            ))}
          </div>
        )}
      </main>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditingId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {editing && (
            <SeriesForm
              key={editing.id}
              row={editing}
              saving={save.isPending}
              onSave={(patch) => save.mutate({ id: editing.id, patch })}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SeriesForm({ row, saving, onSave }: { row: SeriesRow; saving: boolean; onSave: (patch: Partial<SeriesRow>) => void }) {
  const [draft, setDraft] = useState<SeriesRow>(row);
  const [moods, setMoods] = useState(row.moods.join(", "));
  const set = <K extends keyof SeriesRow>(k: K, v: SeriesRow[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="font-display text-2xl">{draft.title}</SheetTitle>
      </SheetHeader>

      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={draft.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Titre en hangeul</Label>
        <Input className="font-korean" value={draft.title_ko} onChange={(e) => set("title_ko", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Synopsis</Label>
        <Textarea rows={3} value={draft.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Note (demi-étoiles)</Label>
          <Select value={String(draft.stars)} onValueChange={(v) => set("stars", Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => (
                <SelectItem key={v} value={String(v)}>{v.toFixed(1)} ★</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nombre d'épisodes</Label>
          <Input type="number" min={1} value={draft.episodes} onChange={(e) => set("episodes", Number(e.target.value) || 1)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thématiques (séparées par des virgules)</Label>
        <Input value={moods} onChange={(e) => setMoods(e.target.value)} placeholder="Mystère, Drame, Surnaturel léger" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={draft.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="coming_soon">Bientôt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ordre</Label>
          <Input type="number" min={1} value={draft.order_index} onChange={(e) => set("order_index", Number(e.target.value) || 1)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Image de couverture (URL)</Label>
        <Input
          value={draft.cover_image_url ?? "https://media.sebastien-rebiere.fr/"}
          onChange={(e) => set("cover_image_url", e.target.value)}
          placeholder="https://media.sebastien-rebiere.fr/couverture.jpg"
        />
        <p className="text-xs text-muted-foreground">Laissez vide pour utiliser le dégradé et le symbole ci-dessous.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Dégradé haut</Label>
          <Input type="color" value={draft.cover_from} onChange={(e) => set("cover_from", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Dégradé bas</Label>
          <Input type="color" value={draft.cover_to} onChange={(e) => set("cover_to", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Symbole</Label>
          <Input className="font-korean" value={draft.cover_symbol} onChange={(e) => set("cover_symbol", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
        <div>
          <Label>Histoire offerte</Label>
          <p className="text-xs text-muted-foreground">Accessible sans déblocage.</p>
        </div>
        <Switch checked={draft.free} onCheckedChange={(v) => set("free", v)} />
      </div>

      <div className="flex justify-end gap-2 pb-8">
        <Button
          disabled={saving}
          className="bg-cream text-cream-foreground hover:bg-cream/90"
          onClick={() =>
            onSave({
              title: draft.title,
              title_ko: draft.title_ko,
              synopsis: draft.synopsis,
              stars: draft.stars,
              episodes: draft.episodes,
              status: draft.status,
              order_index: draft.order_index,
              cover_from: draft.cover_from,
              cover_to: draft.cover_to,
              cover_symbol: draft.cover_symbol,
              cover_image_url: draft.cover_image_url?.trim() ? draft.cover_image_url.trim() : null,
              free: draft.free,
              moods: moods.split(",").map((m) => m.trim()).filter(Boolean),
            })
          }
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Enregistrer
        </Button>
      </div>
    </div>
  );
}
