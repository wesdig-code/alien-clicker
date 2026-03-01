# Alien Clicker

Un jeu de type 'idle-game' sur le thème des aliens, développé avec Phaser.js.

## 📋 Structure du projet

```
alien-clicker/
├── index.html              # Point d'entrée HTML
├── style.css               # Styles CSS
├── main.js                 # Point d'entrée principal
└── js/                    # Modules JavaScript
    ├── data.js            # Configuration et données du jeu
    ├── utils.js           # Fonctions utilitaires
    ├── farms.js           # Gestion des fermes
    ├── tools.js           # Gestion des outils
    ├── upgrades.js        # Système d'améliorations
    ├── ui.js              # Interface utilisateur et effets
    ├── save.js            # Système de sauvegarde/chargement
    └── game.js            # Logique principale Phaser
```

## 🔧 Description des Modules

### **data.js** - Configuration et Données
- Configuration Phaser (`config`)
- Variables globales du jeu (`score`, `clickPower`, etc.)
- Définition des fermes (`farms` array)
- Définition des outils (`tools` array)

### **utils.js** - Fonctions Utilitaires
- `formatNumber()` - Formatage des nombres (K, M, B)
- `calculateBulkCost()` - Calcul des coûts en gros
- `initializeUpgradeProperties()` - Initialisation des propriétés
- `debugMultipliers()` - Debug des multiplicateurs

### **farms.js** - Gestion des Fermes
- `initializeFarms()` - Initialisation de l'affichage des fermes
- `getCurrentCost()` - Calcul du coût actuel d'une ferme
- `getCurrentProduction()` - Calcul de la production actuelle
- `buyFarm()` - Achat de fermes
- `updateScorePerSecond()` - Mise à jour production/seconde
- `updateFarmsDisplay()` - Mise à jour de l'affichage

### **tools.js** - Gestion des Outils
- `initializeTools()` - Initialisation de l'affichage des outils
- `getToolCost()` - Calcul du coût d'un outil
- `buyTool()` - Achat d'outils
- `updateClickPower()` - Mise à jour puissance de clic
- `updateToolsDisplay()` - Mise à jour de l'affichage

### **upgrades.js** - Système d'Améliorations
- `createUpgradeButton()` - Création des boutons d'amélioration
- `getUpgradeCost()` - Calcul du coût des améliorations
- `buyUpgrade()` - Achat d'améliorations (×2 multiplicateur)

### **ui.js** - Interface Utilisateur
- `switchTab()` - Navigation entre onglets
- `createClickEffect()` - Effets visuels de clic
- `updateSaveStats()` - Mise à jour statistiques sauvegarde

### **save.js** - Sauvegarde/Chargement
- `saveGame()` - Exportation JSON du jeu
- `loadGame()` - Importation JSON du jeu
- `showLoadSuccess()` / `showLoadError()` - Feedback visuel

### **game.js** - Logique Principale Phaser
- `preload()` - Préchargement Phaser
- `create()` - Initialisation du jeu
- `createAlienClickArea()` - Zone de clic alien
- `update()` - Boucle de mise à jour
- `updateDisplay()` - Mise à jour affichage global

### **main.js** - Point d'Entrée
- Initialisation de l'instance Phaser
- Point de démarrage du jeu

## 🔄 Ordre de Chargement

Les scripts sont chargés dans l'ordre suivant dans `index.html` :

1. **data.js** - Données de base
2. **utils.js** - Utilitaires
3. **farms.js** - Logique fermes
4. **tools.js** - Logique outils
5. **upgrades.js** - Système améliorations
6. **ui.js** - Interface utilisateur
7. **save.js** - Sauvegarde
8. **game.js** - Logique Phaser
9. **main.js** - Initialisation

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
- **🧪 Laboratoire** - Arbre de recherche avec prérequis et bonus permanents
- **🗺️ Carte Galactique** - Voyage entre planètes avec coûts et multiplicateurs d'Entropie
- **🎯 Achat en Gros** - Options d'achat x1, x10, x25
- **💾 Sauvegarde/Chargement** - Export/Import JSON
- **📱 Interface Responsive** - Design adaptatif
- **🎨 Effets Visuels** - Animations et feedback

