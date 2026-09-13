// Boucle de jeu, zone de clic et rafraîchissement du HUD (rendu DOM, sans moteur externe)

const DELTA_TICK_MAX_SECONDES = 60; // borne de sécurité si l'horloge système saute
const INTERVALLE_TICK_MS = 1000;

let boucleEntropieId = null;
let dernierTickAt = 0;
let dernierePlaneteImage = '';
let derniereEtiquettePlanete = '';

// --- Crédit d'entropie ---------------------------------------------------

function ajouterEntropie(montant) {
    if (!(montant > 0)) return;

    if (typeof addScore === 'function') {
        addScore(montant);
        return;
    }

    // Filet de sécurité si addScore n'est pas disponible
    score += montant;
    window.totalScoreEarned = (window.totalScoreEarned || 0) + montant;
}

function crediterProductionPassive(secondesEcoulees) {
    if (!(scorePerSecond > 0) || !(secondesEcoulees > 0)) return 0;

    const gainBrut = scorePerSecond * secondesEcoulees;
    const gainReel = typeof applyPlanetHarvestCap === 'function'
        ? applyPlanetHarvestCap(gainBrut)
        : gainBrut;

    ajouterEntropie(gainReel);
    return gainReel;
}

// Conservée pour compatibilité : crédite une seconde de production passive
function generateAutomaticScore() {
    const gain = crediterProductionPassive(1);
    if (gain > 0) {
        updateDisplay();
    }
    return gain;
}

// --- Boucle de jeu -------------------------------------------------------

function tickBoucleJeu() {
    const maintenant = Date.now();

    // Les navigateurs throttlent les timers des onglets en arrière-plan :
    // on crédite le temps réellement écoulé plutôt qu'un tick fixe.
    const secondesEcoulees = Math.min(
        DELTA_TICK_MAX_SECONDES,
        Math.max(0, (maintenant - dernierTickAt) / 1000)
    );

    dernierTickAt = maintenant;
    window.lastTickAt = maintenant;

    if (crediterProductionPassive(secondesEcoulees) > 0) {
        updateDisplay();
    } else {
        updateHUD();
    }
}

function demarrerBoucleJeu() {
    if (boucleEntropieId !== null) return;

    synchroniserHorlogeJeu();
    boucleEntropieId = setInterval(tickBoucleJeu, INTERVALLE_TICK_MS);
}

function synchroniserHorlogeJeu() {
    dernierTickAt = Date.now();
    window.lastTickAt = dernierTickAt;
}

function arreterBoucleJeu() {
    if (boucleEntropieId === null) return;

    clearInterval(boucleEntropieId);
    boucleEntropieId = null;
}

// --- Zone de clic --------------------------------------------------------

function triggerAlienClick(clientX, clientY) {
    const alienArea = document.getElementById('alien-click-area');

    let x = clientX;
    let y = clientY;
    if (typeof x !== 'number' || typeof y !== 'number') {
        if (alienArea) {
            const zone = alienArea.getBoundingClientRect();
            x = zone.left + zone.width / 2;
            y = zone.top + zone.height / 2;
        } else {
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }
    }

    const multiplicateur = typeof getCurrentScoreMultiplier === 'function' ? getCurrentScoreMultiplier() : 1;
    // Arrondi au minimum à 1 : certaines planètes ont un multiplicateur < 1 qui donnerait 0 par clic
    const gainBrut = Math.max(1, Math.round(clickPower * multiplicateur));
    const gainReel = typeof applyPlanetHarvestCap === 'function'
        ? applyPlanetHarvestCap(gainBrut)
        : gainBrut;

    ajouterEntropie(gainReel);

    if (typeof handleClickDrop === 'function') {
        handleClickDrop(x, y);
    }

    updateDisplay();
    createClickEffect(x, y, gainReel);

    if (alienArea) {
        alienArea.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => {
            alienArea.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 150);
    }

    return gainReel;
}

function createAlienClickArea() {
    const gameDiv = document.getElementById('game');
    if (!gameDiv || document.getElementById('alien-click-area')) return;

    const alienArea = document.createElement('button');
    alienArea.type = 'button';
    alienArea.id = 'alien-click-area';
    alienArea.className = 'alien-click-area';
    alienArea.style.padding = '0';
    alienArea.setAttribute('aria-label', "Récolter de l'entropie");

    alienArea.addEventListener('click', (event) => {
        // detail === 0 : clic déclenché au clavier (Entrée / Espace), sans coordonnées utilisables
        const auClavier = event.detail === 0;
        triggerAlienClick(auClavier ? undefined : event.clientX, auClavier ? undefined : event.clientY);
    });

    gameDiv.style.position = 'relative';
    gameDiv.appendChild(alienArea);
    updateAlienClickAreaVisual();
}

function getCurrentPlanetImagePath() {
    if (Array.isArray(window.galaxyPlanets) && window.galaxyPlanets.length > 0) {
        const currentPlanetId = window.currentPlanetId || 'orbita_prime';
        const index = window.galaxyPlanets.findIndex(planet => planet.id === currentPlanetId);
        const safeIndex = index >= 0 ? index : 0;
        const imageNumber = String(safeIndex % 10).padStart(2, '0');
        return `assets/planet${imageNumber}.png`;
    }

    return 'assets/planet00.png';
}

function updateAlienClickAreaVisual() {
    const alienArea = document.getElementById('alien-click-area');
    if (!alienArea) return;

    // On ne réécrit le style que si la planète a changé, sinon l'image est rechargée à chaque tick
    const imagePath = getCurrentPlanetImagePath();
    if (imagePath !== dernierePlaneteImage) {
        alienArea.style.backgroundImage = `url("${imagePath}")`;
        dernierePlaneteImage = imagePath;
    }

    const planete = typeof getCurrentPlanet === 'function' ? getCurrentPlanet() : null;
    const etiquette = planete
        ? `Récolter de l'entropie sur ${planete.name}`
        : "Récolter de l'entropie";

    if (etiquette !== derniereEtiquettePlanete) {
        alienArea.setAttribute('aria-label', etiquette);
        derniereEtiquettePlanete = etiquette;
    }
}

// --- Panneaux HUD --------------------------------------------------------

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

// --- Rafraîchissements ---------------------------------------------------

// Rafraîchissement léger : appelable plusieurs fois par seconde
function updateHUD() {
    updateEntropyPanel();
    updateCenterHarvestPanel();
    updateAlienClickAreaVisual();

    if (typeof updateSaveStats === 'function') {
        updateSaveStats();
    }
}

// Reconstruction complète des boutiques : uniquement après un achat ou un chargement
function refreshShop() {
    if (typeof initializeFarms === 'function') {
        initializeFarms();
    }
    if (typeof initializeTools === 'function') {
        initializeTools();
    }
    if (typeof updateAllUpgradeButtons === 'function') {
        updateAllUpgradeButtons();
    }
}

function refreshGalaxy() {
    if (typeof renderGalaxyMap === 'function') {
        renderGalaxyMap();
    }
    updateAlienClickAreaVisual();
}

function isGalaxyTabActive() {
    const galaxyTab = document.getElementById('galaxy-tab');
    return !!galaxyTab && galaxyTab.classList.contains('active');
}

function updateDisplay() {
    updateHUD();

    if (typeof updateFarmsDisplay === 'function') {
        updateFarmsDisplay();
    }
    if (typeof updateToolsDisplay === 'function') {
        updateToolsDisplay();
    }

    const prestigeTab = document.getElementById('wormhole-tab');
    if (prestigeTab?.classList.contains('active') && typeof updatePrestigeDisplay === 'function') {
        updatePrestigeDisplay();
    }
    if (typeof updateCollectionAffordability === 'function') updateCollectionAffordability();

    // La carte conserve ses nœuds, et n'a besoin d'être actualisée que si elle est visible.
    if (isGalaxyTabActive()) {
        refreshGalaxy();
    }
}

window.triggerAlienClick = triggerAlienClick;
window.updateHUD = updateHUD;
window.refreshShop = refreshShop;
window.refreshGalaxy = refreshGalaxy;
window.updateDisplay = updateDisplay;
window.generateAutomaticScore = generateAutomaticScore;
window.demarrerBoucleJeu = demarrerBoucleJeu;
window.arreterBoucleJeu = arreterBoucleJeu;
