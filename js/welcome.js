// Système d'écran d'accueil

let introTypingInterval = null;
let introHideTimeout = null;

function getIntroPlanetContext() {
    if (typeof getCurrentPlanet === 'function') {
        const planet = getCurrentPlanet();
        if (planet) {
            return planet;
        }
    }

    if (Array.isArray(window.galaxyPlanets)) {
        return window.galaxyPlanets.find(planet => planet.id === window.currentPlanetId) || window.galaxyPlanets[0];
    }

    return null;
}

function buildIntroMessage() {
    const planet = getIntroPlanetContext();
    const planetName = planet ? `${planet.emoji} ${planet.name}` : '🪐 Orbita Prime';
    const biome = planet?.biome || 'Nébuleuses calmes';

    return [
        'Transmission établie... ',
        '',
        'Commandant, votre mission commence maintenant.',
        'Vous devez récolter l\'Entropie pour étendre notre présence dans la galaxie.',
        '',
        `Arrivée confirmée sur ${planetName}.`,
        `Environnement détecté: ${biome}.`,
        '',
        'Préparez le premier cycle d\'extraction.'
    ].join('\n');
}

function playIntroSequence() {
    const introScreen = document.getElementById('intro-screen');
    const introText = document.getElementById('intro-text');
    if (!introScreen || !introText) {
        return;
    }

    if (introTypingInterval) {
        clearInterval(introTypingInterval);
        introTypingInterval = null;
    }

    if (introHideTimeout) {
        clearTimeout(introHideTimeout);
        introHideTimeout = null;
    }

    const message = buildIntroMessage();
    let charIndex = 0;
    let introCompleted = false;

    const completeIntro = () => {
        if (introCompleted) return;
        introCompleted = true;

        if (introTypingInterval) {
            clearInterval(introTypingInterval);
            introTypingInterval = null;
        }

        introText.textContent = message;
        introHideTimeout = setTimeout(() => {
            introScreen.classList.add('hidden');
            document.body.classList.remove('intro-mode');
            introHideTimeout = null;
        }, 850);
    };

    introText.textContent = '';
    document.body.classList.add('intro-mode');
    introScreen.classList.remove('hidden');
    introScreen.onclick = () => {
        if (!introCompleted) {
            completeIntro();
        }
    };

    introTypingInterval = setInterval(() => {
        charIndex += 1;
        introText.textContent = message.slice(0, charIndex);

        if (charIndex >= message.length) {
            completeIntro();
        }
    }, 32);
}

function launchGameSession() {
    hideWelcomeScreen();
    initializeGame();
    playIntroSequence();
}

// Fonction pour démarrer une nouvelle partie
function startNewGame() {
    // Réinitialiser toutes les données de jeu
    resetGameData();

    launchGameSession();
}

// Fonction pour afficher le dialogue de chargement
function showLoadGameDialog() {
    const dialog = document.getElementById('load-dialog');
    dialog.classList.remove('hidden');
}

// Fonction pour cacher le dialogue de chargement
function hideLoadGameDialog() {
    const dialog = document.getElementById('load-dialog');
    dialog.classList.add('hidden');
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('save-file-input');
    fileInput.value = '';
}

// Fonction pour charger une partie depuis un fichier
function loadGameFromFile() {
    const fileInput = document.getElementById('save-file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Veuillez sélectionner un fichier de sauvegarde');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const gameData = JSON.parse(e.target.result);
            if (typeof applyLoadedGameData === 'function') {
                applyLoadedGameData(gameData, { refreshUI: false });
            } else {
                throw new Error('Système de chargement indisponible');
            }

            launchGameSession();

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            alert('Erreur lors du chargement du fichier: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Fonction pour réinitialiser les données de jeu
function resetGameData() {
    if (typeof resetRunState === 'function') {
        resetRunState({ keepPrestige: false });
    }

    // Repartir de l'auto-clicker éventuellement encore actif
    if (typeof startAutoClicker === 'function') {
        startAutoClicker();
    }

    // Vider la sauvegarde automatique
    try {
        localStorage.removeItem('alienClickerSave');
    } catch (error) {
        console.error('Impossible de vider la sauvegarde automatique:', error);
    }
}

// Fonction pour cacher l'écran d'accueil
function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const shop = document.getElementById('shop');
    
    welcomeScreen.classList.add('hidden');
    shop.classList.remove('hidden');
    document.body.classList.remove('welcome-mode');
}

// Fonction pour afficher l'écran d'accueil
function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const shop = document.getElementById('shop');
    
    welcomeScreen.classList.remove('hidden');
    shop.classList.add('hidden');
    document.body.classList.add('welcome-mode');
}

// Fonction pour initialiser le jeu après le chargement/nouvelle partie
function initializeGame() {
    // Initialiser les propriétés des upgrades avant tout
    if (typeof initializeUpgradeProperties === 'function') {
        initializeUpgradeProperties();
    }

    // initGame() est synchrone et initialise tout le runtime (clic, fermes, outils, drops, labo, galaxie)
    if (typeof initGame === 'function') {
        initGame();
    }

    // Démarrer la sauvegarde automatique une fois la partie lancée
    if (typeof startAutoSave === 'function') {
        startAutoSave();
    }
}

// Vérifier s'il y a une sauvegarde automatique au démarrage
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter la classe welcome-mode au body au démarrage
    document.body.classList.add('welcome-mode');
    
    // Si une sauvegarde automatique existe, proposer de reprendre la partie
    let autoSave = null;
    try {
        autoSave = localStorage.getItem('alienClickerSave');
    } catch (error) {
        console.error('Sauvegarde automatique inaccessible:', error);
    }

    if (autoSave) {
        // Ajouter un bouton pour continuer la dernière partie
        const welcomeButtons = document.querySelector('.welcome-buttons');
        const continueBtn = document.createElement('button');
        continueBtn.className = 'welcome-btn continue-game-btn';
        continueBtn.innerHTML = 'Continuer la Dernière Partie';
        continueBtn.onclick = function() {
            try {
                const gameData = JSON.parse(autoSave);
                if (typeof applyLoadedGameData === 'function') {
                    applyLoadedGameData(gameData, { refreshUI: false });
                } else {
                    throw new Error('Système de chargement indisponible');
                }

                launchGameSession();
            } catch (error) {
                console.error('Erreur sauvegarde auto:', error);
                startNewGame();
            }
        };
        
        // Insérer le bouton continuer en premier
        welcomeButtons.insertBefore(continueBtn, welcomeButtons.firstChild);
        
        // Ajouter les styles pour le bouton continuer
        const style = document.createElement('style');
        style.textContent = `
            .continue-game-btn {
                background: linear-gradient(45deg, #00ff88, #00cc6a);
                color: #000;
                box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
            }
            
            .continue-game-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(0, 255, 136, 0.6);
            }
        `;
        document.head.appendChild(style);
    }
});
