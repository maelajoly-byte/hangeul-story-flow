import type { UserState } from "./user-store";

export type MedalCategory = "progression" | "communaute" | "curiosite" | "assiduite";

export interface Medal {
  id: string;
  name: string;
  description: string;
  category: MedalCategory;
  /** Returns true if the user currently qualifies. */
  check: (u: UserState) => boolean;
}

function completedEp(u: UserState, seriesId: string, ep: number) {
  return (u.completedEpisodes?.[seriesId] ?? []).includes(ep);
}
function seriesFinished(u: UserState, seriesId: string, total: number) {
  const done = u.completedEpisodes?.[seriesId] ?? [];
  return done.length >= total;
}

export const MEDALS: Medal[] = [
  // Progression
  { id: "first-chapter", name: "Premier chapitre", description: "Terminer l'épisode 1 de la toute première histoire.", category: "progression",
    check: (u) => completedEp(u, "ghost-of-the-past", 1) },
  { id: "half-first", name: "À mi-chemin", description: "Valider la moitié de la première histoire.", category: "progression",
    check: (u) => (u.completedEpisodes?.["ghost-of-the-past"]?.length ?? 0) >= 8 },
  { id: "first-series-done", name: "La fin du début", description: "Terminer entièrement la première histoire.", category: "progression",
    check: (u) => seriesFinished(u, "ghost-of-the-past", 16) },
  { id: "great-traveler", name: "Grand voyageur", description: "Arriver au bout de la deuxième histoire.", category: "progression",
    check: (u) => seriesFinished(u, "reality", 10) },
  { id: "collector", name: "Le Collectionneur", description: "Terminer toutes les histoires disponibles.", category: "progression",
    check: (u) => seriesFinished(u, "ghost-of-the-past", 16) && seriesFinished(u, "reality", 10) },
  // Slides caps
  ...[5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000].map((n): Medal => ({
    id: `cap-${n}`, name: `Le Cap des ${n / 1000}k`, description: `Atteindre ${n.toLocaleString("fr-FR")} slides lues.`,
    category: "progression", check: (u) => (u.slidesRead ?? 0) >= n,
  })),
  // Curiosité
  { id: "curious", name: "Curieux", description: "Cliquer sur son premier mot ou particule pour en vérifier le sens.", category: "curiosite",
    check: (u) => u.checkedElements.length >= 1 },
  { id: "shadow-memory", name: "Mémoire de l'ombre", description: "Recliquer sur un mot déjà consulté dans un épisode précédent.", category: "curiosite",
    check: (u) => (u.reclickedElements ?? 0) >= 1 },
  { id: "archivist", name: "Archiviste", description: "Consulter son historique de mots checkés depuis son profil.", category: "curiosite",
    check: (u) => !!u.visitedArchive },
  // Communauté
  { id: "detective", name: "Détective en herbe", description: "Poster sa première théorie sous une slide.", category: "communaute",
    check: (u) => u.comments.some((c) => c.kind === "theorie") },
  { id: "involved", name: "Impliqué", description: "Poster un commentaire dans 5 épisodes différents.", category: "communaute",
    check: (u) => new Set(u.comments.map((c) => `${c.series}-${c.episode}`)).size >= 5 },
  { id: "team-spirit", name: "L'Esprit d'équipe", description: "Répondre au commentaire d'un autre lecteur pour l'aider.", category: "communaute",
    check: (u) => u.comments.some((c) => c.kind === "entraide") },
  // Assiduité
  { id: "early-bird", name: "Lève-tôt", description: "Lire un épisode avant 7 h du matin.", category: "assiduite",
    check: (u) => (u.earlyMorningRead ?? 0) >= 1 },
  { id: "marathoner", name: "Marathonien", description: "Terminer une partie d'une traite sans quitter l'application.", category: "assiduite",
    check: (u) => !!u.marathonDone },
  { id: "faithful", name: "Fidèle au poste", description: "Revenir terminer une histoire commencée il y a plus de 2 semaines.", category: "assiduite",
    check: () => false },
  { id: "picky", name: "Le Pointilleux", description: "Recommencer un épisode déjà terminé pour le relire.", category: "assiduite",
    check: (u) => (u.replays ?? 0) >= 1 },
];

export const MEDAL_CATEGORIES: { id: MedalCategory; label: string }[] = [
  { id: "progression", label: "Progression" },
  { id: "communaute", label: "Communauté & Analyse" },
  { id: "curiosite", label: "Curiosité" },
  { id: "assiduite", label: "Assiduité" },
];

export function getMedal(id: string) {
  return MEDALS.find((m) => m.id === id);
}

/** Evaluate all medals and return ids newly earned since previous set. */
export function evaluateNewMedals(user: UserState, previouslyEarned: string[]): string[] {
  const prev = new Set(previouslyEarned);
  return MEDALS.filter((m) => !prev.has(m.id) && m.check(user)).map((m) => m.id);
}