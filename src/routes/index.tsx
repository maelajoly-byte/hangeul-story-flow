import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, AlertTriangle, Wrench, Eye, Gift, Quote, ImageIcon, MessageSquareText, Languages } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apprendre le coréen intermédiaire en lisant — K·Intermédiaire" },
      { name: "description", content: "Passez du B1 au B2 en coréen sans cours ni listes de vocabulaire : lisez des histoires imagées en Hangeul, diapo par diapo, à votre rythme. Première histoire offerte." },
      { name: "keywords", content: "apprendre le coréen, coréen intermédiaire, lire en coréen, B1 B2 coréen, méthode coréen, hangeul, histoires coréennes, K-pop apprendre coréen" },
      { property: "og:title", content: "Apprendre le coréen intermédiaire en lisant — K·Intermédiaire" },
      { property: "og:description", content: "Des histoires illustrées en coréen pour vraiment progresser après l'alphabet. Votre première histoire est offerte." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* NOTEBOOK BANNER */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-14 md:pt-20">
            {/* The notebook */}
            <div className="relative mx-auto max-w-5xl">
              {/* Leather strap decoration */}
              <div aria-hidden className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-24 rounded-b-lg bg-[color:var(--gold)]/70 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]" />
              <div
                className="relative rounded-[1.25rem] border-2 border-[color:var(--gold)]/60 notebook-shadow overflow-hidden"
                style={{ background: "linear-gradient(180deg, oklch(0.97 0.02 82) 0%, oklch(0.94 0.03 78) 100%)" }}
              >
                {/* Central binding */}
                <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-[color:var(--gold)]/40 shadow-[0_0_18px_rgba(139,94,60,0.35)] hidden md:block" />
                <div aria-hidden className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-[7px] w-[2px] hidden md:flex flex-col justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="block h-2 w-[6px] rounded-full bg-[color:var(--gold)]/70" />
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left page — Hangeul + French */}
                  <div className="relative p-8 md:p-12 paper-grain">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] mb-6 font-hand text-lg normal-case tracking-normal">
                      — citation —
                    </div>
                    <div className="font-hand-kr text-[5.5rem] md:text-[7rem] leading-[0.95] text-foreground select-none">
                      우화등선
                    </div>
                    <p className="mt-8 font-hand text-2xl md:text-3xl leading-snug text-foreground/85 max-w-md">
                      « Quitte ta chrysalide<br/> et envole-toi comme<br/> un être céleste. »
                    </p>
                    <div className="mt-6 h-px w-24 bg-[color:var(--gold)]/60" />
                  </div>

                  {/* Right page — Hanja */}
                  <div className="relative p-8 md:p-12 paper-grain border-t md:border-t-0 md:border-l border-[color:var(--gold)]/40">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] mb-6 font-hand text-lg normal-case tracking-normal text-right">
                      漢字 · hanja
                    </div>
                    <div className="flex md:justify-end">
                      <div className="font-korean text-[6rem] md:text-[9rem] leading-[0.9] text-foreground/90 [writing-mode:vertical-rl] tracking-[0.15em]">
                        羽化登仙
                      </div>
                    </div>
                    <p className="mt-8 md:text-right font-hand text-xl text-muted-foreground max-w-xs md:ml-auto">
                      un proverbe pour se souvenir<br/> pourquoi on apprend.
                    </p>
                  </div>
                </div>
              </div>
              {/* Notebook shadow */}
              <div aria-hidden className="absolute -inset-x-8 -bottom-6 h-10 rounded-full bg-[color:var(--foreground)]/15 blur-2xl -z-10" />
            </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 pt-16 pb-20 md:pt-20 md:pb-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[color:var(--gold)] mb-6">
            <span className="h-px w-8 bg-[color:var(--gold)]" /> Méthode pour niveau intermédiaire · B1 / B2 <span className="h-px w-8 bg-[color:var(--gold)]" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">
            Enfin comprendre le coréen.{" "}
            <span className="text-muted-foreground italic font-hand text-4xl md:text-6xl">
              En 15 min par jour, grâce à des histoires illustrées que vous n'aurez pas envie de lâcher.
            </span>
          </h1>
          <p className="mt-8 text-lg text-foreground/75 max-w-2xl mx-auto leading-relaxed">
            Vous connaissez l'alphabet, vous écoutez de la K-pop, vous regardez vos dramas avec
            les sous-titres — mais lire un vrai texte coréen vous épuise au bout de trois lignes.
            K·Intermédiaire vous fait progresser sans cours, sans liste de vocabulaire, et sans
            dictionnaire.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-full">
              <Link to="/series/$id" params={{ id: "ghost-of-the-past" }}>
                <Sparkles className="h-4 w-4 mr-2" />
                Lire ma première histoire — gratuit
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-[color:var(--gold)]/60 text-foreground hover:bg-[color:var(--gold)]/10">
              <a href="#methode">Comment ça marche <ArrowRight className="h-4 w-4 ml-2" /></a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Aucune carte requise · Lecture imagée · B1 → B2 · Tous les registres
          </p>
        </div>
      </section>

      {/* PROBLÈME */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Le problème
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Vous êtes bloqué·e entre « débutant » et « natif » — et personne ne fait rien pour vous.
          </h2>
          <div className="mt-8 space-y-5 text-lg text-cream/85 leading-relaxed">
            <p>
              Vous avez appris le Hangeul en une après-midi. Vous connaissez 안녕하세요, 사랑해, 감사합니다.
              Vous suivez à peu près une chanson de BTS sous-titrée. Et après ?
            </p>
            <p>
              Vous ouvrez les news coréennes : c'est du chinois.
              Vous lancez un manhwa : vous décrochez aux onomatopées.
              Vous regardez une interview : si vous quittez les sous-titres une seconde, vous êtes perdu·e.
              Vous essayez des manuels « intermédiaires » : ils sont soit pour vrais débutants, soit pour quasi-natifs.
            </p>
            <p className="font-display text-2xl text-cream italic">
              Le marché est saturé de contenu pour débutants. Pour le niveau intermédiaire, il n'y a rien.
            </p>
          </div>
        </div>
      </section>

      {/* MÉCANISME DU PROBLÈME */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Pourquoi vous n'avancez pas
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Ce n'est pas un manque de travail. C'est une mauvaise méthode.
          </h2>
          <div className="mt-8 space-y-5 text-lg text-cream/85 leading-relaxed">
            <p>
              Apprendre 150 mots par semaine, copier des chansons, réviser des fiches de grammaire
              décontextualisées — vous l'avez fait, et vous avez oublié 80% trois mois plus tard.
              Normal : un mot sans contexte, sans histoire, sans émotion ne s'ancre nulle part.
            </p>
            <p>
              Les vraies langues s'apprennent comme un enfant apprend la sienne : en comprenant le
              <em> sens global</em> grâce au contexte, puis en zoomant sur ce qui résiste. C'est ainsi
              que des millions de gens ont appris l'anglais — en regardant des séries, en lisant des
              fanfictions, en jouant à des jeux. Sans jamais ouvrir un manuel.
            </p>
            <p>
              Pour le coréen, ce contenu « entre les deux » n'existait pas.{" "}
              <strong className="text-cream">Jusqu'ici.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* MÉCANISME SOLUTION */}
      <section id="methode" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">La méthode</div>
          <h2 className="font-display text-4xl md:text-5xl text-balance max-w-3xl">
            Lire des histoires imagées en coréen, diapo par diapo, à votre rythme.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Pas de cours, pas de fiches, pas de devoirs. Vous lisez une histoire qui vous tient en
            haleine, et la langue s'imprime presque toute seule — exactement comme on apprend une
            langue dans la vraie vie.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <Feature
              icon={<ImageIcon className="h-5 w-5" />}
              kicker="01 — Le contexte"
              title="Les images racontent tout"
              body="Une diapo = une scène. Même si trois mots vous échappent, vous comprenez ce qui se passe. Comme dans un manga ou un drama : votre cerveau remplit les trous."
            />
            <Feature
              icon={<MessageSquareText className="h-5 w-5" />}
              kicker="02 — Le coréen pur"
              title="Que du Hangeul. Jamais de romanisation."
              body="Pas de « annyeonghaseyo » pour vous rassurer. Votre œil s'habitue à la vraie langue, exactement comme un lecteur coréen la voit."
            />
            <Feature
              icon={<Languages className="h-5 w-5" />}
              kicker="03 — La traduction à la demande"
              title="Un clic, une explication"
              body="Mot, particule ou terminaison qui résiste ? Vous cliquez. La traduction apparaît avec le rôle, la nuance et le registre. Puis vous repartez dans l'histoire."
            />
          </div>
          <div className="mt-12 rounded-xl border border-border bg-card p-6 md:p-8">
            <p className="text-sm uppercase tracking-wider text-accent mb-2">Bonus inclus</p>
            <p className="text-cream/90">
              Chaque histoire mélange <strong>tous les registres</strong> du coréen : narration
              littéraire, dialogues polis (-요), familier (반말), formel (-ㅂ니다), pensées intérieures,
              SMS, panneaux, cris. Vous travaillez en parallèle ce qu'aucune méthode classique ne
              vous donne en moins de deux ans.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTION / OFFRE / CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4" /> Votre première histoire est offerte
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-balance max-w-3xl">
            Commencez maintenant, sans payer.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Neuf histoires de l'autrice <em>Sara Eonni</em> — courtes, addictives, de difficulté
            croissante. La première vous est offerte intégralement, pour que vous puissiez tester
            la méthode sur du vrai contenu, pas une démo.
          </p>

          <div className="mt-10 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div className="rounded-2xl border border-accent/30 bg-card/60 p-6 md:p-8 glow-accent">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-accent">Histoire offerte · n°1</span>
                <span className="text-xs text-muted-foreground">Niveau B1 — 8 épisodes</span>
              </div>
              <h3 className="font-display text-3xl">Ghost of the Past</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Une lycéenne reçoit un message d'un numéro qu'elle a effacé il y a dix ans.
                Mystère, drame, surnaturel léger — idéal pour démarrer.
              </p>
              <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 h-12">
                <Link to="/series/$id" params={{ id: "ghost-of-the-past" }}>
                  Lire le premier épisode <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Lecture immédiate · aucune carte bancaire · aucune inscription pour commencer
              </p>
            </div>

            <div className="space-y-4">
              <Bullet>Lecture diapo par diapo, à votre rythme — pas de vidéo à mettre en pause</Bullet>
              <Bullet>Hangeul pur, jamais de romanisation</Bullet>
              <Bullet>Traduction d'un mot ou d'une particule en un clic</Bullet>
              <Bullet>Travaille tous les registres : poli, familier, écrit, oral</Bullet>
              <Bullet>Vous progressez sans même vous en rendre compte</Bullet>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-4 text-sm">
            <Link to="/tarifs" className="rounded-xl border border-border bg-card/40 p-5 hover:border-accent/60 transition flex items-center justify-between">
              <span>
                <strong className="font-display text-base">Voir les formules</strong>
                <br />
                <span className="text-muted-foreground">Découverte gratuite, Pass série, Pack fondateur</span>
              </span>
              <ArrowRight className="h-4 w-4 text-accent" />
            </Link>
            <Link to="/pourquoi" className="rounded-xl border border-border bg-card/40 p-5 hover:border-accent/60 transition flex items-center justify-between">
              <span>
                <strong className="font-display text-base">Pourquoi ce projet existe</strong>
                <br />
                <span className="text-muted-foreground">L'histoire derrière K·Intermédiaire</span>
              </span>
              <ArrowRight className="h-4 w-4 text-accent" />
            </Link>
          </div>
        </div>
      </section>

      {/* CITATION / CTA FINAL */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Quote className="h-6 w-6 text-accent mx-auto mb-4" />
          <p className="font-display text-2xl md:text-3xl text-balance leading-snug">
            « J'ai appris l'anglais sans m'en rendre compte, juste en lisant des histoires sur mon
            téléphone. Aujourd'hui, je veux offrir la même chose à tous les passionné·es de
            culture coréenne qui galèrent comme moi. »
          </p>
          <p className="text-sm text-muted-foreground mt-4">— Fondatrice de K·Intermédiaire</p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-cream text-cream-foreground hover:bg-cream/90 h-12 px-6">
              <Link to="/series/$id" params={{ id: "ghost-of-the-past" }}>
                <Eye className="h-4 w-4 mr-2" /> Lire ma première histoire — gratuit
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-muted-foreground flex flex-wrap gap-3 justify-between">
          <span>© K·Intermédiaire — 중급 한국어</span>
          <span className="flex gap-4">
            <Link to="/library" className="hover:text-foreground">Bibliothèque</Link>
            <Link to="/tarifs" className="hover:text-foreground">Tarifs</Link>
            <Link to="/pourquoi" className="hover:text-foreground">Pourquoi ce projet</Link>
          </span>
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-cream/85">
      <span className="text-accent mt-1">✦</span>
      <span>{children}</span>
    </div>
  );
}