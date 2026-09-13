// Point d'entrée principal du jeu Alien Clicker
// Initialisation synchrone du runtime, appelée depuis welcome.js

let jeuInitialise = false;

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
