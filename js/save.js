// Système de sauvegarde et chargement

function saveGame() {
    const gameData = {
        version: "1.1",
        timestamp: new Date().toISOString(),
        score: score,
        totalScoreEarned: window.totalScoreEarned || 0,
        clickPower: clickPower,
        scorePerSecond: scorePerSecond,
        stardust: window.stardust || 0,
        prestigeUpgrades: window.prestigeUpgrades || [],
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
            
            // Vérifier la validité des données
            if (!gameData.score && gameData.score !== 0) {
                throw new Error('Fichier de sauvegarde invalide');
            }
            
            // Charger les données
            score = gameData.score || 0;
            window.totalScoreEarned = gameData.totalScoreEarned || 0;
            clickPower = gameData.clickPower || 1;
            scorePerSecond = gameData.scorePerSecond || 0;
            
            // Charger les données de prestige
            window.stardust = gameData.stardust || 0;
            
            // Restaurer les upgrades de prestige
            if (gameData.prestigeUpgrades && window.prestigeUpgrades) {
                gameData.prestigeUpgrades.forEach(savedUpgrade => {
                    const upgrade = window.prestigeUpgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.level = savedUpgrade.level || 0;
                    }
                });
            }
            
            // Restaurer les fermes
            if (gameData.farms) {
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
            if (gameData.tools) {
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
            updateScorePerSecond();
            updateClickPower();
            updateDisplay();
            
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
