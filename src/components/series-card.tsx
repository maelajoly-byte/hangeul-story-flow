import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getReaderReviews, type Series } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-store";
import { Info, Lock, Sparkles, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function Stars({ n }: { n: number }) {
  return (
    <TooltipProvider delayDuration={100}>
      <span className="inline-flex items-center gap-1" aria-label={`Difficulté ${n} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, n - i));
          return (
            <span key={i} className="relative inline-block h-3.5 w-3.5">
              <Star className="absolute inset-0 h-3.5 w-3.5 text-muted-foreground/40" />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                </span>
              )}
            </span>
          );
        })}
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground/70 hover:text-accent" aria-label="À propos de la note">
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
            La note combine la <strong>difficulté linguistique</strong> (registre, vocabulaire, structures) et l'<strong>ambition narrative</strong> de l'histoire. 1 étoile signifie une entrée en douceur, pensée pour prendre confiance — pas une histoire mineure. Chaque récit a été écrit avec la même exigence.
          </TooltipContent>
        </Tooltip>
      </span>
    </TooltipProvider>
  );
}

export function SeriesCard({ s, creator, onEdit }: { s: Series; creator?: boolean; onEdit?: () => void }) {
  const { user } = useUser();
  const unlocked = creator || s.free || user.unlockedSeries.includes(s.id);
  const statusLabel = s.status === "available" ? "Disponible" : s.status === "in_progress" ? "En cours" : "Bientôt";

  const reviews = useMemo(() => getReaderReviews(s.id), [s.id]);
  const avgStars = reviews.length
    ? Math.round((reviews.reduce((a, r) => a + r.stars, 0) / reviews.length) * 10) / 10
    : null;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (reviews.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, [reviews.length]);
  const current = reviews[idx];

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
        {s.coverImageUrl ? (
          <img src={s.coverImageUrl} alt={`Couverture de ${s.title}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-korean text-[8rem] text-white/15 leading-none">{s.cover.symbol}</span>
          </div>
        )}
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
        {creator ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onEdit}>Éditer la fiche</Button>
            <Button asChild className="bg-cream text-cream-foreground hover:bg-cream/90">
              <Link to="/creator/$seriesId" params={{ seriesId: s.id }}>Modifier</Link>
            </Button>
          </div>
        ) : s.status === "coming_soon" ? (
          <Button disabled className="w-full" variant="secondary">Bientôt disponible</Button>
        ) : (
          <Button asChild className="w-full bg-cream text-cream-foreground hover:bg-cream/90">
            <Link to="/series/$id" params={{ id: s.id }}>
              <Sparkles className="h-4 w-4 mr-2" /> {s.free ? "Commencer" : "Reprendre"}
            </Link>
          </Button>
        )}
        {avgStars !== null && current && (
          <div className="pt-2 border-t border-border/50 space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-0.5" aria-label={`Note des lecteurs ${avgStars} sur 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.round(avgStars) ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
                ))}
              </span>
              <span className="text-muted-foreground tabular-nums">{avgStars.toFixed(1)}</span>
              <span className="text-muted-foreground/70">· {reviews.length} avis</span>
            </div>
            <blockquote className={`text-[11px] text-muted-foreground italic line-clamp-2 ${current.lang === "ko" ? "font-korean not-italic" : ""}`}>
              « {current.body} » <span className="not-italic text-muted-foreground/70">— {current.author}</span>
            </blockquote>
          </div>
        )}
      </div>
    </article>
  );
}