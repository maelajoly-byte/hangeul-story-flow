# Tableau d'import toujours visible et modifiable

## Ce que vous voyez aujourd'hui

Le tableau existe bien, mais il n'apparaît **que juste après avoir choisi un fichier Word**. Dès que la fenêtre est refermée (ou la page rechargée), le tableau disparaît : il ne reste que « Choisir un fichier » et « Supprimer le script importé ». Impossible donc de corriger une correspondance déjà importée sans tout réimporter.

## Ce qui va changer

1. **Le tableau s'affiche toujours.** À l'ouverture de « Importer le script coréen », le tableau est construit à partir des diapos de la partie (numéro, type de bulle, nom du personnage, texte coréen), même sans fichier. Vous pouvez donc corriger directement une correspondance déjà en place.
2. **Choisir un fichier remplace le contenu du tableau** par le script lu dans le document, comme aujourd'hui, avec l'aperçu et les compteurs.
3. **Édition complète conservée** : modifier le texte, le type de bulle, le nom du personnage, ajouter une ligne vide, supprimer une ligne, déplacer une ligne vers le haut/bas.
4. **Renommage des boutons pour éviter la confusion** : « Enregistrer les modifications » (au lieu de « Confirmer l'import ») quand aucun nouveau fichier n'a été chargé, « Confirmer l'import » sinon.
5. **Bandeau d'écart** (« il manque X texte », « X texte(s) en trop ») affiché dès qu'il y a un décalage avec le nombre de diapos, avec l'écriture bloquée tant que le compte ne correspond pas.
6. Les diapos qui contiennent déjà du texte restent signalées par un point orange.

## Détails techniques

Fichier concerné : `src/routes/creator.$seriesId.$episode.$part.tsx`.

- Nouvel effet : quand `importOpen` passe à `true` et que `parsed` est vide, initialiser `parsed` depuis `slides` (`text: hangeul`, `bubble_type` existant — `none` ramené à `bpp-narrator` pour l'affichage, `speaker_name`).
- Le bloc de tableau (`parsed.length > 0 && ...`) devient inconditionnel dès qu'il y a des diapos ; le message vide n'apparaît que si la partie n'a aucune diapo.
- `onPickFile` continue d'écraser `parsed` avec le résultat de `parseScript`.
- Ajout d'un état `fromFile: boolean` pour choisir le libellé du bouton de validation ; `runImport` reste inchangé (écrit `hangeul`, `bubble_type`, `bubble_position: "center"`, `speaker_name` uniquement pour BP·Normal).
- « Supprimer le script importé » vide aussi `parsed` puis le réinitialise depuis les diapos vidées.
