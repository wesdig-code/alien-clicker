// Gestion des fermes

// Ce qui distingue la boutique des fermes de celle des outils
const OPTIONS_BOUTIQUE_FERMES = {
    classeNiveau: 'farm-count',
    classeValeur: 'farm-production',
    niveau: farm => farm.count,
    texteValeur: farm => `Production: ${formatNumber(getCurrentProduction(farm))}/sec`,
    onAchat: (farm, quantite) => buyFarm(farm, quantite)
};

// Dernière ferme affichée : toutes celles possédées, plus la prochaine à débloquer
function getDerniereFermeVisible() {
    const prochaineFerme = farms.findIndex(farm => farm.count === 0);
    return prochaineFerme === -1 ? farms.length - 1 : prochaineFerme;
}

function initializeFarms() {
    const container = document.getElementById('farm-container');

    if (!container) {
        console.error('Container farm-container introuvable');
        return;
    }

    container.innerHTML = ''; // Vider le container

    const derniereFerme = getDerniereFermeVisible();
    for (let i = 0; i <= derniereFerme; i++) {
        container.appendChild(creerLigneBoutique(farms[i], 'farm', OPTIONS_BOUTIQUE_FERMES));
    }

    updateFarmsDisplay();
}

function getCurrentCost(farm) {
    return Math.floor(farm.baseCost * Math.pow(1.15, farm.count));
}

function getCurrentProduction(farm) {
    return Math.floor(farm.baseProduction * farm.count * farm.multiplier * 100) / 100; // Arrondir à 2 décimales
}

function buyFarm(farm, quantity = 1) {
    const totalCost = calculateBulkCost(farm, quantity, 'farm');

    if (score >= totalCost) {
        score -= totalCost;
        farm.count += quantity;
        updateScorePerSecond();
        rafraichirAffichage();

        // Un palier d'amélioration vient peut-être d'être atteint : les boutons
        // d'amélioration ne sont plus rafraîchis par le tick, il faut le faire ici.
        if (typeof updateUpgradeButtons === 'function') {
            updateUpgradeButtons(farm, 'farm');
        }

        // Recréer l'affichage si une nouvelle ferme devient disponible
        const nextFarmIndex = farms.findIndex(f => f.count === 0);
        if (nextFarmIndex !== -1 && !document.getElementById(`farm-${farms[nextFarmIndex].id}`)) {
            if (typeof refreshShop === 'function') {
                refreshShop();
            } else {
                initializeFarms();
            }
        }
    }
}

function updateScorePerSecond() {
    let baseScorePerSecond = farms.reduce((total, farm) => {
        return total + getCurrentProduction(farm);
    }, 0);

    // Appliquer le multiplicateur de prestige des fermes
    const farmMultiplier = typeof getFarmMultiplier === 'function' ? getFarmMultiplier() : 1;
    const researchMultiplier = typeof getResearchFarmMultiplier === 'function' ? getResearchFarmMultiplier() : 1;
    const planetMultiplier = typeof getPlanetFarmMultiplier === 'function' ? getPlanetFarmMultiplier() : 1;
    scorePerSecond = baseScorePerSecond * farmMultiplier * researchMultiplier * planetMultiplier;
}

// La production passive est créditée par la boucle de jeu (`js/game.js`), qui mesure
// le temps réellement écoulé : ne pas redéfinir `generateAutomaticScore()` ici.

function updateFarmsDisplay() {
    const derniereFerme = getDerniereFermeVisible();

    // Mettre à jour seulement les fermes visibles
    for (let i = 0; i <= derniereFerme; i++) {
        majLigneBoutique(farms[i], 'farm', OPTIONS_BOUTIQUE_FERMES);
    }
}
