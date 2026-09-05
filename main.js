// Point d'entrée principal du jeu Alien Clicker
// Initialisation synchrone du runtime, appelée depuis welcome.js

const LARGEUR_ZONE_JEU = 480;
const HAUTEUR_ZONE_JEU = 520;

let jeuInitialise = false;

function preparerZoneJeu() {
    const gameDiv = document.getElementById('game');
    if (!gameDiv) return;

    // La zone de jeu n'a plus de canvas : on lui donne ses dimensions explicitement
    gameDiv.style.position = 'relative';
    gameDiv.style.width = `${LARGEUR_ZONE_JEU}px`;
    gameDiv.style.height = `${HAUTEUR_ZONE_JEU}px`;
}

// Initialise tout le runtime du jeu. Idempotente : un second appel ne recrée rien.
function initGame() {
    if (jeuInitialise) {
        updateDisplay();
        return;
    }
    jeuInitialise = true;

    if (typeof initializeUpgradeProperties === 'function') {
        initializeUpgradeProperties();
    }

    preparerZoneJeu();
    createAlienClickArea();
    initializeCenterHarvestPanel();

    if (typeof initializeFarms === 'function') {
        initializeFarms();
    }
    if (typeof initializeTools === 'function') {
        initializeTools();
    }
    if (typeof initializeDropSystem === 'function') {
        initializeDropSystem();
    }
    if (typeof initializeLaboratory === 'function') {
        initializeLaboratory();
    }
    if (typeof initializeGalaxyMap === 'function') {
        initializeGalaxyMap();
    }

    demarrerBoucleJeu();
    updateDisplay();
}

window.initGame = initGame;
