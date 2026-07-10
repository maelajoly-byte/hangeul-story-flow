import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

export const Route = createFileRoute("/pourquoi")({
  head: () => ({
    meta: [
      { title: "Pourquoi K·Intermédiaire existe — L'histoire du projet" },
      { name: "description", content: "Comment une étudiante en licence de coréen, fan de BTS, a appris l'anglais par accident en lisant des fanfictions — et veut aujourd'hui offrir la même méthode aux apprenants intermédiaires de coréen." },
      { property: "og:title", content: "Pourquoi K·Intermédiaire existe" },
      { property: "og:description", content: "L'histoire derrière la plateforme : combler le vide pour les apprenants intermédiaires en coréen." },
      { property: "og:url", content: "/pourquoi" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/pourquoi" }],
  }),
  component: Pourquoi,
});

function Pourquoi() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
          <Heart className="h-4 w-4" /> Pourquoi ce projet
        </div>
        <h1 className="font-display text-5xl md:text-6xl leading-tight text-balance">
          J'ai appris l'anglais par accident. Je veux que vous appreniez le coréen pareil.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground italic">
          L'histoire derrière K·Intermédiaire, racontée par sa fondatrice.
        </p>

        <article className="prose-custom mt-12 space-y-6 text-foreground/90 text-lg leading-relaxed">
          <h2 className="font-display text-3xl text-foreground mt-10">Une enfant qui détestait les langues</h2>
          <p>
            En primaire, tout le monde aimait l'anglais sauf moi. Je ne comprenais pas pourquoi on
            n'avait pas une langue universelle — on est censés être l'espèce la plus intelligente
            de la planète, et deux personnes de pays opposés n'arrivent pas à se parler.
          </p>
          <p>
            En 6ème, ma prof était souvent absente, j'ai décroché, et je n'ai plus jamais
            rattrapé. Pendant toute ma scolarité, j'ai été nulle en langues. Et je le détestais.
          </p>

          <h2 className="font-display text-3xl text-foreground mt-10">Puis sont venus les animés. Puis BTS.</h2>
          <p>
            Au lycée, j'ai découvert les animés. Au début en VF, puis mes ami·es m'ont poussée
            à passer en VO. J'ai commencé à aimer le japonais. Un an plus tard, une amie m'a
            fait découvrir BTS, et je suis tombée amoureuse du coréen — sa sonorité, son
            écriture, sa culture.
          </p>
          <p>
            J'ai voulu faire des études dans cette langue. Je suis entrée en licence de coréen
            en 2020, dans une fac sans anglais — parce que je restais nulle.
          </p>

          <h2 className="font-display text-3xl text-foreground mt-10">Septembre 2020 : un jeu BTS change tout</h2>
          <p>
            BTS sort <em>BTS Universe Story</em>, un jeu où des fans créent des mini-histoires
            illustrées. Je jouais sur la version française — les histoires fr étaient médiocres.
            Un jour, je tombe sur une histoire en anglais d'une autrice : <strong>Sara Eonni</strong>.
          </p>
          <p>
            Elle était courte, intrigante, et même si c'était en anglais, le vocabulaire restait
            simple et les images donnaient le contexte. J'ai compris le sens global. J'ai lu un
            épisode. Puis un autre. Puis sa deuxième histoire, en passant une heure par épisode
            tellement je voulais tout comprendre. Puis la troisième. La quatrième.
          </p>
          <p>
            À la cinquième, l'histoire était assez connue pour qu'une traduction française
            existe. Je l'ai activée sur un épisode — la vibe était différente. J'ai gardé
            l'anglais.
          </p>
          <p className="font-display text-2xl italic text-accent">
            J'avais appris l'anglais sans essayer. Sans liste de vocabulaire. Sans le vouloir.
          </p>

          <h2 className="font-display text-3xl text-foreground mt-10">En coréen, l'école ne m'a pas aidée</h2>
          <p>
            En 2ème année de licence, on devait apprendre 150 nouveaux mots par semaine. Excessif —
            et inutile : si tu ne sais pas construire une phrase, le vocabulaire ne sert à rien.
            Je m'en sortais en grammaire et compréhension. L'expression restait mon point faible,
            malgré les dramas en VO et les chansons de BTS recopiées.
          </p>
          <p>
            J'ai cherché à lire en coréen. Pour débutants, on trouve mille choses — mais ce sont
            des comptines, pas une langue qu'on utilise au quotidien. Pour le niveau au-dessus :
            les news. Mais les news sont du coréen d'expert, je n'y comprenais rien. Les manhwa ?
            Trop d'onomatopées, trop de slang.
          </p>
          <p className="font-display text-2xl italic text-accent">
            Le palier entre « débutant » et « natif » n'existait nulle part.
          </p>

          <h2 className="font-display text-3xl text-foreground mt-10">Les vacances qui ont tout débloqué</h2>
          <p>
            En 3ème année, pendant les vacances avant les exams, j'ai alterné lecture sur BTS
            Universe Story et dramas en VO. Mes notes en expression ont pris 2 points. Mon
            cerveau <em>évoluait</em>. Je travaillais tous les registres en même temps —
            narratif, poli, familier — et j'apprenais des expressions vraiment utiles, du genre
            « rater son bus ».
          </p>
          <p>
            Puis l'application a fermé. J'ai perdu mon outil. Je ne me suis jamais sentie
            légitime pour chercher un job en coréen. Trois ans ont passé.
          </p>

          <h2 className="font-display text-3xl text-foreground mt-10">2026 : BTS revient, je décide d'agir</h2>
          <p>
            BTS est rentré de l'armée. J'ai regardé une de leurs interviews : tous les sept à la
            fois, chaotique. Je ne peux pas décrocher des sous-titres sans rien comprendre, et
            même avec eux ça va trop vite. J'en ai eu marre.
          </p>
          <p>
            Heureusement, les fans avaient enregistré les histoires de <strong>Sara Eonni</strong> avant
            la fermeture du jeu — elles sont toutes sur YouTube. Mon idée : récupérer les
            images, les traduire en coréen, et les présenter en diapos pour que chacun·e lise
            à son rythme. Sans avoir à rembobiner une vidéo de 5 secondes pour un seul mot.
          </p>

          <h2 className="font-display text-3xl text-foreground mt-10">Ce que vous trouverez ici</h2>
          <p>
            Neuf histoires de Sara Eonni, dans leur ordre de création — donc de difficulté
            croissante. Vous débloquez la suivante après avoir fini la précédente. Pas de mur
            de contenu, pas de paradoxe du choix. La première est offerte.
          </p>
          <p className="font-display text-2xl text-foreground italic border-l-2 border-accent pl-6 mt-10">
            Ces histoires m'ont appris l'anglais. Elles vont vous apprendre le coréen.
          </p>

          <p className="text-sm text-muted-foreground mt-6">
            <strong>Crédits&nbsp;:</strong> les récits et illustrations sont l'œuvre originale de
            l'autrice Sara Eonni, initialement publiés sur BTS Universe Story. K·Intermédiaire
            propose une adaptation pédagogique en coréen, dans une logique de partage et
            d'apprentissage.
          </p>
        </article>

        <div className="mt-16 text-center">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6">
            <Link to="/series/$id" params={{ id: "ghost-of-the-past" }}>
              Lire la première histoire — gratuit <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}