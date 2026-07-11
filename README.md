# Alien Clicker

Un jeu de type 'idle-game' sur le thème des aliens, développé avec Phaser.js.

## 📋 Structure du projet

```
alien-clicker/
├── index.html              # Point d'entrée HTML (ordre de chargement des scripts)
├── style.css               # Styles CSS
├── main.js                 # Bootstrap Phaser (initGame)
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
    └── game.js            # Scène Phaser (zone de clic + tick d'income)
```

## 🔧 Description des Modules

Le jeu est en **JavaScript vanilla, sans bundler ni système de modules** : chaque fichier de `js/` est un `<script>` global qui s'appuie sur les globals définis par les fichiers précédents. Phaser sert surtout de zone de clic et de tick d'income (1 s) ; l'essentiel du rendu est du DOM direct.

### **data.js** - Configuration et Données
Variables globales du jeu (`score`, `clickPower`, `scorePerSecond`, `stardust`…), définitions des fermes (`farms`) et des outils (`tools`).

### **utils.js** - Fonctions Utilitaires
`formatNumber()` (K, M, B), `calculateBulkCost()` (achat en gros), initialisation des propriétés de multiplicateurs.

### **galaxy.js** - Carte Galactique
`galaxySystems` → `galaxyPlanets`, déblocage progressif des systèmes/planètes, voyage (`travelToPlanet`), multiplicateurs de clic/fermes par planète, cap de récolte (`planetHarvested`) et récompense de recherche à l'épuisement.

### **farms.js** - Fermes (production passive)
Achat de fermes, coût/production courants, recalcul de l'Entropie/seconde (`updateScorePerSecond`).

### **tools.js** - Outils (puissance de clic)
Achat d'outils, coût courant, recalcul de la puissance de clic (`updateClickPower`).

### **upgrades.js** - Améliorations ×2
Boutons d'amélioration et achat des multiplicateurs (×2) sur fermes et outils.

### **laboratory.js** - Laboratoire
Arbre de recherche avec prérequis ; chaque recherche est **chronométrée** (une seule `activeResearch` à la fois, `startAt`/`endAt`) et accorde un bonus permanent, payée en points de recherche.

### **drops.js** - Drops & Collection
Drops aléatoires et gestion de la collection d'items permanents (`collectedItems`, `itemLevels`).

### **ui.js** - Interface Utilisateur
Navigation entre onglets (`switchTab`), effets visuels de clic, mise à jour des panneaux de stats.

### **save.js** - Sauvegarde/Chargement
`saveGame()` (export JSON), `loadGame()` / `applyLoadedGameData()` (import), feedback visuel. Aucun localStorage : la sauvegarde est un fichier JSON téléchargé.

### **background.js** - Fond décoratif
Émojis flottants d'arrière-plan (activables/désactivables).

### **wormhole.js** - Prestige
Boucle de prestige : conversion de l'Entropie en **Stardust** et améliorations permanentes.

### **welcome.js** - Écran d'accueil
Écran d'accueil, séquence d'intro tapée à la machine, puis appel de `initGame()` (le jeu ne démarre pas automatiquement).

### **game.js** - Scène Phaser
Zone de clic alien (`createAlienClickArea`) et tick d'income d'1 seconde (`generateAutomaticScore`) ; le HUD réel est en HTML.

### **main.js** - Bootstrap
Construit l'instance Phaser paresseusement via `initGame()`.

## 🔄 Ordre de Chargement

Les scripts sont chargés dans cet ordre dans `index.html` (**source de vérité** — chaque fichier dépend des globals des précédents) :

`data → utils → galaxy → farms → tools → upgrades → laboratory → drops → ui → save → background → wormhole → welcome → game → main`

## 🛠️ Technologies

- **[Phaser.js 3.x](https://phaser.io/)** - Moteur de jeu
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
- **💾 Sauvegarde/Chargement** - Export/Import JSON (fichier, sans localStorage)
- **📱 Interface Responsive** - Design adaptatif
- **🎨 Effets Visuels** - Animations, feedback et émojis d'arrière-plan (activables/désactivables)

