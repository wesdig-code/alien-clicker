// Système de sauvegarde et chargement

function applyLoadedGameData(gameData, options = {}) {
    const refreshUI = options.refreshUI !== false;

    // Vérifier la validité minimale des données
    if (!gameData || (!gameData.score && gameData.score !== 0)) {
        throw new Error('Fichier de sauvegarde invalide');
    }

    // Charger les données de base
    score = gameData.score || 0;
    window.totalScoreEarned = gameData.totalScoreEarned || 0;
    clickPower = gameData.clickPower || 1;
    scorePerSecond = gameData.scorePerSecond || 0;

    // Charger les données de prestige
    window.stardust = gameData.stardust || 0;

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
    }
}

function saveGame() {
    const gameData = {
        version: "1.3",
        timestamp: new Date().toISOString(),
        score: score,
        totalScoreEarned: window.totalScoreEarned || 0,
        clickPower: clickPower,
        scorePerSecond: scorePerSecond,
        stardust: window.stardust || 0,
        prestigeUpgrades: window.prestigeUpgrades || [],
        collectedItems: window.collectedItems || [],
        itemLevels: window.itemLevels || {},
        unlockedResearch: window.unlockedResearch || [],
        activeResearch: window.activeResearch || null,
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
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'alien-clicker-save.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Effet visuel de confirmation
    const saveButton = document.querySelector('.save-button');
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
