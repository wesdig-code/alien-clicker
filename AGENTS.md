# AGENTS

## Commandes et vérification

- Depuis la racine : `npm install`, puis `npm run dev` (BrowserSync, `http://localhost:3000`). `npm run dev:open` ouvre le navigateur ; `npm run dev:host` permet le test mobile via l'URL External affichée.
- Le live reload surveille `index.html`, `style.css`, `main.js` et `js/**/*.js`, mais pas `assets/`.
- Aucun build, runner de tests, lint ou typecheck configuré. Pour une modification du jeu : lancer une partie depuis l'accueil, vérifier la console et exercer la mécanique touchée. Un clic sur l'intro permet de l'abréger.
- Si l'état persistant change, vérifier export JSON → rechargement de page → import, ainsi que nouvelle partie et prestige selon le changement.
- `.github/workflows/static.yml` déploie directement la racine sur GitHub Pages lors d'un push sur `master` ou d'un lancement manuel, sans installation ni build ni tests.

## Architecture réelle

- JavaScript vanilla, rendu DOM, sans moteur ni bundler ni modules ES. La consigne Phaser de `.github/copilot-instructions.md` est obsolète. `README.md` détaille les systèmes ; `CLAUDE.md` fournit du contexte complémentaire, à recouper avec le code.
- `index.html` fixe l'ordre des scripts et utilise des handlers inline : préserver les fonctions globales et charger tout nouveau script après ses dépendances, avant ses consommateurs.
- L'état est partagé via `window` ; `farms` et `tools` sont des `const` globales dans `js/data.js`, pas des propriétés de `window`.
- Démarrage : `js/welcome.js` → `initializeGame()` → `initGame()` dans `main.js` (synchrone, idempotente) → boucle de `js/game.js`. Le runtime attend une nouvelle partie, un chargement ou « Continuer ».

## Invariants de gameplay

- Créditer les gains via `addScore()` (`js/utils.js`) pour maintenir `score` et `totalScoreEarned` ensemble. Pour la récolte, appliquer d'abord `applyPlanetHarvestCap()` ; `addScore()` seul ne limite pas le gain à la capacité planétaire.
- `updateClickPower()` (`js/tools.js`) recalcule entièrement la puissance : brancher les bonus additifs sur `getFlatClickBonus()`, sinon ils seront écrasés au prochain achat/voyage/recherche.
- Dans `js/game.js`, `updateHUD()` est léger ; `updateDisplay()` actualise aussi les boutons d'achat et reconstruit la carte seulement si son onglet est actif. Garder `refreshShop()` événementiel et conserver cette garde sur la carte.
- La production passive utilise le temps réellement écoulé (`Date.now()`, plafond de 60 s par tick), pas un gain fixe par intervalle : préserver ce comportement pour les onglets en arrière-plan.
- Les boutiques fermes/outils partagent `creerLigneBoutique()` et `majLigneBoutique()` dans `js/utils.js` ; modifier ces helpers pour les changements communs.

## Sauvegarde et réinitialisation

- Tout nouvel état persistant doit être traité dans `serializeGameState()`, `applyLoadedGameData()` et `resetRunState({ keepPrestige })` de `js/save.js`. Le reset est partagé par nouvelle partie et prestige ; préciser ce qui survit au prestige.
- Format actuel `1.4`, avec valeurs par défaut pour les sauvegardes `1.3`. Autosave dans `localStorage['alienClickerSave']` toutes les 15 s et à la fermeture ; `lastSeenAt` pilote les gains hors-ligne plafonnés à 8 h.
- Le prestige convertit seulement `totalScoreEarned - totalScoreConverted` : conserver ce suivi pour éviter de convertir deux fois la même entropie.

## Conventions du dépôt

- Interface et documentation en français ; conserver les identifiants existants, qui mêlent français et anglais.
- Mettre à jour `README.md` lorsque le comportement utilisateur change.
- Terminer chaque tâche modifiant le dépôt par un commit incluant toutes les modifications de la tâche. Préfixe selon le changement principal : `:sparkles:` (fonctionnalité), `:bug:` (correction), `:art:` (amélioration de code / mise en forme).

