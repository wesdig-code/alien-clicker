// Gestion des outils

function initializeTools() {
    console.log('🔧 [TOOLS] Début de initializeTools()');
    const container = document.getElementById('tool-container');
    
    if (!container) {
        console.error('❌ [TOOLS] Container tool-container introuvable!');
        return;
    }
    
    console.log('✅ [TOOLS] Container trouvé:', container);
    container.innerHTML = ''; // Vider le container
    
    // Trouver le prochain outil à débloquer
    let nextToolIndex = tools.findIndex(tool => tool.level === 0);
    if (nextToolIndex === -1) nextToolIndex = tools.length - 1; // Si tous sont débloqués, montrer le dernier
    
    // Afficher tous les outils déjà achetés + le prochain
    for (let i = 0; i <= nextToolIndex; i++) {
        const tool = tools[i];
        
        const toolDiv = document.createElement('div');
        toolDiv.className = 'tool-item';
        toolDiv.id = `tool-${tool.id}`;
        
        // Créer les boutons d'achat
        const buyButton1 = document.createElement('button');
        buyButton1.className = 'buy-button main-buy';
        buyButton1.addEventListener('click', () => {
            buyTool(tool, 1);
        });
        
        const buyButton10 = document.createElement('button');
        buyButton10.className = 'buy-button bulk-buy';
        buyButton10.addEventListener('click', () => {
            buyTool(tool, 10);
        });
        
        const buyButton25 = document.createElement('button');
        buyButton25.className = 'buy-button bulk-buy';
        buyButton25.addEventListener('click', () => {
            buyTool(tool, 25);
        });
        
        toolDiv.innerHTML = `
            <div class="tool-name">${tool.name}</div>
            <div class="tool-info">${tool.description}</div>
            <div class="tool-stats">
                <span class="tool-cost">Prochain: ${getToolCost(tool)}</span>
                <span class="tool-level">Niveau: ${tool.level}</span>
            </div>
            <div class="tool-power">Puissance: +${Math.floor(tool.basePower * tool.level * tool.multiplier * 100) / 100}/clic</div>
            <div class="tool-multiplier">Multiplicateur: x${Math.floor(tool.multiplier * 100) / 100}</div>
        `;
        
        // Ajouter les boutons d'amélioration
        const upgradeContainer = document.createElement('div');
        upgradeContainer.className = 'upgrade-buttons';
        
        const upgrade10 = createUpgradeButton(tool, 10, 'tool');
        const upgrade25 = createUpgradeButton(tool, 25, 'tool');
        const upgrade50 = createUpgradeButton(tool, 50, 'tool');
        
        upgradeContainer.appendChild(upgrade10);
        upgradeContainer.appendChild(upgrade25);
        upgradeContainer.appendChild(upgrade50);
        
        toolDiv.appendChild(upgradeContainer);
        
        // Container pour les boutons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buy-buttons-container';
        buttonsContainer.appendChild(buyButton1);
        buttonsContainer.appendChild(buyButton10);
        buttonsContainer.appendChild(buyButton25);
        
        toolDiv.appendChild(buttonsContainer);
        container.appendChild(toolDiv);
        console.log(`✅ [TOOLS] Outil ${tool.name} ajouté au container`);
// Somme des bonus additifs de puissance de clic fournis par les autres systèmes
function getFlatClickBonus() {
    let bonus = 0;
    if (typeof getPrestigeFlatClickBonus === 'function') bonus += getPrestigeFlatClickBonus();
    if (typeof getDropFlatClickBonus === 'function') bonus += getDropFlatClickBonus();
    if (typeof getCollectionFlatClickBonus === 'function') bonus += getCollectionFlatClickBonus();
    return bonus;
}

// Seule source de vérité de `clickPower` : toute autre écriture serait écrasée
// au prochain recalcul (achat d'outil, voyage, recherche...).
    }

    const baseClickPower = 1 + puissanceOutils + getFlatClickBonus();

    console.log(`🔧 [TOOLS] ${nextToolIndex + 1} outils ajoutés`);
    updateToolsDisplay();
    console.log('🔧 [TOOLS] initializeTools() terminée');
}

function getToolCost(tool) {
    return Math.floor(tool.baseCost * Math.pow(1.5, tool.level));
}

function buyTool(tool, quantity = 1) {
    const totalCost = calculateBulkCost(tool, quantity, 'tool');
    
    if (score >= totalCost) {
        score -= totalCost;
        tool.level += quantity;
        updateClickPower();
        updateDisplay();
        

window.getFlatClickBonus = getFlatClickBonus;
window.updateClickPower = updateClickPower;
        // Effet visuel
        const toolDiv = document.getElementById(`tool-${tool.id}`);
        toolDiv.style.transform = 'scale(1.1)';
        setTimeout(() => {
            toolDiv.style.transform = 'scale(1)';
        }, 200);
        
        // Réinitialiser l'affichage pour débloquer le prochain outil
        setTimeout(() => {
            initializeTools();
        }, 300);
    }
}

function updateClickPower() {
    const puissanceOutils = tools.reduce((total, tool) => {
        return total + (tool.basePower * tool.level * tool.multiplier);
    }, 0);
    
    // Appliquer le multiplicateur de prestige des outils
    const toolMultiplier = typeof getToolMultiplier === 'function' ? getToolMultiplier() : 1;
    const researchMultiplier = typeof getResearchClickMultiplier === 'function' ? getResearchClickMultiplier() : 1;
    const planetMultiplier = typeof getPlanetClickMultiplier === 'function' ? getPlanetClickMultiplier() : 1;
    clickPower = baseClickPower * toolMultiplier * researchMultiplier * planetMultiplier;
}

function updateToolsDisplay() {
    // Trouver le prochain outil à débloquer pour limiter l'affichage
    let nextToolIndex = tools.findIndex(tool => tool.level === 0);
    if (nextToolIndex === -1) nextToolIndex = tools.length - 1;
    
    // Mettre à jour seulement les outils visibles
    for (let i = 0; i <= nextToolIndex; i++) {
        const tool = tools[i];
        const toolDiv = document.getElementById(`tool-${tool.id}`);
        if (!toolDiv) continue; // Si l'élément n'existe pas, passer
        
        const cost1 = getToolCost(tool);
        const cost10 = calculateBulkCost(tool, 10, 'tool');
        const cost25 = calculateBulkCost(tool, 25, 'tool');
        
        const canAfford1 = score >= cost1;
        const canAfford10 = score >= cost10;
        const canAfford25 = score >= cost25;
        
        // Mettre à jour les informations
        const costSpan = toolDiv.querySelector('.tool-cost');
        const levelSpan = toolDiv.querySelector('.tool-level');
        const powerDiv = toolDiv.querySelector('.tool-power');
        const multiplierDiv = toolDiv.querySelector('.tool-multiplier');
        
        if (costSpan) costSpan.textContent = `Prochain: ${formatNumber(cost1)}`;
        if (levelSpan) levelSpan.textContent = `Niveau: ${tool.level}`;
        if (powerDiv) powerDiv.textContent = `Puissance: +${Math.floor(tool.basePower * tool.level * tool.multiplier * 100) / 100}/clic`;
        if (multiplierDiv) multiplierDiv.textContent = `Multiplicateur: x${Math.floor(tool.multiplier * 100) / 100}`;
        
        // Récupérer les boutons
        const buttons = toolDiv.querySelectorAll('.buy-button');
        
        // Bouton x1
        if (canAfford1) {
            toolDiv.classList.add('affordable');
            buttons[0].disabled = false;
            buttons[0].textContent = `x1 (${formatNumber(cost1)})`;
        } else {
            toolDiv.classList.remove('affordable');
            buttons[0].disabled = true;
            buttons[0].textContent = `x1 (${formatNumber(cost1)})`;
        }
        
        // Bouton x10
        if (canAfford10) {
            buttons[1].disabled = false;
            buttons[1].textContent = `x10 (${formatNumber(cost10)})`;
        } else {
            buttons[1].disabled = true;
            buttons[1].textContent = `x10 (${formatNumber(cost10)})`;
        }
        
        // Bouton x25
        if (canAfford25) {
            buttons[2].disabled = false;
            buttons[2].textContent = `x25 (${formatNumber(cost25)})`;
        } else {
            buttons[2].disabled = true;
            buttons[2].textContent = `x25 (${formatNumber(cost25)})`;
        }
    }
}
