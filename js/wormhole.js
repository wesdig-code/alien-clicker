// Système de Wormhole et Prestige

// Variables globales pour le système de prestige
window.stardust = 0;

// Définition des améliorations permanentes
const prestigeUpgrades = [
    {
        id: 'click_boost',
        name: '🖱️ Puissance de Clic',
        description: 'Augmente la puissance de clic de base de +1',
        baseCost: 10,
        maxLevel: 50,
        level: 0,
        effect: 'clickPower'
    },
    {
        id: 'farm_efficiency',
        name: '🛸 Efficacité des Fermes',
        description: 'Multiplie la production de toutes les fermes par 1.1',
        baseCost: 25,
        maxLevel: 20,
        level: 0,
        effect: 'farmMultiplier'
    },
    {
        id: 'tool_power',
        name: '🔧 Puissance des Outils',
        description: 'Multiplie l\'effet de tous les outils par 1.15',
        baseCost: 50,
        maxLevel: 15,
        level: 0,
        effect: 'toolMultiplier'
    },
    {
        id: 'stardust_gain',
        name: '✨ Générateur de Stardust',
        description: 'Augmente le gain de Stardust lors du "Wormhole" de 10%',
        baseCost: 100,
        maxLevel: 10,
        level: 0,
        effect: 'stardustMultiplier'
    },
    {
        id: 'auto_click',
        name: '🤖 Auto-Clicker',
        description: 'Clique automatiquement 1 fois par seconde',
        baseCost: 500,
        maxLevel: 1,
        level: 0,
        effect: 'autoClick'
    }
];

// Fonction pour calculer le Stardust gagné avec le score total
function calculateStardustGain(totalScore) {
    if (totalScore < 1000) return 0;
    
    // Formule améliorée : racine carrée du score total / 50 (plus généreux)
    let baseStardust = Math.floor(Math.sqrt(totalScore) / 50);
    
    // Bonus du multiplicateur de Stardust
    const stardustUpgrade = prestigeUpgrades.find(u => u.id === 'stardust_gain');
    const multiplier = 1 + (stardustUpgrade.level * 0.1);
    
    return Math.floor(baseStardust * multiplier);
}

// Fonction pour effectuer le prestige
function performPrestige() {
    const currentScore = window.score || 0;
    const totalScore = window.totalScoreEarned || 0;
    const stardustGain = calculateStardustGain(totalScore);
    
    if (stardustGain === 0) {
        alert('Vous devez avoir généré au moins 1000 points au total pour utiliser le Wormhole !');
        return;
    }
    
    // Confirmation avec plus de détails
    const confirmMessage = `Êtes-vous sûr de vouloir traverser le Wormhole ?
    
Statistiques actuelles :
• Score actuel : ${formatNumber(currentScore)}
• Score total généré : ${formatNumber(totalScore)}
• Tout sera remis à zéro sauf vos améliorations permanentes

Vous allez gagner :
• ${stardustGain} Stardust (basé sur votre score total)
    
Cette action est irréversible !`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Effectuer le prestige
    window.stardust += stardustGain;
    
    // Réinitialiser le jeu (comme dans welcome.js mais en gardant le stardust)
    window.score = 0;
    // NE PAS remettre totalScoreEarned à zéro - c'est un compteur permanent !
    window.scorePerSecond = 0;
    window.clickPower = 1;
    
    // Réinitialiser les fermes et outils (mais pas les upgrades de prestige)
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
    
    // Appliquer les bonus de prestige
    applyPrestigeBonuses();
    
    // Mettre à jour l'affichage
    updatePrestigeDisplay();
    updateDisplay();
    
    // Réinitialiser les interfaces
    if (typeof initializeFarms === 'function') {
        initializeFarms();
    }
    if (typeof initializeTools === 'function') {
        initializeTools();
    }
    
    // Effet visuel
    showPrestigeEffect();
    
    console.log(`Prestige effectué ! Gagné ${stardustGain} Stardust`);
}

// Fonction pour appliquer les bonus de prestige
function applyPrestigeBonuses() {
    prestigeUpgrades.forEach(upgrade => {
        if (upgrade.level > 0) {
            switch (upgrade.effect) {
                case 'clickPower':
                    window.clickPower += upgrade.level;
                    break;
                case 'farmMultiplier':
                    // Sera appliqué dans le calcul de scorePerSecond
                    break;
                case 'toolMultiplier':
                    // Sera appliqué dans le calcul de clickPower
                    break;
                case 'autoClick':
                    if (upgrade.level > 0) {
                        startAutoClicker();
                    }
                    break;
            }
        }
    });
}

// Fonction pour acheter une amélioration de prestige
function buyPrestigeUpgrade(upgradeId) {
    const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    if (upgrade.level >= upgrade.maxLevel) {
        alert('Cette amélioration est déjà au niveau maximum !');
        return;
    }
    
    const cost = getPrestigeUpgradeCost(upgrade);
    
    if (window.stardust < cost) {
        alert(`Pas assez de Stardust ! Coût: ${cost}, Disponible: ${window.stardust}`);
        return;
    }
    
    // Acheter l'amélioration
    window.stardust -= cost;
    upgrade.level++;
    
    // Appliquer immédiatement l'effet si le jeu est en cours
    applyPrestigeBonuses();
    
    // Mettre à jour les affichages
    updatePrestigeDisplay();
    initializePrestigeUpgrades();
    
    // Mettre à jour les valeurs de jeu si nécessaire
    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }
    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
    
    console.log(`Amélioration ${upgrade.name} achetée ! Niveau: ${upgrade.level}`);
}

// Fonction pour calculer le coût d'une amélioration de prestige
function getPrestigeUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
}

// Fonction pour initialiser l'affichage des améliorations de prestige
function initializePrestigeUpgrades() {
    const container = document.getElementById('prestige-upgrades-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    prestigeUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'prestige-upgrade-item';
        upgradeDiv.id = `prestige-upgrade-${upgrade.id}`;
        
        const cost = getPrestigeUpgradeCost(upgrade);
        const isMaxLevel = upgrade.level >= upgrade.maxLevel;
        const canAfford = window.stardust >= cost;
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-level">${upgrade.level}/${upgrade.maxLevel}</span>
            </div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-actions">
                ${isMaxLevel ? 
                    '<button class="prestige-upgrade-btn maxed">✅ MAX</button>' :
                    `<button class="prestige-upgrade-btn ${canAfford ? 'available' : 'locked'}" 
                             onclick="buyPrestigeUpgrade('${upgrade.id}')"
                             ${!canAfford ? 'disabled' : ''}>
                        💫 ${cost} Stardust
                     </button>`
                }
            </div>
        `;
        
        container.appendChild(upgradeDiv);
    });
}

// Fonction pour mettre à jour l'affichage du prestige
function updatePrestigeDisplay() {
    // Affichage du Stardust
    const stardustDisplay = document.getElementById('stardust-amount');
    if (stardustDisplay) {
        stardustDisplay.textContent = formatNumber(window.stardust);
    }
    
    // Aperçu du score et gain de Stardust
    const scorePreview = document.getElementById('current-score-preview');
    const gainPreview = document.getElementById('stardust-gain-preview');
    
    if (scorePreview && gainPreview) {
        const currentScore = window.score || 0;
        const totalScore = window.totalScoreEarned || 0;
        const potentialGain = calculateStardustGain(totalScore);
        
        scorePreview.textContent = `${formatNumber(currentScore)} (Total: ${formatNumber(totalScore)})`;
        gainPreview.textContent = potentialGain;
        
        // Désactiver le bouton si pas assez de score total
        const prestigeButton = document.getElementById('prestige-button');
        if (prestigeButton) {
            if (potentialGain === 0) {
                prestigeButton.disabled = true;
                prestigeButton.textContent = '🌌 Wormhole (min. 1000 points total)';
            } else {
                prestigeButton.disabled = false;
                prestigeButton.textContent = '🌌 Entrer dans le Wormhole';
            }
        }
    }
}

// Fonction pour l'auto-clicker
function startAutoClicker() {
    if (window.autoClickerInterval) {
        clearInterval(window.autoClickerInterval);
    }
    
    const autoClickUpgrade = prestigeUpgrades.find(u => u.id === 'auto_click');
    if (autoClickUpgrade.level > 0) {
        window.autoClickerInterval = setInterval(() => {
            if (typeof clickAlien === 'function') {
                clickAlien();
            }
        }, 1000); // 1 fois par seconde
    }
}

// Fonction pour l'effet visuel du prestige
function showPrestigeEffect() {
    // Créer un effet visuel temporaire
    const effect = document.createElement('div');
    effect.className = 'prestige-effect';
    effect.innerHTML = '🌌✨ Voyage Interdimensionnel Réussi ! ✨🌌';
    document.body.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 3000);
}

// Fonction pour obtenir le multiplicateur de ferme global
function getFarmMultiplier() {
    const farmUpgrade = prestigeUpgrades.find(u => u.id === 'farm_efficiency');
    return Math.pow(1.1, farmUpgrade.level);
}

// Fonction pour obtenir le multiplicateur d'outil global
function getToolMultiplier() {
    const toolUpgrade = prestigeUpgrades.find(u => u.id === 'tool_power');
    return Math.pow(1.15, toolUpgrade.level);
}

// Initialiser le système de prestige quand l'onglet est ouvert
document.addEventListener('DOMContentLoaded', function() {
    // Démarrer l'auto-clicker si débloqué
    const autoClickUpgrade = prestigeUpgrades.find(u => u.id === 'auto_click');
    if (autoClickUpgrade.level > 0) {
        startAutoClicker();
    }
});

// Rendre les fonctions accessibles globalement
window.calculateStardustGain = calculateStardustGain;
window.performPrestige = performPrestige;
window.buyPrestigeUpgrade = buyPrestigeUpgrade;
window.initializePrestigeUpgrades = initializePrestigeUpgrades;
window.updatePrestigeDisplay = updatePrestigeDisplay;
window.getFarmMultiplier = getFarmMultiplier;
window.getToolMultiplier = getToolMultiplier;
window.prestigeUpgrades = prestigeUpgrades;
