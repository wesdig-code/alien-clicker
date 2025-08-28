// Interface utilisateur et effets visuels

// Fonction pour changer d'onglet
function switchTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Afficher l'onglet sélectionné
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Initialiser l'onglet Wormhole si sélectionné
    if (tabName === 'wormhole') {
        if (typeof updatePrestigeDisplay === 'function') {
            updatePrestigeDisplay();
        }
        if (typeof initializePrestigeUpgrades === 'function') {
            initializePrestigeUpgrades();
        }
    }
}

// Rendre les fonctions accessibles globalement
window.switchTab = switchTab;

// Fonction pour créer des effets de clic
function createClickEffect(x, y) {
    const effectElement = document.createElement('div');
    effectElement.className = 'click-effect';
    effectElement.textContent = '+' + clickPower;
    effectElement.style.left = x + 'px';
    effectElement.style.top = y + 'px';
    
    document.body.appendChild(effectElement);
    
    // Supprimer l'élément après l'animation
    setTimeout(() => {
        if (effectElement.parentNode) {
            effectElement.parentNode.removeChild(effectElement);
        }
    }, 1000);
}

// Fonction pour mettre à jour les statistiques de sauvegarde
function updateSaveStats() {
    // Mettre à jour les éléments individuels s'ils existent
    const currentScore = document.getElementById('current-score');
    const totalScoreEarned = document.getElementById('total-score-earned');
    const totalScoreSpent = document.getElementById('total-score-spent');
    const currentPs = document.getElementById('current-ps');
    const currentPc = document.getElementById('current-pc');
    const totalFarms = document.getElementById('total-farms');
    const totalTools = document.getElementById('total-tools');
    
    if (currentScore) currentScore.textContent = Math.floor(score).toLocaleString();
    if (totalScoreEarned) totalScoreEarned.textContent = Math.floor(window.totalScoreEarned || 0).toLocaleString();
    
    // Calculer le score dépensé (total gagné - score actuel)
    if (totalScoreSpent) {
        const spent = Math.max(0, (window.totalScoreEarned || 0) - score);
        totalScoreSpent.textContent = Math.floor(spent).toLocaleString();
    }
    
    if (currentPs) currentPs.textContent = formatNumber(scorePerSecond);
    if (currentPc) currentPc.textContent = formatNumber(clickPower);
    
    if (totalFarms) {
        const farmCount = farms.reduce((sum, farm) => sum + farm.count, 0);
        totalFarms.textContent = farmCount.toLocaleString();
    }
    
    if (totalTools) {
        const toolCount = tools.reduce((sum, tool) => sum + tool.level, 0);
        totalTools.textContent = toolCount.toLocaleString();
    }
}
