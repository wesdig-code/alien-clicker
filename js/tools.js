// Gestion des outils

// Ce qui distingue la boutique des outils de celle des fermes
const OPTIONS_BOUTIQUE_OUTILS = {
    classeNiveau: 'tool-level',
    classeValeur: 'tool-power',
    niveau: tool => tool.level,
    texteValeur: tool => `Puissance: +${formatNumber(getToolPower(tool))}/clic`,
    onAchat: (tool, quantite) => buyTool(tool, quantite)
};

// Dernier outil affiché : tous ceux possédés, plus le prochain à débloquer
function getDernierOutilVisible() {
    const prochainOutil = tools.findIndex(tool => tool.level === 0);
    return prochainOutil === -1 ? tools.length - 1 : prochainOutil;
}

function initializeTools() {
    const container = document.getElementById('tool-container');

    if (!container) {
        console.error('Container tool-container introuvable');
        return;
    }

    container.innerHTML = ''; // Vider le container

    const dernierOutil = getDernierOutilVisible();
    for (let i = 0; i <= dernierOutil; i++) {
        container.appendChild(creerLigneBoutique(tools[i], 'tool', OPTIONS_BOUTIQUE_OUTILS));
    }

    updateToolsDisplay();
}

function getToolCost(tool) {
    return Math.floor(tool.baseCost * Math.pow(1.5, tool.level));
}

// Puissance de clic apportée par un outil, arrondie à 2 décimales
function getToolPower(tool) {
    return Math.floor(tool.basePower * tool.level * tool.multiplier * 100) / 100;
}

function buyTool(tool, quantity = 1) {
    const totalCost = calculateBulkCost(tool, quantity, 'tool');

    if (score >= totalCost) {
        score -= totalCost;
        tool.level += quantity;
        updateClickPower();
        rafraichirAffichage();

        // Un palier d'amélioration vient peut-être d'être atteint : les boutons
        // d'amélioration ne sont plus rafraîchis par le tick, il faut le faire ici.
        if (typeof updateUpgradeButtons === 'function') {
            updateUpgradeButtons(tool, 'tool');
        }

        // Effet visuel
        const toolDiv = document.getElementById(`tool-${tool.id}`);
        if (toolDiv) {
            toolDiv.style.transform = 'scale(1.1)';
            setTimeout(() => {
                toolDiv.style.transform = 'scale(1)';
            }, 200);
        }

        // Recréer l'affichage seulement si un nouvel outil devient disponible
        const nextToolIndex = tools.findIndex(t => t.level === 0);
        if (nextToolIndex !== -1 && !document.getElementById(`tool-${tools[nextToolIndex].id}`)) {
            if (typeof refreshShop === 'function') {
                refreshShop();
            } else {
                initializeTools();
            }
        }
    }
}

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
function updateClickPower() {
    const puissanceOutils = tools.reduce((total, tool) => {
        return total + (tool.basePower * tool.level * tool.multiplier);
    }, 0);

    const baseClickPower = 1 + puissanceOutils + getFlatClickBonus();

    // Appliquer le multiplicateur de prestige des outils
    const toolMultiplier = typeof getToolMultiplier === 'function' ? getToolMultiplier() : 1;
    const researchMultiplier = typeof getResearchClickMultiplier === 'function' ? getResearchClickMultiplier() : 1;
    const planetMultiplier = typeof getPlanetClickMultiplier === 'function' ? getPlanetClickMultiplier() : 1;
    clickPower = baseClickPower * toolMultiplier * researchMultiplier * planetMultiplier;
}

function updateToolsDisplay() {
    const dernierOutil = getDernierOutilVisible();

    // Mettre à jour seulement les outils visibles
    for (let i = 0; i <= dernierOutil; i++) {
        majLigneBoutique(tools[i], 'tool', OPTIONS_BOUTIQUE_OUTILS);
    }
}

window.getFlatClickBonus = getFlatClickBonus;
window.updateClickPower = updateClickPower;
