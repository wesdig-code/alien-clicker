// Fonctions utilitaires

// Fonction pour formater les nombres de manière compacte
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Fonction pour calculer le coût en gros (bulk buying)
function calculateBulkCost(item, quantity, type) {
    let totalCost = 0;
    let currentCost;
    
    for (let i = 0; i < quantity; i++) {
        if (type === 'farm') {
            currentCost = item.baseCost * Math.pow(1.15, item.count + i);
        } else {
            currentCost = item.baseCost * Math.pow(1.5, item.level + i);
        }
        totalCost += currentCost;
    }
    
    return Math.floor(totalCost);
}

// Fonction pour initialiser les propriétés manquantes
function initializeUpgradeProperties() {
    farms.forEach(farm => {
        if (!farm.upgrades) {
            farm.upgrades = {
                level10: false,
                level25: false,
                level50: false
            };
        }
        if (!farm.multiplier) {
            farm.multiplier = 1;
        }
    });
    
    tools.forEach(tool => {
        if (!tool.upgrades) {
            tool.upgrades = {
                level10: false,
                level25: false,
                level50: false
            };
        }
        if (!tool.multiplier) {
            tool.multiplier = 1;
        }
    });
}

// Fonction pour déboguer les multiplicateurs
function debugMultipliers() {
    console.log('=== Debug Multiplicateurs ===');
    farms.forEach(farm => {
        if (farm.count > 0) {
            console.log(`Farm ${farm.name}: count=${farm.count}, multiplier=${farm.multiplier}, production=${getCurrentProduction(farm)}`);
        }
    });
    tools.forEach(tool => {
        if (tool.level > 0) {
            console.log(`Tool ${tool.name}: level=${tool.level}, multiplier=${tool.multiplier}, power=${tool.basePower * tool.level * tool.multiplier}`);
        }
    });
    console.log(`Score per second: ${scorePerSecond}`);
    console.log(`Click power: ${clickPower}`);
}

// Rendre la fonction de debug accessible globalement pour les tests
window.debugMultipliers = debugMultipliers;

// Fonction utilitaire pour ajouter du score et tracker le total
function addScore(amount) {
    window.score += amount;
    window.totalScoreEarned += amount;
}

// Rendre accessible globalement
window.addScore = addScore;
