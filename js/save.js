// Système de sauvegarde et chargement

const SAVE_VERSION = "1.4";
const AUTO_SAVE_KEY = 'alienClickerSave';
const AUTO_SAVE_INTERVAL_MS = 15000;
// Plafond de progression hors-ligne : 8 heures (choix d'équilibrage)
const OFFLINE_MAX_SECONDS = 8 * 60 * 60;

// Entropie totale déjà convertie en Stardust (empêche de reconvertir la même entropie)
window.totalScoreConverted = window.totalScoreConverted || 0;

let autoSaveInterval = null;

// Réinitialisation unifiée d'une partie.
// options.keepPrestige : conserve stardust, prestigeUpgrades, collectedItems, itemLevels et totalScoreEarned
function resetRunState(options = {}) {
    const keepPrestige = options.keepPrestige === true;

    window.score = 0;
    window.scorePerSecond = 0;
    window.clickPower = 1;

    if (!keepPrestige) {
        window.totalScoreEarned = 0;
        window.totalScoreConverted = 0;
        window.stardust = 0;

        if (Array.isArray(window.prestigeUpgrades)) {
            window.prestigeUpgrades.forEach(upgrade => {
                upgrade.level = 0;
            });
        }

        if (Array.isArray(window.collectedItems)) {
            window.collectedItems.length = 0;
        }
        if (window.itemLevels && typeof window.itemLevels === 'object') {
            Object.keys(window.itemLevels).forEach(key => delete window.itemLevels[key]);
        }
    }

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

    // Laboratoire
    if (Array.isArray(window.unlockedResearch)) {
        window.unlockedResearch.length = 0;
    }
    window.researchPoints = 0;
    window.activeResearch = null;

    // Carte galactique : la récolte redevient possible sur toutes les planètes
    window.currentPlanetId = 'orbita_prime';
    window.currentSystemId = 'core_sector';
    window.visitedPlanets = ['orbita_prime'];
    if (typeof resetPlanetHarvest === 'function') {
        resetPlanetHarvest();
    } else {
        window.planetHarvested = { orbita_prime: 0 };
        window.claimedPlanetResearchRewards = [];
    }

    // Les bonus des items permanents vivent dans les multiplicateurs remis à 1 ci-dessus
    if (typeof reapplyCollectionBonuses === 'function') {
        reapplyCollectionBonuses();
    }

    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }
    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }
}

function applyLoadedGameData(gameData, options = {}) {
    const refreshUI = options.refreshUI !== false;

    // Vérifier la validité minimale des données
    if (!gameData || (!gameData.score && gameData.score !== 0)) {
        throw new Error('Fichier de sauvegarde invalide');
    }

    // Charger les données de base
    window.score = gameData.score || 0;
    window.totalScoreEarned = gameData.totalScoreEarned || 0;
    window.clickPower = gameData.clickPower || 1;
    window.scorePerSecond = gameData.scorePerSecond || 0;

    // Charger les données de prestige
    window.stardust = gameData.stardust || 0;
    // Sauvegardes 1.3 : aucune entropie n'avait encore été comptabilisée comme convertie
    window.totalScoreConverted = Number.isFinite(gameData.totalScoreConverted) ? gameData.totalScoreConverted : 0;

    // Restaurer les upgrades de prestige
    if (Array.isArray(gameData.prestigeUpgrades) && Array.isArray(window.prestigeUpgrades)) {
        gameData.prestigeUpgrades.forEach(savedUpgrade => {
            const upgrade = window.prestigeUpgrades.find(u => u.id === savedUpgrade.id);
            if (upgrade) {
                upgrade.level = savedUpgrade.level || 0;
            }
        });
    }

    // Charger les items collectés (collection)
    if (Array.isArray(window.collectedItems)) {
        window.collectedItems.length = 0;
        if (Array.isArray(gameData.collectedItems)) {
            window.collectedItems.push(...gameData.collectedItems);
        }
    }

    // Charger les niveaux des items (collection)
    if (window.itemLevels && typeof window.itemLevels === 'object') {
        Object.keys(window.itemLevels).forEach(key => {
            delete window.itemLevels[key];
        });

        if (gameData.itemLevels && typeof gameData.itemLevels === 'object') {
            Object.assign(window.itemLevels, gameData.itemLevels);
        }
    }

    // Charger les recherches du laboratoire
    if (Array.isArray(window.unlockedResearch)) {
        window.unlockedResearch.length = 0;
        if (Array.isArray(gameData.unlockedResearch)) {
            window.unlockedResearch.push(...gameData.unlockedResearch);
        }
    }

    window.researchPoints = Number.isFinite(gameData.researchPoints) ? gameData.researchPoints : 0;

    if (Array.isArray(gameData.claimedPlanetResearchRewards)) {
        window.claimedPlanetResearchRewards = gameData.claimedPlanetResearchRewards;
    } else {
        window.claimedPlanetResearchRewards = [];
    }

    // Charger la recherche en cours du laboratoire
    if (gameData.activeResearch && typeof gameData.activeResearch === 'object') {
        window.activeResearch = {
            id: gameData.activeResearch.id,
            startAt: gameData.activeResearch.startAt,
            endAt: gameData.activeResearch.endAt
        };
    } else {
        window.activeResearch = null;
    }

    // Charger la carte galactique
    if (typeof gameData.currentPlanetId === 'string') {
        window.currentPlanetId = gameData.currentPlanetId;
    } else {
        window.currentPlanetId = 'orbita_prime';
    }

    if (typeof gameData.currentSystemId === 'string') {
        window.currentSystemId = gameData.currentSystemId;
    } else {
        window.currentSystemId = 'core_sector';
    }

    if (Array.isArray(gameData.visitedPlanets) && gameData.visitedPlanets.length > 0) {
        window.visitedPlanets = gameData.visitedPlanets;
    } else {
        window.visitedPlanets = ['orbita_prime'];
    }

    if (gameData.planetHarvested && typeof gameData.planetHarvested === 'object') {
        window.planetHarvested = gameData.planetHarvested;
    } else {
        window.planetHarvested = { orbita_prime: 0 };
    }

    // Restaurer les fermes
    if (Array.isArray(gameData.farms)) {
        gameData.farms.forEach(savedFarm => {
            const farm = farms.find(f => f.id === savedFarm.id);
            if (farm) {
                farm.count = savedFarm.count || 0;
                farm.multiplier = savedFarm.multiplier || 1;
                farm.upgrades = savedFarm.upgrades || {
                    level10: false,
                    level25: false,
                    level50: false
                };
            }
        });
    }

    // Restaurer les outils
    if (Array.isArray(gameData.tools)) {
        gameData.tools.forEach(savedTool => {
            const tool = tools.find(t => t.id === savedTool.id);
            if (tool) {
                tool.level = savedTool.level || 0;
                tool.multiplier = savedTool.multiplier || 1;
                tool.upgrades = savedTool.upgrades || {
                    level10: false,
                    level25: false,
                    level50: false
                };
            }
        });
    }

    // Recalculer les valeurs dérivées
    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }
    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }

    // L'auto-clicker doit repartir proprement après un chargement
    if (typeof startAutoClicker === 'function') {
        startAutoClicker();
    }

    applyOfflineProgress(gameData.lastSeenAt);

    if (refreshUI) {
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
        if (typeof updateCollectionDisplay === 'function') {
            updateCollectionDisplay();
        }
        if (typeof updatePrestigeDisplay === 'function') {
            updatePrestigeDisplay();
        }
        if (typeof renderLaboratoryTree === 'function') {
            renderLaboratoryTree();
        }
        if (typeof renderGalaxyMap === 'function') {
            renderGalaxyMap();
        }
    }
}

// Progression hors-ligne : crédite la production passive écoulée depuis la dernière session
function applyOfflineProgress(lastSeenAt) {
    const derniereVisite = Number(lastSeenAt);
    if (!Number.isFinite(derniereVisite) || derniereVisite <= 0) {
        return;
    }

    const secondesEcoulees = Math.min(
        Math.floor((Date.now() - derniereVisite) / 1000),
        OFFLINE_MAX_SECONDS
    );

    const production = window.scorePerSecond || 0;
    if (secondesEcoulees <= 0 || production <= 0) {
        return;
    }

    const gainBrut = production * secondesEcoulees;
    const gainReel = typeof applyPlanetHarvestCap === 'function'
        ? applyPlanetHarvestCap(gainBrut)
        : gainBrut;

    if (gainReel <= 0) {
        return;
    }

    if (typeof addScore === 'function') {
        addScore(gainReel);
    } else {
        window.score += gainReel;
        window.totalScoreEarned = (window.totalScoreEarned || 0) + gainReel;
    }

    showOfflineGain(gainReel, secondesEcoulees);
}

function showOfflineGain(gain, secondes) {
    const format = typeof formatNumber === 'function' ? formatNumber : (n => Math.floor(n));
    const heures = Math.floor(secondes / 3600);
    const minutes = Math.floor((secondes % 3600) / 60);
    const duree = heures > 0 ? `${heures}h${String(minutes).padStart(2, '0')}` : `${minutes} min`;

    const message = document.createElement('div');
    message.innerHTML = `⏳ Pendant votre absence (${duree}) :<br>+${format(gain)} Entropie`;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10002;
        color: #00ff88;
        text-align: center;
        font-weight: bold;
        padding: 14px 22px;
        background: rgba(0, 20, 10, 0.92);
        border: 1px solid rgba(0, 255, 136, 0.5);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.35);
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 6000);
}

// Instantané complet de l'état persistant (source unique du format de sauvegarde)
function serializeGameState() {
    return {
        version: SAVE_VERSION,
        timestamp: new Date().toISOString(),
        lastSeenAt: Date.now(),
        score: window.score || 0,
        totalScoreEarned: window.totalScoreEarned || 0,
        totalScoreConverted: window.totalScoreConverted || 0,
        clickPower: window.clickPower || 1,
        scorePerSecond: window.scorePerSecond || 0,
        stardust: window.stardust || 0,
        prestigeUpgrades: window.prestigeUpgrades || [],
        collectedItems: window.collectedItems || [],
        itemLevels: window.itemLevels || {},
        unlockedResearch: window.unlockedResearch || [],
        researchPoints: window.researchPoints || 0,
        activeResearch: window.activeResearch || null,
        currentPlanetId: window.currentPlanetId || 'orbita_prime',
        currentSystemId: window.currentSystemId || 'core_sector',
        visitedPlanets: window.visitedPlanets || ['orbita_prime'],
        planetHarvested: window.planetHarvested || { orbita_prime: 0 },
        claimedPlanetResearchRewards: window.claimedPlanetResearchRewards || [],
        farms: farms.map(farm => ({
            id: farm.id,
            count: farm.count,
            multiplier: farm.multiplier,
            upgrades: farm.upgrades
        })),
        tools: tools.map(tool => ({
            id: tool.id,
            level: tool.level,
            multiplier: tool.multiplier,
            upgrades: tool.upgrades
        }))
    };
}

function autoSaveGame() {
    try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(serializeGameState()));
    } catch (error) {
        console.error('Sauvegarde automatique impossible:', error);
    }
}

// Démarre la sauvegarde automatique périodique (idempotent)
function startAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }

    autoSaveInterval = setInterval(autoSaveGame, AUTO_SAVE_INTERVAL_MS);

    if (!window.autoSaveUnloadBound) {
        window.addEventListener('beforeunload', autoSaveGame);
        window.autoSaveUnloadBound = true;
    }

    autoSaveGame();
}

function saveGame() {
    const dataStr = JSON.stringify(serializeGameState(), null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'alien-clicker-save.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Effet visuel de confirmation
    const saveButton = document.querySelector('.save-button');
    if (!saveButton) return;

    const originalText = saveButton.textContent;
    saveButton.textContent = '✅ Sauvegarde téléchargée !';
    saveButton.style.background = 'linear-gradient(45deg, #00ff88, #00cc66)';

    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = 'linear-gradient(45deg, #66ccff, #4499cc)';
    }, 2000);
}

function loadGame(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const gameData = JSON.parse(e.target.result);
            applyLoadedGameData(gameData, { refreshUI: true });

            // Effet visuel de confirmation
            showLoadSuccess();

        } catch (error) {
            showLoadError();
        }
    };

    reader.readAsText(file);
}

function showLoadSuccess() {
    const fileInput = document.getElementById('load-file');
    const originalBorder = fileInput.style.borderColor;

    fileInput.style.borderColor = '#00ff88';
    fileInput.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.5)';

    // Créer un message de succès temporaire
    const successMsg = document.createElement('div');
    successMsg.textContent = '✅ Partie chargée avec succès !';
    successMsg.style.cssText = `
        color: #00ff88;
        text-align: center;
        font-weight: bold;
        margin-top: 10px;
        padding: 10px;
        background: rgba(0, 255, 136, 0.1);
        border-radius: 6px;
    `;

    fileInput.parentNode.appendChild(successMsg);

    setTimeout(() => {
        fileInput.style.borderColor = originalBorder;
        fileInput.style.boxShadow = '';
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 3000);
}

function showLoadError() {
    const fileInput = document.getElementById('load-file');
    fileInput.style.borderColor = '#ff4444';
    fileInput.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.5)';

    // Créer un message d'erreur temporaire
    const errorMsg = document.createElement('div');
    errorMsg.textContent = '❌ Erreur: Fichier de sauvegarde invalide';
    errorMsg.style.cssText = `
        color: #ff4444;
        text-align: center;
        font-weight: bold;
        margin-top: 10px;
        padding: 10px;
        background: rgba(255, 68, 68, 0.1);
        border-radius: 6px;
    `;

    fileInput.parentNode.appendChild(errorMsg);

    setTimeout(() => {
        fileInput.style.borderColor = '#5a5a8e';
        fileInput.style.boxShadow = '';
        if (errorMsg.parentNode) {
            errorMsg.parentNode.removeChild(errorMsg);
        }
    }, 3000);
}

window.applyLoadedGameData = applyLoadedGameData;
window.resetRunState = resetRunState;
window.serializeGameState = serializeGameState;
window.autoSaveGame = autoSaveGame;
window.startAutoSave = startAutoSave;
window.AUTO_SAVE_KEY = AUTO_SAVE_KEY;
