// Point d'entrée principal du jeu Alien Clicker
// Ce fichier initialise le jeu et crée l'instance Phaser

// Variable globale pour l'instance Phaser
let game = null;

// Configuration Phaser
const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 580,
    backgroundColor: '#22223b',
    parent: 'game',
    scene: {
        preload,
        create,
        update
    }
};

// Fonction pour initialiser le jeu (appelée depuis welcome.js)
function initGame() {
    if (!game) {
        console.log('Initialisation du jeu Phaser...');
        game = new Phaser.Game(config);
    }
}

// Le jeu ne démarre plus automatiquement - il faut cliquer sur les boutons d'accueil
