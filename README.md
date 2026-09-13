# Alien Clicker

Un jeu de type 'idle-game' sur le thème des aliens, en JavaScript vanilla (aucun moteur de jeu, aucun bundler, aucune dépendance runtime).

## 📋 Structure du projet

```
alien-clicker/
├── index.html              # Point d'entrée HTML (ordre de chargement des scripts)
├── style.css               # Styles CSS
├── main.js                 # Point d'entrée du runtime (initGame)
└── js/                    # Modules JavaScript (scripts globaux, sans bundler)
    ├── data.js            # Variables globales + définitions fermes / outils
    ├── utils.js           # Fonctions utilitaires
    ├── galaxy.js          # Carte galactique multi-systèmes
    ├── farms.js           # Production passive (fermes)
    ├── tools.js           # Puissance de clic (outils)
    ├── upgrades.js        # Améliorations ×2
    ├── laboratory.js      # Arbre de recherche (recherches chronométrées)
    ├── drops.js           # Drops aléatoires + collection d'items
    ├── ui.js              # Onglets, effets de clic, panneaux de stats
    ├── save.js            # Sauvegarde/chargement JSON
    ├── background.js      # Émojis flottants décoratifs
    ├── wormhole.js        # Prestige (Entropie → Stardust)
    ├── welcome.js         # Écran d'accueil + intro, appelle initGame()
    └── game.js            # Zone de clic, boucle de jeu et rafraîchissements
```

## 🔧 Description des Modules

Le jeu est en **JavaScript vanilla, sans bundler ni système de modules** : chaque fichier de `js/` est un `<script>` global qui s'appuie sur les globals définis par les fichiers précédents. Tout le rendu est du DOM direct.

### **data.js** - Configuration et Données
Variables globales du jeu (`score`, `clickPower`, `scorePerSecond`, `stardust`…), définitions des fermes (`farms`) et des outils (`tools`).

### **utils.js** - Fonctions Utilitaires
`formatNumber()` (K, M, B), `calculateBulkCost()` (achat en gros), `addScore()` (**seul point d'entrée légitime pour un gain d'Entropie** : crédite `score` et `totalScoreEarned`), et les helpers de rendu partagés par les boutiques fermes/outils (`creerLigneBoutique`, `majLigneBoutique`).

### **galaxy.js** - Carte Galactique
`galaxySystems` → `galaxyPlanets`, déblocage progressif des systèmes/planètes, voyage (`travelToPlanet`) et multiplicateurs de clic/fermes par planète. Les ressources sont **illimitées** : clics, fermes, drops et gains hors ligne continuent à produire, même sur une planète auparavant épuisée. Le total récolté (`planetHarvested`) est conservé dans la sauvegarde.

Les anciens plafonds deviennent des seuils de recherche (`researchThreshold`) : atteindre le seuil donne **+1 point de recherche par planète et par prestige**, sans interrompre la récolte ni empêcher d'y revenir. Les compteurs affichent `∞` pour les ressources ; les barres indiquent uniquement la progression vers le point de recherche. Les sauvegardes `1.3`/`1.4` restent compatibles.

### **farms.js** - Fermes (production passive)
Achat de fermes, coût/production courants, recalcul de l'Entropie/seconde (`updateScorePerSecond`).

### **tools.js** - Outils (puissance de clic)
Achat d'outils, coût courant, recalcul de la puissance de clic. `updateClickPower()` est la **seule source de vérité** de `clickPower` : elle le recalcule intégralement, en intégrant les bonus additifs des autres systèmes via `getFlatClickBonus()` (prestige, drops temporaires, collection). Toute écriture directe sur `clickPower` ailleurs serait écrasée au recalcul suivant.

### **upgrades.js** - Améliorations ×2
Boutons d'amélioration et achat des multiplicateurs (×2) sur fermes et outils.

### **laboratory.js** - Laboratoire
Arbre de recherche avec prérequis ; chaque recherche est **chronométrée** (une seule `activeResearch` à la fois, `startAt`/`endAt`) et accorde un bonus permanent, payée en points de recherche. La durée dépend du coût du nœud (15 ms par point d'Entropie, bornée entre 30 s et 5 min) et survit à un rechargement.

### **drops.js** - Drops & Collection
Drops aléatoires et gestion de la collection d'items permanents (`collectedItems`, `itemLevels`). Les neuf objets appliquent leurs bonus selon leur niveau, conservé au prestige :

- L'Œuf Alien, le Cœur de Cristal et la Clé Dorée améliorent respectivement la puissance de clic, les fermes et les outils.
- Le Fragment d'Étoile améliore le Stardust du prestige et des drops ; l'Orbe Temporel réduit l'intervalle de l'auto-clicker, s'il est débloqué.
- La Puce Quantique réduit le coût des améliorations ×2, de collection et de prestige, mais pas l'achat de fermes/outils ni les recherches.
- L'Éclat Cosmique améliore la chance de drop selon son niveau ; l'Essence du Vide multiplie la production des clics et des fermes.
- La Pierre d'Infinité multiplie les gains des clics, des fermes, de Stardust et la chance de drop ; elle divise aussi les coûts d'amélioration et l'intervalle de l'auto-clicker par son bonus.

Les bonus sont recalculés depuis la collection, sans cumul au rechargement. La chance de drop est plafonnée à 100 %, les coûts à au moins 10 % du prix de base (minimum 1), et l'intervalle auto-click à 100 ms minimum. Les effets temporaires sont effacés lors d'un import, d'une nouvelle partie ou d'un prestige.

### **ui.js** - Interface Utilisateur
Navigation entre onglets (`switchTab`), effets visuels de clic, mise à jour des panneaux de stats.

### **save.js** - Sauvegarde/Chargement
`serializeGameState()` (instantané de l'état), `saveGame()` (export en fichier JSON), `loadGame()` / `applyLoadedGameData()` (import), et `autoSaveGame()` / `startAutoSave()` (sauvegarde automatique dans `localStorage` toutes les 15 s et à la fermeture). Contient aussi `resetRunState({ keepPrestige })`, réinitialisation unifiée partagée par la nouvelle partie et le prestige. Format en version `1.4` ; les sauvegardes `1.3` restent chargeables.

`normalizeGameData()` valide entièrement le fichier avant de modifier la partie. Un import invalide laisse la partie et l'autosave intactes. Un import accepté remet les champs absents à leur valeur par défaut, recalcule les bonus, reconstruit les boutiques et est sauvegardé immédiatement en cours de partie.

Les gains hors ligne portent sur les huit dernières heures au maximum, sans plafond de ressources planétaires. Une recherche achevée pendant l'absence change le taux de production à sa date de fin : les périodes avant et après sont calculées séparément.

### **background.js** - Fond décoratif
Émojis flottants d'arrière-plan (activables/désactivables).

### **wormhole.js** - Prestige
Boucle de prestige : conversion de l'Entropie en **Stardust** et améliorations permanentes. Seule l'entropie non encore convertie compte (`totalScoreEarned - totalScoreConverted`), avec un premier Stardust à **2 500 Entropie convertible**. Traverser un wormhole remet les récoltes à zéro et permet de gagner à nouveau les points de recherche planétaires. Le bouton et les achats de prestige s'actualisent pendant que cet onglet est ouvert.

### **welcome.js** - Écran d'accueil
Écran d'accueil, séquence d'intro tapée à la machine, puis appel de `initGame()` (le jeu ne démarre pas automatiquement).

### **game.js** - Zone de clic et boucle de jeu
Zone de clic (`createAlienClickArea`, `triggerAlienClick`), boucle de production passive basée sur le temps réellement écoulé (résistante au throttling des onglets en arrière-plan), et les niveaux de rafraîchissement : `updateHUD()` (léger, à chaque tick), `updateDisplay()` (HUD + état des boutons + carte/prestige si leur onglet est actif), `refreshShop()` (reconstruction sur événement). `refreshGalaxy()` actualise les cartes existantes et ne les reconstruit qu'au changement de système, pour conserver le focus clavier. Le HUD est en HTML.

### **main.js** - Point d'entrée
`initGame()`, synchrone et idempotente : initialise tout le runtime (zone de clic, fermes, outils, drops, laboratoire, carte, boucle).

## 🔄 Ordre de Chargement

Les scripts sont chargés dans cet ordre dans `index.html` (**source de vérité** — chaque fichier dépend des globals des précédents) :

`data → utils → galaxy → farms → tools → upgrades → laboratory → drops → ui → save → background → wormhole → welcome → game → main`

## 🛠️ Technologies

- **HTML5 & CSS3** - Interface utilisateur responsive
- **JavaScript ES6+** - Logique du jeu
- **JSON** - Système de sauvegarde

## 💻 Développement local (live reload)

Prérequis : **Node.js 18+** (ou version LTS récente)

1. Installer les dépendances :

```bash
npm install
```

2. Lancer le serveur de dev avec rechargement auto :

```bash
npm run dev
```

Le site est servi sur `http://localhost:3000`.
Les changements sur `index.html`, `style.css`, `main.js` et `js/**/*.js` déclenchent un rechargement automatique.

Option :

```bash
npm run dev:open
```

Cette commande ouvre automatiquement le navigateur.

Pour tester sur mobile (même réseau local) :

```bash
npm run dev:host
```

Utilisez ensuite l'URL `External` affichée par BrowserSync sur votre téléphone.

Sur petit écran, le jeu, les effets, les boutiques et la collection s'empilent dans une page défilante. Sur écran intermédiaire, la collection passe sous le jeu pour ne pas le recouvrir.

## Vérification

```bash
npm test
npm test -- --test-name-pattern="import"
```

Les tests utilisent le runner natif de Node.js, sans dépendance supplémentaire. Ils chargent les scripts dans l'ordre de `index.html` et vérifient les bonus, les resets, les imports et la progression hors ligne ; le rendu est neutralisé dans ces tests.

Pour une modification d'interface, compléter avec une partie dans le navigateur : clic et clavier, achats, voyage, export JSON, rechargement puis « Continuer », import valide/invalide et prestige selon la mécanique touchée. Vérifier aussi une petite largeur avec la collection ouverte.

La CI exécute `npm test` sous Node.js 24 avant le déploiement GitHub Pages depuis `master`. Les tests ne nécessitent pas `npm install` ; le site reste déployé directement depuis la racine, sans build.

## 🎮 Fonctionnalités

- **🛸 Fermes Aliens** - Production automatique de points
- **🔧 Outils de Clic** - Amélioration de la puissance de clic
- **⚡ Système d'Améliorations** - Multiplicateurs de production (×2, ×4, ×8)
- **🧪 Laboratoire** - Arbre de recherche avec prérequis, recherches chronométrées et bonus permanents
- **🗺️ Carte Galactique** - Voyage entre planètes avec coûts et multiplicateurs d'Entropie
- **☀️ Systèmes Solaires** - Plusieurs systèmes, chacun avec plusieurs planètes à explorer
- **📊 Récolte Planétaire** - Ressources illimitées sur chaque planète ; la barre suit l'objectif de recherche
- **🎓 Points de Recherche** - Atteindre le seuil d'une planète donne +1 point à dépenser dans le laboratoire, une fois par prestige
- **🌌 Wormhole (Prestige)** - Conversion de l'Entropie en Stardust et améliorations permanentes
- **🏆 Collection & Drops** - Items permanents obtenus via des drops aléatoires
- **👽 Écran d'accueil & Intro** - Nouvelle partie / chargement, séquence d'introduction
- **🎯 Achat en Gros** - Options d'achat x1, x10, x25
- **💾 Sauvegarde** - Automatique dans le navigateur (toutes les 15 s), plus export/import JSON en fichier
- **⏳ Progression Hors-Ligne** - L'Entropie continue d'être produite hors du jeu (plafonnée à 8 h)
- **📱 Interface Responsive** - Design adaptatif
- **🎨 Effets Visuels** - Animations, feedback et émojis d'arrière-plan (activables/désactivables)

