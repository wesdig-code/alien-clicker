// Logique principale du jeu Phaser et interface

function preload() {
    // Ajouter des styles CSS pour l'alien via JavaScript
    const style = document.createElement('style');
    style.textContent = `
        canvas {
            cursor: default;
        }
        canvas:hover {
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

function create() {
    console.log('🎮 Démarrage de la fonction create()');
    
    // Initialiser les propriétés manquantes des objets
    console.log('🔧 Initialisation des propriétés...');
    initializeUpgradeProperties();
    
    console.log('📊 Création des textes Phaser...');
    scoreText = this.add.text(20, 20, 'Entropie: 0', { fontSize: '32px', fill: '#fff' });
    scorePerSecondText = this.add.text(20, 60, 'Entropie/sec: 0', { fontSize: '18px', fill: '#00ff88' });
    
    // Ajouter l'affichage des points par clic
    const clickPowerText = this.add.text(20, 90, 'Entropie/clic: 1', { fontSize: '18px', fill: '#ff8800' });
    // Rendre accessible globalement
    window.clickPowerText = clickPowerText;

    // Les textes HUD sont maintenant affichés dans un panel HTML dédié
    scoreText.setVisible(false);
    scorePerSecondText.setVisible(false);
    clickPowerText.setVisible(false);
    
    // Créer la zone cliquable HTML au lieu du cercle Phaser
    console.log('👽 Création de la zone alien...');
    createAlienClickArea();
    initializeCenterHarvestPanel();

    // Initialiser les fermes et outils dans l'interface
    console.log('🛸 Initialisation des fermes...');
    setTimeout(() => {
        initializeFarms();
    }, 100);
    
    console.log('🔧 Initialisation des outils...');
    setTimeout(() => {
        initializeTools();
    }, 200);
    
    // Timer pour la production automatique
    console.log('⏰ Démarrage du timer automatique...');
    this.time.addEvent({
        delay: 1000,
        callback: generateAutomaticScore,
        loop: true
    });
    
    console.log('✅ Initialisation terminée !');
}

function updateEntropyPanel() {
    const panel = document.getElementById('entropy-panel');
    const currentEntropy = document.getElementById('entropy-current');
    const entropyPerSec = document.getElementById('entropy-per-sec');
    const entropyPerClick = document.getElementById('entropy-per-click');

    if (!panel || !currentEntropy || !entropyPerSec || !entropyPerClick) return;

    panel.classList.remove('hidden');
    currentEntropy.textContent = formatNumber(score);
    entropyPerSec.textContent = formatNumber(scorePerSecond);
    entropyPerClick.textContent = formatNumber(clickPower);
}

function initializeCenterHarvestPanel() {
    const gameDiv = document.getElementById('game');
    if (!gameDiv) return;

    if (document.getElementById('center-harvest-panel')) {
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'center-harvest-panel';
    panel.className = 'center-harvest-panel';
    panel.innerHTML = `
        <div id="center-harvest-title" class="center-harvest-title">Planète</div>
        <div class="center-harvest-progress">
            <div id="center-harvest-bar" class="center-harvest-bar"></div>
        </div>
        <div id="center-harvest-text" class="center-harvest-text">Récolte: 0 / 0 Entropie</div>
    `;

    gameDiv.appendChild(panel);
}

function updateCenterHarvestPanel() {
    const titleElement = document.getElementById('center-harvest-title');
    const textElement = document.getElementById('center-harvest-text');
    const barElement = document.getElementById('center-harvest-bar');

    if (!titleElement || !textElement || !barElement) return;
    if (typeof getCurrentPlanet !== 'function') return;

    const currentPlanet = getCurrentPlanet();
    if (!currentPlanet) return;

    const harvested = window.planetHarvested?.[currentPlanet.id] || 0;
    const cap = currentPlanet.harvestCap || 0;
    const percent = cap > 0 ? Math.min(100, (harvested / cap) * 100) : 0;

    titleElement.textContent = `${currentPlanet.emoji} ${currentPlanet.name}`;
    textElement.textContent = `Récolte: ${formatNumber(harvested)} / ${formatNumber(cap)} Entropie`;
    barElement.style.width = `${percent.toFixed(2)}%`;
}

function createAlienClickArea() {
    const gameDiv = document.getElementById('game');
    
    const alienArea = document.createElement('div');
    alienArea.className = 'alien-click-area';
    alienArea.innerHTML = '👽';
    
    alienArea.addEventListener('click', (event) => {
        // Calculer les points avec le multiplicateur des drops
        const basePoints = clickPower;
        const multiplier = typeof getCurrentScoreMultiplier === 'function' ? getCurrentScoreMultiplier() : 1;
        const finalPoints = Math.floor(basePoints * multiplier);
        const planetAdjustedPoints = typeof applyPlanetHarvestCap === 'function'
            ? applyPlanetHarvestCap(finalPoints)
            : finalPoints;
        
        score += planetAdjustedPoints;
        window.totalScoreEarned += planetAdjustedPoints;
        
        // Gérer les drops d'items
        if (typeof handleClickDrop === 'function') {
            handleClickDrop(event.clientX, event.clientY);
        }
        
        updateDisplay();
        createClickEffect(event.clientX, event.clientY);
        
        // Animation de clic
        alienArea.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => {
            alienArea.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 150);
    });
    
    // Positionner la zone alien au centre du canvas
    gameDiv.style.position = 'relative';
    gameDiv.appendChild(alienArea);
}

function update() {
    // À compléter pour des fonctionnalités avancées
}

function updateDisplay() {
    scoreText.setText('Entropie: ' + Math.floor(score));
    scorePerSecondText.setText('Entropie/sec: ' + scorePerSecond);
    
    // Mettre à jour l'affichage des points par clic
    if (window.clickPowerText) {
        window.clickPowerText.setText('Entropie/clic: ' + clickPower);
    }
    
    updateFarmsDisplay();
    updateToolsDisplay(); // Mettre à jour l'affichage des outils aussi
    updateSaveStats(); // Mettre à jour les statistiques de sauvegarde
    
    // Mettre à jour les boutons d'amélioration
    if (typeof updateAllUpgradeButtons === 'function') {
        updateAllUpgradeButtons();
    }

    if (typeof renderGalaxyMap === 'function') {
        renderGalaxyMap();
    }

    updateEntropyPanel();
    updateCenterHarvestPanel();

}
