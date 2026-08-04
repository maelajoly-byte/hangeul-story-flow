# Bibliothèque éditable en mode créateur

## Objectif
En mode créateur, la bibliothèque ressemble à celle du lecteur, mais chaque élément d'une histoire est modifiable : couverture, titre (FR + coréen), note sur 5 (demi-étoiles), synopsis, nombre d'épisodes, thématiques (Mystère, Drame…), statut et accès gratuit. Le bouton de la carte devient « Modifier » et mène à la page des parties.

## Ce qui change pour toi

1. **Les histoires deviennent modifiables** (aujourd'hui elles sont figées dans le code). Elles passent en base de données, avec les 9 histoires actuelles reprises telles quelles — rien ne se perd.
2. **Nouvelle bibliothèque créateur** (`/creator`) : même grille de cartes que côté lecteur, aucune histoire verrouillée, un bouton « Modifier » par carte qui ouvre la liste des épisodes/parties.
3. **Édition d'une histoire** : un crayon sur la carte ouvre un panneau latéral avec :
   - Titre français et titre coréen
   - Synopsis
   - Note sur 5 étoiles, demi-étoiles autorisées (0,5 / 1 / 1,5 …)
   - Nombre d'épisodes
   - Thématiques : ajout/suppression d'étiquettes libres
   - Statut (Disponible / En cours / Bientôt) et case « offerte »
   - Couverture : champ URL d'image (pré-rempli avec `https://media.sebastien-rebiere.fr/`) ; si vide, on garde le dégradé + idéogramme actuels, également réglables
   - Boutons « Enregistrer » / « Annuler »
4. **Côté lecteur** : la bibliothèque, la page d'une histoire et le plan du site affichent automatiquement tes modifications. Les demi-étoiles s'affichent correctement (étoile à moitié remplie).
5. Tu peux aussi **ajouter une nouvelle histoire** depuis la bibliothèque créateur (carte « + Nouvelle histoire »).

## Détails techniques

- Migration : table `public.series` (`id` texte = slug, `order_index`, `title`, `title_ko`, `synopsis`, `stars` numeric(2,1), `episodes`, `status`, `moods` text[], `cover_from`, `cover_to`, `cover_symbol`, `cover_image_url`, `free`, `warnings` text[], `tips` text[], `created_at`, `updated_at` + trigger).
  - GRANT `SELECT` à `anon` et `authenticated`, `ALL` à `service_role` ; RLS activée : lecture publique, écriture réservée à `is_admin()`.
  - INSERT littéraux des 9 histoires actuelles dans la même migration.
- `src/lib/series.ts` : lectures (`listSeries`, `getSeries`) et écritures admin (`upsertSeries`, `createSeries`) via le client Supabase, avec le type `Series` réutilisé depuis `src/lib/data.ts`.
- `src/lib/data.ts` : `SERIES` conservé uniquement comme repli/typage ; les écrans consomment la requête TanStack Query `["series"]`.
- `src/components/series-card.tsx` : prop `mode?: "reader" | "creator"` — en créateur, jamais verrouillée, bouton « Modifier » vers `/creator/$seriesId`, bouton crayon ouvrant le panneau d'édition. Affichage étoiles refactorisé pour gérer les demi-étoiles.
- Nouveau `src/components/series-editor-sheet.tsx` (formulaire + `Sheet` shadcn), invalidation de `["series"]` après enregistrement pour rafraîchir instantanément.
- `src/routes/creator.index.tsx` réécrit en grille de `SeriesCard mode="creator"` ; `library.tsx`, `series.$id.tsx`, `creator.$seriesId.index.tsx` et `sitemap[.]xml.ts` lisent la base au lieu de la constante.
