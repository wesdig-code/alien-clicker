// Fonctions utilitaires

// Fonction pour formater les nombres de manière compacte
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }

    // Pour les nombres inférieurs à 1000, limiter à 2 décimales si nécessaire
    if (num % 1 === 0) {
        // Nombre entier, pas de décimales
        return num.toString();
    } else {
        // Nombre décimal, limiter à 2 décimales
        return num.toFixed(2);
    }
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

// Outil de debug exposé volontairement sur window, jamais appelé par le jeu
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

// Seul point d'entrée légitime pour créditer un gain d'entropie au joueur :
// toute écriture directe sur `score` désynchronise `totalScoreEarned`, qui
// alimente le calcul du prestige. Les dépenses, elles, restent des `score -= x`.
function addScore(amount) {
    window.score += amount;
    window.totalScoreEarned += amount;
}

// Rendre accessible globalement
window.addScore = addScore;

// Rafraîchit l'affichage complet après une action de jeu
function rafraichirAffichage() {
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    } else if (typeof updateHUD === 'function') {
        updateHUD();
    }
}

window.rafraichirAffichage = rafraichirAffichage;

// ---------------------------------------------------------------------------
// Rendu mutualisé des boutiques : fermes et outils partagent la même structure
// ---------------------------------------------------------------------------

// Quantités proposées par les boutons d'achat d'une ligne de boutique
const QUANTITES_ACHAT = [1, 10, 25];

// Paliers des améliorations x2
const PALIERS_AMELIORATION = [10, 25, 50];

// Coûts des achats x1/x10/x25 pour une ferme ou un outil
function calculerCoutsAchat(item, type) {
    return QUANTITES_ACHAT.map(quantite => calculateBulkCost(item, quantite, type));
}

// Construit la ligne de boutique d'une ferme ou d'un outil.
// `type` vaut 'farm' ou 'tool' et pilote les classes CSS / ids attendus par style.css.
// `options` décrit ce qui diffère entre les deux boutiques :
// { classeNiveau, classeValeur, niveau(item), texteValeur(item), onAchat(item, quantite) }
function creerLigneBoutique(item, type, options) {
    const ligne = document.createElement('div');
    ligne.className = `${type}-item`;
    ligne.id = `${type}-${item.id}`;

    ligne.innerHTML = `
        <div class="${type}-name">${item.name}</div>
        <div class="${type}-info">${item.description}</div>
        <div class="${type}-stats">
            <span class="${type}-cost">Prochain: ${formatNumber(calculateBulkCost(item, 1, type))}</span>
            <span class="${options.classeNiveau}">Niveau: ${options.niveau(item)}</span>
        </div>
        <div class="${options.classeValeur}">${options.texteValeur(item)}</div>
        <div class="${type}-multiplier">Multiplicateur: x${Math.floor(item.multiplier * 100) / 100}</div>
    `;

    const upgradeContainer = document.createElement('div');
    upgradeContainer.className = 'upgrade-buttons';
    PALIERS_AMELIORATION.forEach(palier => {
        upgradeContainer.appendChild(createUpgradeButton(item, palier, type));
    });
    ligne.appendChild(upgradeContainer);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buy-buttons-container';
    QUANTITES_ACHAT.forEach((quantite, index) => {
        const bouton = document.createElement('button');
        bouton.className = index === 0 ? 'buy-button main-buy' : 'buy-button bulk-buy';
        bouton.addEventListener('click', () => options.onAchat(item, quantite));
        buttonsContainer.appendChild(bouton);
    });
    ligne.appendChild(buttonsContainer);

    return ligne;
}

// Met à jour libellés et accessibilité des boutons d'achat x1/x10/x25 d'une ligne.
// La classe `affordable` de la ligne suit uniquement l'achat x1.
function majBoutonsAchat(ligne, couts) {
    const boutons = ligne.querySelectorAll('.buy-button');

    QUANTITES_ACHAT.forEach((quantite, index) => {
        const bouton = boutons[index];
        if (!bouton) return;

        bouton.disabled = score < couts[index];
        bouton.textContent = `x${quantite} (${formatNumber(couts[index])})`;
    });

    ligne.classList.toggle('affordable', score >= couts[0]);
}

// Met à jour les valeurs affichées et les boutons d'une ligne de boutique existante
function majLigneBoutique(item, type, options) {
    const ligne = document.getElementById(`${type}-${item.id}`);
    if (!ligne) return;

    const couts = calculerCoutsAchat(item, type);

    const coutSpan = ligne.querySelector(`.${type}-cost`);
    const niveauSpan = ligne.querySelector(`.${options.classeNiveau}`);
    const valeurDiv = ligne.querySelector(`.${options.classeValeur}`);
    const multiplicateurDiv = ligne.querySelector(`.${type}-multiplier`);

    if (coutSpan) coutSpan.textContent = `Prochain: ${formatNumber(couts[0])}`;
    if (niveauSpan) niveauSpan.textContent = `Niveau: ${options.niveau(item)}`;
    if (valeurDiv) valeurDiv.textContent = options.texteValeur(item);
    if (multiplicateurDiv) multiplicateurDiv.textContent = `Multiplicateur: x${Math.floor(item.multiplier * 100) / 100}`;

    majBoutonsAchat(ligne, couts);
}

window.creerLigneBoutique = creerLigneBoutique;
window.majLigneBoutique = majLigneBoutique;
window.majBoutonsAchat = majBoutonsAchat;
window.calculerCoutsAchat = calculerCoutsAchat;
