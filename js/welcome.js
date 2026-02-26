// Système d'écran d'accueil

// Fonction pour démarrer une nouvelle partie
function startNewGame() {
    console.log('Démarrage d\'une nouvelle partie');
    
    // Réinitialiser toutes les données de jeu
    resetGameData();
    
    // Cacher l'écran d'accueil et afficher l'interface de jeu
    hideWelcomeScreen();
    
    // Initialiser le jeu
    initializeGame();
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
            
            // Cacher l'écran d'accueil et afficher l'interface de jeu
            hideWelcomeScreen();
            
            // Initialiser le jeu avec les données chargées (gère l'affichage automatiquement)
            initializeGame();
            
            console.log('Partie chargée avec succès !');
            
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            alert('Erreur lors du chargement du fichier: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Fonction pour réinitialiser les données de jeu
function resetGameData() {
    // Réinitialiser toutes les variables globales
    window.score = 0;
    window.scorePerSecond = 0;
    window.clickPower = 1;
    
    // Réinitialiser les counts des fermes et outils
    if (typeof farms !== 'undefined') {
        farms.forEach(farm => {
            farm.count = 0;
            farm.multiplier = 1;
            if (farm.upgrades) {
                farm.upgrades = { level10: false, level25: false, level50: false };
            }
        });
    }
    
    if (typeof tools !== 'undefined') {
        tools.forEach(tool => {
            tool.level = 0;
            tool.multiplier = 1;
            if (tool.upgrades) {
                tool.upgrades = { level10: false, level25: false, level50: false };
            }
        });
    }

    // Réinitialiser la collection permanente
    if (Array.isArray(window.collectedItems)) {
        window.collectedItems.length = 0;
    }
    if (window.itemLevels && typeof window.itemLevels === 'object') {
        Object.keys(window.itemLevels).forEach(key => delete window.itemLevels[key]);
    }

    if (Array.isArray(window.unlockedResearch)) {
        window.unlockedResearch.length = 0;
    }
    window.activeResearch = null;
    
    // Vider le localStorage
    localStorage.removeItem('alienClickerSave');
    
    console.log('Données de jeu réinitialisées');
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
    
    // Initialiser Phaser (qui va créer les objets texte)
    if (typeof initGame === 'function') {
        initGame();
    }
    
    // Attendre un peu que Phaser soit complètement initialisé
    setTimeout(() => {
        // Mettre à jour l'affichage (maintenant que les objets texte existent)
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
        
        // Redessiner les fermes et outils
        if (typeof initializeFarms === 'function') {
            initializeFarms();
        }
        
        if (typeof initializeTools === 'function') {
            initializeTools();
        }
        
        // Initialiser le système de drops
        if (typeof initializeDropSystem === 'function') {
            initializeDropSystem();
        }

        // Initialiser le laboratoire
        if (typeof initializeLaboratory === 'function') {
            initializeLaboratory();
        }
    }, 150);
}

// Vérifier s'il y a une sauvegarde automatique au démarrage
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter la classe welcome-mode au body au démarrage
    document.body.classList.add('welcome-mode');
    
    // Si une sauvegarde existe, on peut proposer de la charger automatiquement
    const autoSave = localStorage.getItem('alienClickerSave');
    
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
                
                hideWelcomeScreen();
                initializeGame();
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
