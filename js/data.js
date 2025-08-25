// Configuration et données du jeu

// Variables globales du jeu
window.score = 0;
window.totalScoreEarned = 0; // Score total généré depuis le début (incluant ce qui a été dépensé)
window.scoreText = null;
window.alien = null;
window.scorePerSecond = 0;
window.scorePerSecondText = null;
window.clickPower = 1;

// Définition des fermes
const farms = [
    {
        id: 'basic',
        name: '🛸 Sonde Alien',
        baseProduction: 1,
        baseCost: 10,
        description: 'Sonde de base qui collecte 1 point/sec',
        count: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    },
    {
        id: 'advanced',
        name: '👽 Colonie Alien',
        baseProduction: 5,
        baseCost: 100,
        description: 'Colonie qui produit 5 points/sec',
        count: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    },
    {
        id: 'factory',
        name: '🏭 Usine Spatiale',
        baseProduction: 20,
        baseCost: 1000,
        description: 'Usine automatisée: 20 points/sec',
        count: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    },
    {
        id: 'mothership',
        name: '🚁 Vaisseau-Mère',
        baseProduction: 100,
        baseCost: 10000,
        description: 'Vaisseau colossal: 100 points/sec',
        count: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    },
    {
        id: 'empire',
        name: '🌌 Empire Cosmic',
        baseProduction: 500,
        baseCost: 100000,
        description: 'Empire entier: 500 points/sec',
        count: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    }
];

// Définition des outils de clic
const tools = [
    {
        id: 'cursor',
        name: '👆 Doigt Alien',
        basePower: 1,
        baseCost: 50,
        description: 'Améliore le clic: +1 point/clic',
        level: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    },
    {
        id: 'hand',
        name: '✋ Main Alien',
        basePower: 5,
        baseCost: 500,
        description: 'Main puissante: +5 points/clic',
        level: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    },
    {
        id: 'tentacle',
        name: '🐙 Tentacules',
        basePower: 25,
        baseCost: 5000,
        description: 'Tentacules multiples: +25 points/clic',
        level: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    },
    {
        id: 'telekinesis',
        name: '🧠 Télékinésie',
        basePower: 100,
        baseCost: 50000,
        description: 'Pouvoir mental: +100 points/clic',
        level: 0,
        multiplier: 1,
        upgrades: {
            level10: false,
            level25: false,
            level50: false
        }
    }
];
