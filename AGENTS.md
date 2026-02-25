# AGENTS

Consignes pour les agents (humains ou automatisés) travaillant sur ce dépôt `alien-clicker`.

## 1) Objectif du projet

- Créer un jeu **clicker** sur le thème des aliens.
- Utiliser **Phaser.js** comme moteur principal.
- Avancer par petites itérations jouables et stables.

## 2) Règle de commit (obligatoire)

- À chaque modification effectuée dans le dépôt, terminer par un commit qui inclut toutes les modifications.
- Le message de commit doit commencer par l'un des préfixes suivants selon le type de changement :
  - `:sparkles: <message>` — nouvelle fonctionnalité
  - `:bug: <message>` — correction de bug
  - `:art: <message>` — amélioration de code / mise en forme

Exemple :

```bash
git add -A
git commit -m ":sparkles: ajouter système de click principal"
git push
```

## 3) Portée attendue des changements

- Faire des changements **ciblés** : pas de refactor global non demandé.
- Ne pas casser les APIs/fichiers existants sans nécessité claire.
- Respecter l'architecture actuelle (fichiers `js/*.js` spécialisés par domaine).
- Utiliser des assets **placeholder** si des assets finaux ne sont pas disponibles.

## 4) Architecture de référence

Le projet est organisé avec un point d'entrée et des modules dédiés :

- `main.js` : démarrage global.
- `js/game.js` : boucle/état de jeu.
- `js/ui.js` : affichage UI, boutons, compteurs.
- `js/data.js` : constantes et données de gameplay.
- `js/upgrades.js`, `js/tools.js`, `js/farms.js` : progression.
- `js/drops.js`, `js/wormhole.js`, `js/background.js` : événements/effets.
- `js/save.js` : sauvegarde/chargement.
- `js/utils.js` : helpers partagés.

## 5) Convention de développement

- Privilégier du JavaScript lisible, simple et explicite.
- Éviter les dépendances externes inutiles.
- Garder des noms de variables/fonctions cohérents avec le domaine (`click`, `credits`, `alien`, etc.).
- Ajouter des commentaires **uniquement** si la logique n'est pas évidente.

## 6) Stratégie d'ajout de features (clicker)

Implémenter progressivement, dans cet ordre de priorité :

1. Clic principal (gain de ressource).
2. Compteur visible et feedback visuel minimal.
3. Upgrades simples (augmentation du gain par clic).
4. Production passive (fermes/outils).
5. Sauvegarde/chargement stable.
6. Événements spéciaux (drops, wormhole).

Chaque étape doit rester jouable avant de passer à la suivante.

## 7) Checklist avant commit

- Le jeu se lance sans erreur console bloquante.
- Les imports/scripts référencés existent bien.
- Les nouvelles mécaniques sont testées manuellement en jeu.
- Les fichiers modifiés sont limités au besoin de la tâche.
- Le `README.md` est mis à jour si comportement utilisateur modifié.

## 8) Documentation et suivi

- Documenter les nouvelles mécaniques dans `README.md`.
- En cas de TODO technique, laisser une note claire et actionnable.
- En cas de bug connu non résolu, lister brièvement cause, impact et piste.

## 9) Notes finales

- Si plusieurs types de changements sont présents, choisir le préfixe de commit qui reflète le changement principal.
- Le commit doit inclure *toutes* les modifications effectuées dans la tâche en cours.
- L'objectif est de garder un historique Git lisible, homogène et exploitable.

