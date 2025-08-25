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
    const baseCost = type === 'farm' ? item.baseCost : item.baseCost;
    return baseCost * level * 10; // Coût = coût de base × niveau × 10
}

function buyUpgrade(item, level, type) {
    const upgradeCost = getUpgradeCost(item, level, type);
    const upgradeKey = `level${level}`;
    
    console.log(`Tentative d'achat d'amélioration ${type} ${item.name} niveau ${level}`);
    console.log(`Coût: ${upgradeCost}, Score actuel: ${score}`);
    console.log(`Déjà acheté: ${item.upgrades[upgradeKey]}`);
    console.log(`Multiplicateur actuel: ${item.multiplier}`);
    
    if (score >= upgradeCost && !item.upgrades[upgradeKey]) {
        score -= upgradeCost;
        item.upgrades[upgradeKey] = true;
        item.multiplier *= 2; // Double la production
        
        console.log(`✅ Amélioration achetée! Nouveau multiplicateur: ${item.multiplier}`);
        
        if (type === 'farm') {
            updateScorePerSecond();
        } else {
            updateClickPower();
        }
        
        updateDisplay();
        
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
        
        // Déboguer après achat
        setTimeout(() => {
            debugMultipliers();
        }, 200);
    } else {
        console.log(`❌ Impossible d'acheter l'amélioration`);
        if (score < upgradeCost) {
            console.log(`Pas assez de points (besoin de ${upgradeCost - score} de plus)`);
        }
        if (item.upgrades[upgradeKey]) {
            console.log(`Amélioration déjà achetée`);
        }
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
    
    const upgrade10 = createUpgradeButton(item, 10, type);
    const upgrade25 = createUpgradeButton(item, 25, type);
    const upgrade50 = createUpgradeButton(item, 50, type);
    
    upgradeContainer.appendChild(upgrade10);
    upgradeContainer.appendChild(upgrade25);
    upgradeContainer.appendChild(upgrade50);
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
