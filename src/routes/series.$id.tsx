import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EPISODES, getSeries, type Series } from "@/lib/data";
import { useUser } from "@/lib/user-store";
import { PaywallModal } from "@/components/paywall-modal";
import { AlertTriangle, BookOpen, Lock, Play, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/series/$id")({
  head: ({ params }) => {
    const s = getSeries(params.id);
    return {
      meta: [
        { title: s ? `${s.title} — K·Intermédiaire` : "Série — K·Intermédiaire" },
        { name: "description", content: s?.synopsis ?? "Série K·Intermédiaire" },
        { property: "og:title", content: s?.title ?? "K·Intermédiaire" },
        { property: "og:description", content: s?.synopsis ?? "" },
      ],
    };
  },
  loader: ({ params }) => {
    const s = getSeries(params.id);
    if (!s) throw notFound();
    return { series: s };
  },
  component: SeriesPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><p className="text-muted-foreground">Série introuvable.</p></div>
  ),
});

function SeriesPage() {
  const { series: s } = Route.useLoaderData() as { series: Series };
  const { user } = useUser();
  const navigate = useNavigate();
  const [paywall, setPaywall] = useState(false);
  const unlocked = s.free || user.unlockedSeries.includes(s.id);
  const progress = user.progress[s.id];
  const parts = EPISODES[s.id] ?? [];

  const partsByEpisode = useMemo(() => {
    const map = new Map<number, typeof parts>();
    for (const p of parts) {
      const arr = map.get(p.episode) ?? [];
      arr.push(p);
      map.set(p.episode, arr);
    }
    return map;
  }, [parts]);

  const openPart = (ep: number, part: number) => {
    if (!unlocked) { setPaywall(true); return; }
    navigate({ to: "/read/$seriesId/$episode/$part", params: { seriesId: s.id, episode: String(ep), part: String(part) } });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <header className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(160deg, ${s.cover.from}, ${s.cover.to})`, opacity: 0.35 }} />
          <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-[1fr_360px] gap-12 items-start">
            <div>
              <Link to="/library" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">← Bibliothèque</Link>
              <div className="font-korean text-2xl text-foreground/70 mt-6">{s.titleKo}</div>
              <h1 className="font-display text-5xl md:text-6xl mt-1 text-balance">{s.title}</h1>
              <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed">{s.synopsis}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {s.moods.map((m) => <Badge key={m} variant="secondary">{m}</Badge>)}
                <Badge variant="outline" className="border-accent/50 text-accent inline-flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < s.stars ? "fill-accent text-accent" : "text-accent/30"}`} />
                  ))}
                </Badge>
              </div>
              <div className="mt-8 flex gap-3">
                <Button size="lg" className="bg-cream text-cream-foreground hover:bg-cream/90" onClick={() => openPart(progress?.episode ?? 1, progress?.part ?? 1)}>
                  {unlocked ? (<><Play className="h-4 w-4 mr-2" />{progress ? "Reprendre" : "Commencer"}</>) : (<><Lock className="h-4 w-4 mr-2" />Débloquer cette série</>)}
                </Button>
              </div>
            </div>
            <aside className="space-y-5">
              {s.warnings && (
                <Box icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Avertissements">
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {s.warnings.map((w) => <li key={w}>· {w}</li>)}
                  </ul>
                </Box>
              )}
              {s.tips && (
                <Box icon={<BookOpen className="h-4 w-4 text-accent" />} title="Conseils de lecture">
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {s.tips.map((t) => <li key={t}>· {t}</li>)}
                  </ul>
                </Box>
              )}
              {progress && (
                <Box icon={<Sparkles className="h-4 w-4 text-gold" />} title="Votre progression">
                  <p className="text-sm">Épisode {progress.episode} · Partie {progress.part}</p>
                  <Progress value={((progress.episode - 1) / s.episodes) * 100} className="mt-2 h-1" />
                </Box>
              )}
            </aside>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-display text-3xl mb-1">Épisodes</h2>
          <p className="text-sm text-muted-foreground mb-8">Chaque épisode est découpé en parties courtes (≈ 6–10 diapos) pour une session ciblée de 5 à 8 minutes.</p>
          <Accordion type="multiple" className="border border-border/60 rounded-lg overflow-hidden bg-card/50 divide-y divide-border/60">
            {Array.from({ length: s.episodes }).map((_, i) => {
              const epNum = i + 1;
              const epParts = partsByEpisode.get(epNum) ?? [];
              const hasContent = epParts.length > 0;
              return (
                <AccordionItem key={epNum} value={`ep-${epNum}`} className="border-0">
                  <AccordionTrigger className="px-5 py-4 hover:bg-secondary/40 hover:no-underline">
                    <div className="flex items-center gap-5 w-full text-left">
                      <span className="font-display text-2xl text-muted-foreground tabular-nums w-14">Ép. {epNum}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-lg">
                          {hasContent ? `Épisode ${epNum}` : `Épisode ${epNum}`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {hasContent ? `${epParts.length} partie${epParts.length > 1 ? "s" : ""}` : "Bientôt disponible"}
                        </div>
                      </div>
                      {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4">
                    {hasContent ? (
                      <ul className="divide-y divide-border/40 border border-border/40 rounded-md overflow-hidden">
                        {epParts.map((p) => (
                          <li key={`${p.episode}-${p.part}`}>
                            <button
                              onClick={() => openPart(p.episode, p.part)}
                              className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-secondary/40 transition-colors"
                            >
                              <span className="font-display text-sm text-muted-foreground tabular-nums w-16">Partie {p.part}/{p.totalParts}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm">{p.title}</div>
                                <div className="text-[11px] text-muted-foreground">{p.slides.length} diapos</div>
                              </div>
                              <Play className="h-4 w-4 text-accent" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Cet épisode arrivera prochainement.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      </main>
      <PaywallModal open={paywall} onOpenChange={setPaywall} seriesId={s.id} reason="series" />
    </div>
  );
}

function Box({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card/70 p-4">
      <div className="flex items-center gap-2 mb-2"><span>{icon}</span><h3 className="text-sm font-medium">{title}</h3></div>
      {children}
    </div>
  );
}