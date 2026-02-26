// Gestion des fermes

function initializeFarms() {
    console.log('🛸 [FARMS] Début de initializeFarms()');
    const container = document.getElementById('farm-container');
    
    if (!container) {
        console.error('❌ [FARMS] Container farm-container introuvable!');
        return;
    }
    
    console.log('✅ [FARMS] Container trouvé:', container);
    container.innerHTML = ''; // Vider le container
    
    // Trouver la prochaine ferme à débloquer
    let nextFarmIndex = farms.findIndex(farm => farm.count === 0);
    if (nextFarmIndex === -1) nextFarmIndex = farms.length - 1; // Si toutes sont débloquées, montrer la dernière
    
    // Afficher toutes les fermes déjà achetées + la prochaine
    for (let i = 0; i <= nextFarmIndex; i++) {
        const farm = farms[i];
        
        const farmDiv = document.createElement('div');
        farmDiv.className = 'farm-item';
        farmDiv.id = `farm-${farm.id}`;
        
        // Créer les boutons d'achat
        const buyButton1 = document.createElement('button');
        buyButton1.className = 'buy-button main-buy';
        buyButton1.addEventListener('click', () => {
            buyFarm(farm, 1);
        });
        
        const buyButton10 = document.createElement('button');
        buyButton10.className = 'buy-button bulk-buy';
        buyButton10.addEventListener('click', () => {
            buyFarm(farm, 10);
        });
        
        const buyButton25 = document.createElement('button');
        buyButton25.className = 'buy-button bulk-buy';
        buyButton25.addEventListener('click', () => {
            buyFarm(farm, 25);
        });
        
        farmDiv.innerHTML = `
            <div class="farm-name">${farm.name}</div>
            <div class="farm-info">${farm.description}</div>
            <div class="farm-stats">
                <span class="farm-cost">Prochain: ${getCurrentCost(farm)}</span>
                <span class="farm-count">Niveau: ${farm.count}</span>
            </div>
            <div class="farm-production">Production: ${getCurrentProduction(farm).toLocaleString()}/sec</div>
            <div class="farm-multiplier">Multiplicateur: x${Math.floor(farm.multiplier * 100) / 100}</div>
        `;
        
        // Ajouter les boutons d'amélioration
        const upgradeContainer = document.createElement('div');
        upgradeContainer.className = 'upgrade-buttons';
        
        const upgrade10 = createUpgradeButton(farm, 10, 'farm');
        const upgrade25 = createUpgradeButton(farm, 25, 'farm');
        const upgrade50 = createUpgradeButton(farm, 50, 'farm');
        
        upgradeContainer.appendChild(upgrade10);
        upgradeContainer.appendChild(upgrade25);
        upgradeContainer.appendChild(upgrade50);
        
        farmDiv.appendChild(upgradeContainer);
        
        // Container pour les boutons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buy-buttons-container';
        buttonsContainer.appendChild(buyButton1);
        buttonsContainer.appendChild(buyButton10);
        buttonsContainer.appendChild(buyButton25);
        
        farmDiv.appendChild(buttonsContainer);
        container.appendChild(farmDiv);
        console.log(`✅ [FARMS] Ferme ${farm.name} ajoutée au container`);
    }
    
    console.log(`🛸 [FARMS] ${nextFarmIndex + 1} fermes ajoutées`);
    updateFarmsDisplay();
    console.log('🛸 [FARMS] initializeFarms() terminée');
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
        updateDisplay();
        
        // Recréer l'affichage si une nouvelle ferme devient disponible
        const nextFarmIndex = farms.findIndex(f => f.count === 0);
        if (nextFarmIndex !== -1 && !document.getElementById(`farm-${farms[nextFarmIndex].id}`)) {
            initializeFarms();
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
    scorePerSecond = baseScorePerSecond * farmMultiplier * researchMultiplier;
}

function generateAutomaticScore() {
    if (scorePerSecond > 0) {
        score += scorePerSecond;
        window.totalScoreEarned += scorePerSecond; // Tracker le score total
        updateDisplay();
    }
}

function updateFarmsDisplay() {
    // Trouver la prochaine ferme à débloquer pour limiter l'affichage
    let nextFarmIndex = farms.findIndex(farm => farm.count === 0);
    if (nextFarmIndex === -1) nextFarmIndex = farms.length - 1;
    
    // Mettre à jour seulement les fermes visibles
    for (let i = 0; i <= nextFarmIndex; i++) {
        const farm = farms[i];
        const farmDiv = document.getElementById(`farm-${farm.id}`);
        if (!farmDiv) continue; // Si l'élément n'existe pas, passer
        
        const cost1 = getCurrentCost(farm);
        const cost10 = calculateBulkCost(farm, 10, 'farm');
        const cost25 = calculateBulkCost(farm, 25, 'farm');
        
        const canAfford1 = score >= cost1;
        const canAfford10 = score >= cost10;
        const canAfford25 = score >= cost25;
        
        // Mettre à jour les informations
        const costSpan = farmDiv.querySelector('.farm-cost');
        const countSpan = farmDiv.querySelector('.farm-count');
        const productionDiv = farmDiv.querySelector('.farm-production');
        const multiplierDiv = farmDiv.querySelector('.farm-multiplier');
        
        if (costSpan) costSpan.textContent = `Prochain: ${formatNumber(cost1)}`;
        if (countSpan) countSpan.textContent = `Niveau: ${farm.count}`;
        if (productionDiv) productionDiv.textContent = `Production: ${getCurrentProduction(farm).toLocaleString()}/sec`;
        if (multiplierDiv) multiplierDiv.textContent = `Multiplicateur: x${Math.floor(farm.multiplier * 100) / 100}`;
        
        // Récupérer les boutons
        const buttons = farmDiv.querySelectorAll('.buy-button');
        
        // Bouton x1
        if (canAfford1) {
            farmDiv.classList.add('affordable');
            buttons[0].disabled = false;
            buttons[0].textContent = `x1 (${formatNumber(cost1)})`;
        } else {
            farmDiv.classList.remove('affordable');
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
