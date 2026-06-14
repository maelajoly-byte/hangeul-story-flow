import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — K·Intermédiaire, méthode coréen B1/B2" },
      { name: "description", content: "Découverte gratuite avec la première histoire, Pass série à 9 €, Pack fondateur à 49 € pour les 9 séries et celles à venir. Sans abonnement." },
      { property: "og:title", content: "Tarifs — K·Intermédiaire" },
      { property: "og:description", content: "Trois formules simples, sans abonnement piégeur." },
      { property: "og:url", content: "/tarifs" },
    ],
    links: [{ rel: "canonical", href: "/tarifs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Faut-il payer pour commencer ?", acceptedAnswer: { "@type": "Answer", text: "Non. La première histoire (Ghost of the Past) est intégralement gratuite, sans carte bancaire." } },
            { "@type": "Question", name: "Y a-t-il un abonnement ?", acceptedAnswer: { "@type": "Answer", text: "Non. Vous achetez les séries à l'unité ou le Pack fondateur en une seule fois. Aucun prélèvement récurrent." } },
            { "@type": "Question", name: "Le niveau intermédiaire, c'est quel niveau exactement ?", acceptedAnswer: { "@type": "Answer", text: "B1 à B2. Vous savez lire le Hangeul, vous connaissez les bases de la grammaire, mais lire un vrai texte coréen vous épuise vite." } },
            { "@type": "Question", name: "Y a-t-il de la romanisation ?", acceptedAnswer: { "@type": "Answer", text: "Non, jamais. Les textes sont en Hangeul pur. Les traductions s'affichent en français à la demande." } },
          ],
        }),
      },
    ],
  }),
  component: Tarifs,
});

const PLANS = [
  {
    name: "Découverte",
    price: "0 €",
    desc: "Pour tester sans engagement",
    features: [
      "Histoire n°1 « Ghost of the Past » intégralement",
      "Lecture diapo par diapo en Hangeul pur",
      "1 diapo annotée offerte (analyse mot par mot)",
      "Carnet de vocabulaire personnel",
    ],
    cta: "Commencer gratuitement",
    to: "/series/$id" as const,
    params: { id: "ghost-of-the-past" },
  },
  {
    name: "Pass série",
    price: "9 €",
    desc: "Une histoire de votre choix, à vie",
    features: [
      "1 série complète parmi les 9",
      "Traductions Premium illimitées (mots, particules, nuances, registres)",
      "Demandes d'explication personnalisées",
      "Carnet de vocabulaire et progression",
    ],
    cta: "Choisir une série",
    to: "/library" as const,
    highlight: true,
  },
  {
    name: "Pack fondateur",
    price: "49 €",
    desc: "Pour celles et ceux qui veulent tout, tout de suite",
    features: [
      "Les 9 séries + toutes les futures",
      "File de questions prioritaire",
      "Badge « fondateur·rice »",
      "Soutien direct au projet",
    ],
    cta: "Devenir fondateur·rice",
    to: "/library" as const,
  },
];

function Tarifs() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">Tarifs</div>
          <h1 className="font-display text-5xl md:text-6xl text-balance">
            Pas d'abonnement. Vous payez une fois, vous gardez à vie.
          </h1>
          <p className="text-muted-foreground mt-5 text-lg">
            La première histoire est gratuite — pour de vrai. Ensuite, vous débloquez les
            suivantes une par une ou tout en un coup.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-7 flex flex-col ${p.highlight ? "border-accent/60 bg-accent/5 glow-accent" : "border-border bg-card"}`}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.name}</div>
              <div className="font-display text-5xl mt-2">{p.price}</div>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-cream/85 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-7 h-11 ${p.highlight ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-cream text-cream-foreground hover:bg-cream/90"}`}
              >
                <Link to={p.to} params={p.params as any}>
                  {p.cta} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-24 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">Questions fréquentes</h2>
          <div className="mt-8 space-y-6">
            <Faq q="Faut-il payer pour commencer ?" a="Non. La première histoire (Ghost of the Past) est intégralement gratuite, sans carte bancaire ni création de compte." />
            <Faq q="Y a-t-il un abonnement mensuel ?" a="Non. Vous achetez les séries à l'unité ou le Pack fondateur en une seule fois. Aucun prélèvement récurrent." />
            <Faq q="C'est pour quel niveau exactement ?" a="B1 à B2. Vous savez lire le Hangeul, vous connaissez les bases, mais lire un vrai texte coréen vous épuise au bout de trois lignes." />
            <Faq q="Il y a de la romanisation ?" a="Non, jamais. Tout est en Hangeul pur — votre œil s'habitue à la vraie langue. Les traductions s'affichent en français, à la demande, mot par mot." />
            <Faq q="Combien de temps pour une histoire ?" a="Chaque histoire fait entre 7 et 14 épisodes. Comptez 15 à 30 min par épisode si vous prenez le temps de cliquer sur les mots qui résistent." />
            <Faq q="Qu'est-ce qui arrive après la première histoire ?" a="Vous débloquez les suivantes dans l'ordre — la difficulté monte progressivement. C'est pensé comme une vraie progression, pas un buffet où on se perd." />
          </div>
        </section>
      </main>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-border/60 pb-5">
      <h3 className="font-display text-lg text-cream">{q}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{a}</p>
    </div>
  );
}