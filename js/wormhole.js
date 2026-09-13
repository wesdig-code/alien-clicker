// Système de Wormhole et Prestige

// Variables globales pour le système de prestige
window.stardust = 0;
const PRESTIGE_MIN_ENTROPY = 2500;

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

// Entropie encore convertible : ce qui a été généré moins ce qui a déjà été converti
function getConvertibleEntropy() {
    const totalGenere = window.totalScoreEarned || 0;
    const totalConverti = window.totalScoreConverted || 0;
    return Math.max(0, totalGenere - totalConverti);
}

// Fonction pour calculer le Stardust gagné avec l'entropie encore convertible
function calculateStardustGain(entropieConvertible) {
    if (entropieConvertible < PRESTIGE_MIN_ENTROPY) return 0;

    // Formule : racine carrée de l'entropie convertible / 50
    let baseStardust = Math.floor(Math.sqrt(entropieConvertible) / 50);

    // Bonus du multiplicateur de Stardust
    const stardustUpgrade = prestigeUpgrades.find(u => u.id === 'stardust_gain');
    const multiplier = 1 + (stardustUpgrade.level * 0.1);

    const collectionMultiplier = typeof getCollectionStardustMultiplier === 'function' ? getCollectionStardustMultiplier() : 1;
    return Math.floor(baseStardust * multiplier * collectionMultiplier);
}

// Fonction pour effectuer le prestige
function performPrestige() {
    const currentScore = window.score || 0;
    const entropieConvertible = getConvertibleEntropy();
    const stardustGain = calculateStardustGain(entropieConvertible);

    if (stardustGain === 0) {
        showPrestigeNotice(`Vous devez avoir généré au moins ${formatNumber(PRESTIGE_MIN_ENTROPY)} Entropie non encore convertie pour utiliser le Wormhole !`);
        return;
    }

    const confirmMessage = `Statistiques actuelles :
• Entropie actuelle : ${formatNumber(currentScore)}
• Entropie convertible : ${formatNumber(entropieConvertible)}
• Tout sera remis à zéro sauf vos améliorations permanentes et votre collection
• Les planètes redeviennent exploitables

Vous allez gagner :
• ${stardustGain} Stardust

Cette action est irréversible !`;

    showPrestigeConfirm(confirmMessage, () => {
        applyPrestige(stardustGain);
    });
}

function applyPrestige(stardustGain) {
    window.stardust = (window.stardust || 0) + stardustGain;
    // L'entropie convertie est consommée : impossible de reconvertir la même production
    window.totalScoreConverted = window.totalScoreEarned || 0;

    // Réinitialisation unifiée (conserve stardust, upgrades de prestige et collection)
    if (typeof resetRunState === 'function') {
        resetRunState({ keepPrestige: true });
    }

    // Relancer l'auto-clicker et les recalculs
    applyPrestigeBonuses();

    updatePrestigeDisplay();
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }

    // Réinitialiser les interfaces
    if (typeof initializeFarms === 'function') {
        initializeFarms();
    }
    if (typeof initializeTools === 'function') {
        initializeTools();
    }
    if (typeof refreshShop === 'function') {
        refreshShop();
    }
    if (typeof refreshGalaxy === 'function') {
        refreshGalaxy();
    }

    // Effet visuel
    showPrestigeEffect();

    if (typeof autoSaveGame === 'function') {
        autoSaveGame();
    }
}

// Bonus additif de puissance de clic apporté par l'upgrade de prestige (intégré par updateClickPower)
function getPrestigeFlatClickBonus() {
    const clickUpgrade = prestigeUpgrades.find(u => u.id === 'click_boost');
    return clickUpgrade ? clickUpgrade.level : 0;
}

// (Re)démarre l'auto-clicker et déclenche les recalculs : ne mute aucune statistique
function applyPrestigeBonuses() {
    startAutoClicker();

    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }
    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }
}

// Fonction pour acheter une amélioration de prestige
function buyPrestigeUpgrade(upgradeId) {
    const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    if (upgrade.level >= upgrade.maxLevel) {
        showPrestigeNotice('Cette amélioration est déjà au niveau maximum !');
        return;
    }

    const cost = getPrestigeUpgradeCost(upgrade);

    if (window.stardust < cost) {
        showPrestigeNotice(`Pas assez de Stardust ! Coût: ${cost}, Disponible: ${formatNumber(window.stardust)}`);
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
}

// Fonction pour calculer le coût d'une amélioration de prestige
function getPrestigeUpgradeCost(upgrade) {
    const discount = typeof getCollectionUpgradeDiscount === 'function' ? getCollectionUpgradeDiscount() : 1;
    return Math.max(1, Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level) * discount));
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
    updatePrestigeUpgradeButtons();
}

// Actualisation légère : préserver les boutons et leur focus quand le Stardust évolue.
function updatePrestigeUpgradeButtons() {
    prestigeUpgrades.forEach(upgrade => {
        const row = document.getElementById(`prestige-upgrade-${upgrade.id}`);
        if (!row) return;
        const button = row.querySelector('.prestige-upgrade-btn');
        const level = row.querySelector('.upgrade-level');
        const description = row.querySelector('.upgrade-description');
        const cost = getPrestigeUpgradeCost(upgrade);
        const maxed = upgrade.level >= upgrade.maxLevel;
        const affordable = window.stardust >= cost;
        if (level) level.textContent = `${upgrade.level}/${upgrade.maxLevel}`;
        if (description && upgrade.id === 'auto_click') {
            const interval = typeof getAutoClickIntervalMs === 'function' ? getAutoClickIntervalMs() : 1000;
            description.textContent = `Déclenche un clic toutes les ${formatNumber(interval / 1000)} s`;
        }
        if (button) {
            button.disabled = maxed || !affordable;
            button.className = `prestige-upgrade-btn ${maxed ? 'maxed' : affordable ? 'available' : 'locked'}`;
            button.textContent = maxed ? '✅ MAX' : `💫 ${cost} Stardust`;
        }
    });
}

// Fonction pour mettre à jour l'affichage du prestige
function updatePrestigeDisplay() {
    updatePrestigeUpgradeButtons();
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
        const entropieConvertible = getConvertibleEntropy();
        const potentialGain = calculateStardustGain(entropieConvertible);

        scorePreview.textContent = `${formatNumber(currentScore)} (Convertible: ${formatNumber(entropieConvertible)})`;
        gainPreview.textContent = potentialGain;

        // Désactiver le bouton si pas assez d'entropie convertible
        const prestigeButton = document.getElementById('prestige-button');
        if (prestigeButton) {
            if (potentialGain === 0) {
                prestigeButton.disabled = true;
                prestigeButton.textContent = `🌌 Wormhole (min. ${formatNumber(PRESTIGE_MIN_ENTROPY)} Entropie convertible)`;
            } else {
                prestigeButton.disabled = false;
                prestigeButton.textContent = '🌌 Entrer dans le Wormhole';
            }
        }
    }
}

// Fonction pour l'auto-clicker (idempotente : ne laisse jamais deux intervalles actifs)
function startAutoClicker() {
    if (window.autoClickerInterval) {
        clearInterval(window.autoClickerInterval);
        window.autoClickerInterval = null;
    }

    const autoClickUpgrade = prestigeUpgrades.find(u => u.id === 'auto_click');
    if (autoClickUpgrade && autoClickUpgrade.level > 0) {
        window.autoClickerInterval = setInterval(() => {
            if (typeof triggerAlienClick === 'function') {
                triggerAlienClick();
            }
        }, typeof getAutoClickIntervalMs === 'function' ? getAutoClickIntervalMs() : 1000);
    }
}

// Notification temporaire (remplace les alert() natifs)
function showPrestigeNotice(message) {
    const notice = document.createElement('div');
    notice.textContent = message;
    notice.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10002;
        max-width: 90vw;
        color: #ffffff;
        text-align: center;
        font-weight: bold;
        padding: 14px 22px;
        background: rgba(30, 10, 50, 0.95);
        border: 1px solid rgba(168, 85, 247, 0.6);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
    `;

    document.body.appendChild(notice);

    setTimeout(() => {
        if (notice.parentNode) {
            notice.parentNode.removeChild(notice);
        }
    }, 3500);
}

// Confirmation modale réutilisant les styles du dialogue de chargement
function showPrestigeConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10003;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.75);
    `;

    const dialog = document.createElement('div');
    dialog.className = 'load-dialog';
    dialog.style.cssText = 'margin-top: 0; max-width: 480px; background: rgba(20, 10, 40, 0.98);';

    const title = document.createElement('h3');
    title.textContent = '🌌 Traverser le Wormhole ?';

    const body = document.createElement('div');
    body.textContent = message;
    body.style.cssText = 'color: #ffffff; white-space: pre-line; margin-bottom: 1rem; text-align: left;';

    const actions = document.createElement('div');
    actions.className = 'load-dialog-buttons';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'load-confirm-btn';
    confirmBtn.textContent = 'Traverser';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'load-cancel-btn';
    cancelBtn.textContent = 'Annuler';

    const close = () => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    };

    confirmBtn.onclick = () => {
        close();
        onConfirm();
    };
    cancelBtn.onclick = close;
    overlay.onclick = (event) => {
        if (event.target === overlay) {
            close();
        }
    };

    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);
    dialog.appendChild(title);
    dialog.appendChild(body);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
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
    startAutoClicker();
});

// Rendre les fonctions accessibles globalement
window.calculateStardustGain = calculateStardustGain;
window.getConvertibleEntropy = getConvertibleEntropy;
window.getPrestigeFlatClickBonus = getPrestigeFlatClickBonus;
window.applyPrestigeBonuses = applyPrestigeBonuses;
window.startAutoClicker = startAutoClicker;
window.performPrestige = performPrestige;
window.buyPrestigeUpgrade = buyPrestigeUpgrade;
window.initializePrestigeUpgrades = initializePrestigeUpgrades;
window.updatePrestigeDisplay = updatePrestigeDisplay;
window.getFarmMultiplier = getFarmMultiplier;
window.getToolMultiplier = getToolMultiplier;
window.prestigeUpgrades = prestigeUpgrades;
