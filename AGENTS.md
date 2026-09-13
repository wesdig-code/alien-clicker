# AGENTS

## Commandes et vérification

- Depuis la racine : `npm install`, puis `npm run dev` (BrowserSync, `http://localhost:3000`). `npm run dev:open` ouvre le navigateur ; `npm run dev:host` permet le test mobile via l'URL External affichée.
- Le live reload surveille `index.html`, `style.css`, `main.js` et `js/**/*.js`, mais pas `assets/`.
- `npm test` utilise `node --test`, sans installation de dépendances ; filtre ciblé : `npm test -- --test-name-pattern="import"`. `tests/helpers/game.cjs` charge les scripts dans l'ordre de `index.html` dans un contexte partagé ; seul le rendu est neutralisé.
- Aucun build, lint, formatter ou typecheck configuré. Les tests ne couvrent pas le DOM : lancer une partie depuis l'accueil, vérifier la console et exercer la mécanique touchée, au clavier et en petite largeur si l'interface change. Un clic sur l'intro permet de l'abréger.
- Si l'état persistant change, vérifier l'export JSON, le rechargement de page puis l'import ; tester aussi « Continuer », la nouvelle partie et le prestige selon le changement.
- `.github/workflows/static.yml` exécute `npm test` sous Node.js 24, puis déploie la racine sur GitHub Pages lors d'un push sur `master` ou d'un lancement manuel, sans installation ni build.

## Architecture réelle

- JavaScript vanilla, rendu DOM, sans moteur ni bundler ni modules ES. La consigne Phaser de `.github/copilot-instructions.md` est obsolète. `README.md` détaille les systèmes ; `CLAUDE.md` fournit du contexte complémentaire, à recouper avec le code.
- `index.html` fixe l'ordre des scripts et utilise des handlers inline : préserver les fonctions globales et charger tout nouveau script après ses dépendances, avant ses consommateurs.
- L'état est partagé via `window` ; `farms` et `tools` sont des `const` globales dans `js/data.js`, pas des propriétés de `window`.
- `window.collectedItems` et `window.itemLevels` référencent les objets de `js/drops.js` : les modifier en place au chargement/reset, sans les réassigner, sinon les drops continuent à lire l'ancien état.
- Le jeu attend une action depuis l'accueil. `launchGameSession()` (`js/welcome.js`) appelle `initializeGame()`, qui lance `initGame()` (`main.js`, synchrone et idempotente), puis l'autosave. Charger l'état avant ce lancement : `startAutoSave()` écrit immédiatement.

## Invariants de gameplay

- Créditer les gains via `addScore()` (`js/utils.js`) pour maintenir `score` et `totalScoreEarned` ensemble. Pour la récolte, appliquer d'abord `applyPlanetHarvestCap()` ; `addScore()` seul ne limite pas le gain à la capacité planétaire.
- `triggerAlienClick()` (`js/game.js`) est commun au clic manuel, au clavier et à l'auto-clicker du prestige : y conserver les multiplicateurs temporaires, le plafond de récolte et les drops. Il accepte un appel sans coordonnées.
- `updateClickPower()` (`js/tools.js`) recalcule entièrement la puissance : brancher les bonus additifs sur `getFlatClickBonus()`, sinon ils seront écrasés au prochain achat/voyage/recherche.
- Les getters `getCollection*()` de `js/drops.js` centralisent les multiplicateurs, coûts et délais. `reapplyCollectionBonuses()` recalcule les multiplicateurs fermes/outils depuis les paliers achetés et la collection : ne pas multiplier de nouveau les valeurs chargées.
- Dans `js/game.js`, `updateHUD()` est léger ; `updateDisplay()` actualise les boutons et les onglets carte/prestige seulement s'ils sont actifs. Garder `refreshShop()` événementiel ; la carte conserve ses nœuds et ne les reconstruit qu'au changement de système, pour préserver le focus.
- La production passive utilise le temps réellement écoulé (`Date.now()`, plafond de 60 s par tick), pas un gain fixe par intervalle : préserver ce comportement pour les onglets en arrière-plan.
- Les boutiques fermes/outils partagent `creerLigneBoutique()` et `majLigneBoutique()` dans `js/utils.js` ; modifier ces helpers pour les changements communs.

## Sauvegarde et réinitialisation

- Tout nouvel état persistant doit être traité dans `serializeGameState()`, `normalizeGameData()`, `applyLoadedGameData()` et `resetRunState({ keepPrestige })` de `js/save.js`. La normalisation valide et complète l'état sans mutation ; ne rien appliquer avant son succès.
- Avec `keepPrestige: true`, conserver Stardust, améliorations de prestige, collection/niveaux et compteurs `totalScoreEarned`/`totalScoreConverted`. Les recherches (y compris celle en cours), points de recherche et récoltes/récompenses planétaires sont remis à zéro ; les bonus de collection sont réappliqués.
- Import et reset effacent les effets temporaires et resynchronisent l'horloge du tick. L'import en cours de partie reconstruit les boutiques puis sauvegarde immédiatement.
- Format actuel `1.4`, avec valeurs par défaut pour les sauvegardes `1.3`. Autosave dans `localStorage['alienClickerSave']` toutes les 15 s et à la fermeture. `lastSeenAt` pilote les gains hors ligne sur les 8 dernières heures au maximum, plafonnés par la planète ; scinder la production à la fin d'une recherche échue.
- Le prestige convertit seulement `totalScoreEarned - totalScoreConverted` : conserver ce suivi pour éviter de convertir deux fois la même entropie.

## Conventions du dépôt

- Interface et documentation en français ; conserver les identifiants existants, qui mêlent français et anglais.
- Mettre à jour `README.md` lorsque le comportement utilisateur change.
- Terminer chaque tâche modifiant le dépôt par un commit incluant toutes les modifications de la tâche. Préfixe selon le changement principal : `:sparkles:` (fonctionnalité), `:bug:` (correction), `:art:` (amélioration de code / mise en forme).

