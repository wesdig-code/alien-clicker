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
`galaxySystems` → `galaxyPlanets`, déblocage progressif des systèmes/planètes, voyage (`travelToPlanet`), multiplicateurs de clic/fermes par planète, cap de récolte (`planetHarvested`) et récompense de recherche à l'épuisement.

### **farms.js** - Fermes (production passive)
Achat de fermes, coût/production courants, recalcul de l'Entropie/seconde (`updateScorePerSecond`).

### **tools.js** - Outils (puissance de clic)
Achat d'outils, coût courant, recalcul de la puissance de clic. `updateClickPower()` est la **seule source de vérité** de `clickPower` : elle le recalcule intégralement, en intégrant les bonus additifs des autres systèmes via `getFlatClickBonus()` (prestige, drops temporaires, collection). Toute écriture directe sur `clickPower` ailleurs serait écrasée au recalcul suivant.

### **upgrades.js** - Améliorations ×2
Boutons d'amélioration et achat des multiplicateurs (×2) sur fermes et outils.

### **laboratory.js** - Laboratoire
Arbre de recherche avec prérequis ; chaque recherche est **chronométrée** (une seule `activeResearch` à la fois, `startAt`/`endAt`) et accorde un bonus permanent, payée en points de recherche. La durée dépend du coût du nœud (15 ms par point d'Entropie, bornée entre 30 s et 5 min) et survit à un rechargement.

### **drops.js** - Drops & Collection
Drops aléatoires et gestion de la collection d'items permanents (`collectedItems`, `itemLevels`).

### **ui.js** - Interface Utilisateur
Navigation entre onglets (`switchTab`), effets visuels de clic, mise à jour des panneaux de stats.

### **save.js** - Sauvegarde/Chargement
`serializeGameState()` (instantané de l'état), `saveGame()` (export en fichier JSON), `loadGame()` / `applyLoadedGameData()` (import), et `autoSaveGame()` / `startAutoSave()` (sauvegarde automatique dans `localStorage` toutes les 15 s et à la fermeture). Contient aussi `resetRunState({ keepPrestige })`, réinitialisation unifiée partagée par la nouvelle partie et le prestige. Format en version `1.4` ; les sauvegardes `1.3` restent chargeables.

### **background.js** - Fond décoratif
Émojis flottants d'arrière-plan (activables/désactivables).

### **wormhole.js** - Prestige
Boucle de prestige : conversion de l'Entropie en **Stardust** et améliorations permanentes. Seule l'entropie non encore convertie compte (`totalScoreEarned - totalScoreConverted`), et traverser un wormhole rend les planètes de nouveau exploitables.

### **welcome.js** - Écran d'accueil
Écran d'accueil, séquence d'intro tapée à la machine, puis appel de `initGame()` (le jeu ne démarre pas automatiquement).

### **game.js** - Zone de clic et boucle de jeu
Zone de clic (`createAlienClickArea`, `triggerAlienClick`), boucle de production passive basée sur le temps réellement écoulé (résistante au throttling des onglets en arrière-plan), et les trois niveaux de rafraîchissement : `updateHUD()` (léger, à chaque tick), `updateDisplay()` (HUD + accessibilité des boutons + carte si son onglet est actif), `refreshShop()` / `refreshGalaxy()` (reconstruction, uniquement sur événement). Le HUD est en HTML.

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

## 🎮 Fonctionnalités

- **🛸 Fermes Aliens** - Production automatique de points
- **🔧 Outils de Clic** - Amélioration de la puissance de clic
- **⚡ Système d'Améliorations** - Multiplicateurs de production (×2, ×4, ×8)
- **🧪 Laboratoire** - Arbre de recherche avec prérequis, recherches chronométrées et bonus permanents
- **🗺️ Carte Galactique** - Voyage entre planètes avec coûts et multiplicateurs d'Entropie
- **☀️ Systèmes Solaires** - Plusieurs systèmes, chacun avec plusieurs planètes à explorer
- **📊 Récolte Planétaire** - Chaque planète a un maximum d'Entropie récoltable avec barre de progression
- **🎓 Points de Recherche** - Épuiser une planète donne +1 point à dépenser dans le laboratoire
- **🌌 Wormhole (Prestige)** - Conversion de l'Entropie en Stardust et améliorations permanentes
- **🏆 Collection & Drops** - Items permanents obtenus via des drops aléatoires
- **👽 Écran d'accueil & Intro** - Nouvelle partie / chargement, séquence d'introduction
- **🎯 Achat en Gros** - Options d'achat x1, x10, x25
- **💾 Sauvegarde** - Automatique dans le navigateur (toutes les 15 s), plus export/import JSON en fichier
- **⏳ Progression Hors-Ligne** - L'Entropie continue d'être produite hors du jeu (plafonnée à 8 h)
- **📱 Interface Responsive** - Design adaptatif
- **🎨 Effets Visuels** - Animations, feedback et émojis d'arrière-plan (activables/désactivables)

