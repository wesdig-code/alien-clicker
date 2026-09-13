// Système d'améliorations

function createUpgradeButton(item, level, type) {
    const button = document.createElement('button');
    button.className = 'upgrade-button';
    
    const upgradeKey = `level${level}`;
    const currentLevel = type === 'farm' ? item.count : item.level;
    const upgradeCost = getUpgradeCost(item, level, type);
    
    if (item.upgrades[upgradeKey]) {
        button.classList.add('purchased');
        button.textContent = `✓ ${level}`;
        button.disabled = true;
    } else if (currentLevel >= level) {
        button.classList.add('available');
        button.textContent = `⚡ ${level} (${formatNumber(upgradeCost)})`;
        button.addEventListener('click', () => buyUpgrade(item, level, type));
    } else {
        button.classList.add('locked');
        button.textContent = `🔒 ${level}`;
        button.disabled = true;
    }
    
    return button;
}

function getUpgradeCost(item, level, type) {
    const discount = typeof getCollectionUpgradeDiscount === 'function' ? getCollectionUpgradeDiscount() : 1;
    return Math.max(1, Math.floor(item.baseCost * level * 10 * discount));
}

function buyUpgrade(item, level, type) {
    const upgradeCost = getUpgradeCost(item, level, type);
    const upgradeKey = `level${level}`;

    // Achat impossible (score insuffisant ou amélioration déjà possédée) : ne rien faire
    if (score < upgradeCost || item.upgrades[upgradeKey]) {
        return;
    }

    score -= upgradeCost;
    item.upgrades[upgradeKey] = true;
    item.multiplier *= 2; // Double la production

    if (type === 'farm') {
        updateScorePerSecond();
    } else {
        updateClickPower();
    }

    rafraichirAffichage();

    // Mettre à jour SEULEMENT les boutons d'amélioration sans recréer toute l'interface
    updateUpgradeButtons(item, type);

    // Effet visuel
    const itemDiv = document.getElementById(`${type}-${item.id}`);
    if (itemDiv) {
        itemDiv.style.transform = 'scale(1.1)';
        itemDiv.style.boxShadow = '0 0 20px rgba(255, 102, 0, 0.8)';
        setTimeout(() => {
            itemDiv.style.transform = 'scale(1)';
            itemDiv.style.boxShadow = '';
        }, 500);
    }
}

// Fonction pour mettre à jour seulement les boutons d'amélioration d'un item spécifique
function updateUpgradeButtons(item, type) {
    const itemDiv = document.getElementById(`${type}-${item.id}`);
    if (!itemDiv) return;
    
    const upgradeContainer = itemDiv.querySelector('.upgrade-buttons');
    if (!upgradeContainer) return;
    
    // Recréer les boutons d'amélioration
    upgradeContainer.innerHTML = '';

    PALIERS_AMELIORATION.forEach(palier => {
        upgradeContainer.appendChild(createUpgradeButton(item, palier, type));
    });
}

// Fonction pour mettre à jour tous les boutons d'amélioration
function updateAllUpgradeButtons() {
    // Mettre à jour les boutons des fermes
    if (typeof farms !== 'undefined') {
        farms.forEach(farm => {
            if (farm.count > 0) { // Seulement si la ferme est possédée
                updateUpgradeButtons(farm, 'farm');
            }
        });
    }
    
    // Mettre à jour les boutons des outils
    if (typeof tools !== 'undefined') {
        tools.forEach(tool => {
            if (tool.level > 0) { // Seulement si l'outil est possédé
                updateUpgradeButtons(tool, 'tool');
            }
        });
    }
}
