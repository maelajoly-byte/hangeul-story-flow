import { Link } from "@tanstack/react-router";
import type { Series } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-store";
import { Lock, Sparkles, Star } from "lucide-react";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Difficulté ${n} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

export function SeriesCard({ s }: { s: Series }) {
  const { user } = useUser();
  const unlocked = s.free || user.unlockedSeries.includes(s.id);
  const statusLabel = s.status === "available" ? "Disponible" : s.status === "in_progress" ? "En cours" : "Bientôt";

  // Locked series: hide cover art, synopsis, moods, level, episodes.
  if (!unlocked) {
    return (
      <article className="group rounded-xl border border-border bg-card/40 overflow-hidden">
        <div className="relative aspect-[3/4] flex flex-col items-center justify-center gap-3 p-6 text-center"
             style={{ background: "linear-gradient(160deg, oklch(0.30 0.03 240), oklch(0.20 0.02 240))" }}>
          <Lock className="h-8 w-8 text-white/70" />
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">Histoire n°{s.order}</div>
          <div className="font-display text-xl text-white/85">À découvrir</div>
          <p className="text-xs text-white/50 max-w-[16ch]">
            Débloquée après la précédente
          </p>
        </div>
        <div className="p-4">
          <Button disabled className="w-full" variant="secondary">
            <Lock className="h-4 w-4 mr-2" /> Verrouillée
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-xl border border-border bg-card/70 overflow-hidden hover:border-accent/50 transition-colors">
      <div className="relative aspect-[3/4]" style={{ background: `linear-gradient(160deg, ${s.cover.from}, ${s.cover.to})` }}>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-korean text-[8rem] text-white/15 leading-none">{s.cover.symbol}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-black/60 text-cream border-0">#{s.order}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`text-[10px] border-cream/30 ${s.status === "available" ? "text-cream" : "text-cream/60"}`}>{statusLabel}</Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="font-korean text-lg text-cream/80">{s.titleKo}</div>
          <h3 className="font-display text-xl text-cream leading-tight">{s.title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{s.synopsis}</p>
        <div className="flex flex-wrap gap-1.5">
          {s.moods.map((m) => <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>)}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Stars n={s.stars} />
          <span>{s.episodes} épisodes</span>
        </div>
        {s.status === "coming_soon" ? (
          <Button disabled className="w-full" variant="secondary">Bientôt disponible</Button>
        ) : (
          <Button asChild className="w-full bg-cream text-cream-foreground hover:bg-cream/90">
            <Link to="/series/$id" params={{ id: s.id }}>
              <Sparkles className="h-4 w-4 mr-2" /> {s.free ? "Commencer" : "Reprendre"}
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}