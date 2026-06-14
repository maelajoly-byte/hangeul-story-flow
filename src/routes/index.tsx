import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { SERIES } from "@/lib/data";
import { Sparkles, BookOpen, MousePointerClick, Mail, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "K·Intermédiaire — Lire le coréen sans dictionnaire" },
      { name: "description", content: "Lecture immersive assistée. 9 séries originales pour passer du B1 au B2 sans ouvrir un dictionnaire toutes les deux phrases." },
      { property: "og:title", content: "K·Intermédiaire" },
      { property: "og:description", content: "Lisez de vraies histoires en coréen, diapo par diapo." },
    ],
  }),
  component: Index,
});

function Index() {
  const ghost = SERIES[0];
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-32 md:pb-32 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-6">
              <span className="h-px w-8 bg-accent" /> Lecture immersive assistée · B1 / B2
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">
              Lisez de vraies histoires en coréen.{" "}
              <span className="text-muted-foreground italic">Sans ouvrir un dictionnaire toutes les deux phrases.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Vous connaissez le Hangeul, mais les webtoons natifs vous épuisent. K·Intermédiaire vous fait
              avancer <em>diapo par diapo</em>, et révèle la grammaire seulement quand vous le demandez —
              d'un simple clic.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-cream text-cream-foreground hover:bg-cream/90 h-12 px-6">
                <Link to="/series/$id" params={{ id: "ghost-of-the-past" }}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Commencer « Ghost of the Past » gratuitement
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12">
                <Link to="/library">Voir les 9 séries <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Aucune carte requise · Premium d'essai activé pour la démo
            </p>
          </div>

          {/* Mock slide preview */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/60 shadow-2xl"
                 style={{ background: `linear-gradient(160deg, ${ghost.cover.from}, ${ghost.cover.to})` }}>
              <span className="absolute inset-0 grid place-items-center font-korean text-[14rem] text-white/10 leading-none">유</span>
              <div className="absolute top-6 left-6 right-6 bg-black p-4 rounded-md text-cream">
                <p className="font-korean text-2xl leading-relaxed">
                  새벽<span className="underline decoration-dotted underline-offset-4 decoration-accent">에</span>{" "}
                  문자<span className="underline decoration-dotted underline-offset-4 decoration-accent">가</span>{" "}
                  <span className="underline decoration-dotted underline-offset-4 decoration-amber-400">왔다</span>.
                </p>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-popover/95 backdrop-blur rounded-md p-3 border border-accent/30">
                <div className="flex items-baseline justify-between">
                  <span className="font-korean text-lg">에</span>
                  <span className="text-[10px] uppercase tracking-wider text-accent">particule</span>
                </div>
                <p className="text-xs text-cream/80 mt-1">à (temps statique) — précise un point dans le temps.</p>
              </div>
            </div>
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-accent/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* MECHANIC */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-3 gap-10">
          <Feature
            icon={<BookOpen className="h-5 w-5" />}
            kicker="01 — Lecture"
            title="Diapo par diapo"
            body="Une seule image à la fois, comme un roman visuel. Aucune grille, aucun mur de pages. L'immersion sans la fatigue."
          />
          <Feature
            icon={<MousePointerClick className="h-5 w-5" />}
            kicker="02 — Compréhension"
            title="Cliquez, comprenez, repartez"
            body="Un mot ou une particule vous bloque ? Cliquez. Vous obtenez le rôle, la nuance, le registre, sans quitter la diapo."
          />
          <Feature
            icon={<Mail className="h-5 w-5" />}
            kicker="03 — Demande"
            title="Une question ? On y répond."
            body="Soumettez votre passage. Vous recevez une diapo annotée par e-mail, sous 24 à 48 h."
          />
        </div>
      </section>

      {/* ROADMAP */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">Feuille de route</div>
            <h2 className="font-display text-4xl md:text-5xl text-balance">9 séries originales, une progression pensée.</h2>
          </div>
          <Button asChild variant="ghost"><Link to="/library">Tout voir <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERIES.map((s) => (
            <li key={s.id} className="rounded-lg border border-border bg-card/60 p-4 flex items-center gap-4">
              <span className="font-display text-2xl text-muted-foreground w-6 tabular-nums">{s.order}</span>
              <span className="w-10 h-10 rounded-md grid place-items-center font-korean text-xl text-cream"
                    style={{ background: `linear-gradient(160deg, ${s.cover.from}, ${s.cover.to})` }}>{s.cover.symbol}</span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-base truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground truncate">{s.moods.join(" · ")}</div>
              </div>
              {s.free && <span className="text-[10px] text-gold uppercase tracking-wider">Gratuit</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* PRICING */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">Modèle freemium</div>
          <h2 className="font-display text-4xl md:text-5xl text-balance">Lisez la première série gratuitement, débloquez le reste à votre rythme.</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-4 text-left">
            <PriceCard title="Découverte" price="0 €" features={["Ghost of the Past en entier", "Mode lecture diapo par diapo", "1 diapo annotée offerte"]} />
            <PriceCard title="Pass série" price="9 €" features={["1 série au choix", "Analyses Premium illimitées", "Carnet de vocabulaire"]} highlight />
            <PriceCard title="Founder Pack" price="49 €" features={["Les 9 séries + à venir", "File de questions prioritaire", "Badge fondateur"]} />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-muted-foreground flex justify-between">
          <span>© K·Intermédiaire — 중급 한국어</span>
          <span>Lecture immersive assistée</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, kicker, title, body }: { icon: React.ReactNode; kicker: string; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
        <span className="w-8 h-8 rounded-full bg-accent/15 text-accent grid place-items-center">{icon}</span>
        {kicker}
      </div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function PriceCard({ title, price, features, highlight }: { title: string; price: string; features: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 ${highlight ? "border-accent/60 bg-accent/5 glow-accent" : "border-border bg-card"}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="font-display text-4xl mt-2">{price}</div>
      <ul className="mt-5 space-y-2 text-sm text-cream/85">
        {features.map((f) => <li key={f} className="flex gap-2"><span className="text-accent">·</span>{f}</li>)}
      </ul>
    </div>
  );
}
