// Système de sauvegarde et chargement

const SAVE_VERSION = "1.4";
const AUTO_SAVE_KEY = 'alienClickerSave';
const AUTO_SAVE_INTERVAL_MS = 15000;
// Plafond de progression hors-ligne : 8 heures (choix d'équilibrage)
const OFFLINE_MAX_SECONDS = 8 * 60 * 60;

// Entropie totale déjà convertie en Stardust (empêche de reconvertir la même entropie)
window.totalScoreConverted = window.totalScoreConverted || 0;

let autoSaveInterval = null;

// Réinitialisation unifiée d'une partie.
// options.keepPrestige : conserve stardust, prestigeUpgrades, collectedItems, itemLevels et totalScoreEarned
function resetRunState(options = {}) {
    const keepPrestige = options.keepPrestige === true;

    if (typeof resetTemporaryEffects === 'function') resetTemporaryEffects();

    window.score = 0;
    window.scorePerSecond = 0;
    window.clickPower = 1;

    if (!keepPrestige) {
        window.totalScoreEarned = 0;
        window.totalScoreConverted = 0;
        window.stardust = 0;

        if (Array.isArray(window.prestigeUpgrades)) {
            window.prestigeUpgrades.forEach(upgrade => {
                upgrade.level = 0;
            });
        }

        if (Array.isArray(window.collectedItems)) {
            window.collectedItems.length = 0;
        }
        if (window.itemLevels && typeof window.itemLevels === 'object') {
            Object.keys(window.itemLevels).forEach(key => delete window.itemLevels[key]);
        }
    }

    if (typeof farms !== 'undefined') {
        farms.forEach(farm => {
            farm.count = 0;
            farm.multiplier = 1;
            if (farm.upgrades) {
                farm.upgrades = { level10: false, level25: false, level50: false };
            }
        });
    }

    if (typeof tools !== 'undefined') {
        tools.forEach(tool => {
            tool.level = 0;
            tool.multiplier = 1;
            if (tool.upgrades) {
                tool.upgrades = { level10: false, level25: false, level50: false };
            }
        });
    }

    // Laboratoire
    if (Array.isArray(window.unlockedResearch)) {
        window.unlockedResearch.length = 0;
    }
    window.researchPoints = 0;
    window.activeResearch = null;

    // Carte galactique : les seuils de recherche peuvent de nouveau être récompensés.
    window.currentPlanetId = 'orbita_prime';
    window.currentSystemId = 'core_sector';
    window.visitedPlanets = ['orbita_prime'];
    if (typeof resetPlanetHarvest === 'function') {
        resetPlanetHarvest();
    } else {
        window.planetHarvested = { orbita_prime: 0 };
        window.claimedPlanetResearchRewards = [];
    }

    // Les bonus des items permanents vivent dans les multiplicateurs remis à 1 ci-dessus
    if (typeof reapplyCollectionBonuses === 'function') {
        reapplyCollectionBonuses();
    }

    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }
    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }
    if (typeof updateCollectionDisplay === 'function') updateCollectionDisplay();
    if (typeof renderLaboratoryTree === 'function') renderLaboratoryTree();
    if (typeof synchroniserHorlogeJeu === 'function') synchroniserHorlogeJeu();
}

// Construit un état complet indépendant du fichier et de la partie courante.
// Aucune mutation ni aucun timer avant que toutes les données aient été validées.
function normalizeGameData(data) {
    const invalid = field => { throw new Error(`Sauvegarde invalide : ${field}`); };
    const record = (value, field) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(field);
        return value;
    };
    const number = (value, fallback, field, integer = false, max = Infinity) => {
        if (value === undefined) return fallback;
        if (!Number.isFinite(value) || value < 0 || value > max || (integer && !Number.isSafeInteger(value))) invalid(field);
        return value;
    };
    const ids = (value, definitions, field) => {
        if (value === undefined) return [];
        if (!Array.isArray(value)) invalid(field);
        value.forEach(id => {
            if (typeof id !== 'string' || !definitions.some(item => item.id === id)) invalid(field);
        });
        return [...new Set(value)];
    };
    const records = (value, definitions, field) => {
        if (value === undefined) return new Map();
        if (!Array.isArray(value)) invalid(field);
        const result = new Map();
        value.forEach(entry => {
            record(entry, field);
            if (!definitions.some(item => item.id === entry.id) || result.has(entry.id)) invalid(field);
            result.set(entry.id, entry);
        });
        return result;
    };
    const shopItems = (value, definitions, field, quantityKey) => {
        const saved = records(value, definitions, field);
        return definitions.map(item => {
            const entry = saved.get(item.id) || {};
            const upgrades = entry.upgrades === undefined ? {} : record(entry.upgrades, `${field}.upgrades`);
            number(entry.multiplier, 1, `${field}.multiplier`);
            return {
                id: item.id,
                [quantityKey]: number(entry[quantityKey], 0, `${field}.${quantityKey}`, true),
                upgrades: Object.fromEntries(PALIERS_AMELIORATION.map(level => {
                    const key = `level${level}`;
                    if (upgrades[key] !== undefined && typeof upgrades[key] !== 'boolean') invalid(`${field}.upgrades.${key}`);
                    return [key, upgrades[key] === true];
                }))
            };
        });
    };

    record(data, 'format');
    if (data.version !== undefined && !['1.3', SAVE_VERSION].includes(data.version)) invalid('version non prise en charge');
    if (data.score === undefined) invalid('score manquant');
    const score = number(data.score, 0, 'score');
    const totalScoreEarned = Math.max(score, number(data.totalScoreEarned, score, 'totalScoreEarned'));
    number(data.clickPower, 1, 'clickPower');
    number(data.scorePerSecond, 0, 'scorePerSecond');

    const collected = ids(data.collectedItems, permanentItems, 'collectedItems');
    const levels = data.itemLevels === undefined ? {} : record(data.itemLevels, 'itemLevels');
    Object.entries(levels).forEach(([id, level]) => {
        if (!permanentItems.some(item => item.id === id) || number(level, 1, 'itemLevels', true, 50) < 1) invalid('itemLevels');
    });
    const research = ids(data.unlockedResearch, laboratoryResearchTree, 'unlockedResearch');
    let activeResearch = null;
    if (data.activeResearch !== undefined && data.activeResearch !== null) {
        const active = record(data.activeResearch, 'activeResearch');
        ids([active.id], laboratoryResearchTree, 'activeResearch.id');
        const startAt = number(active.startAt, 0, 'activeResearch.startAt');
        const endAt = number(active.endAt, 0, 'activeResearch.endAt');
        if (startAt <= 0 || endAt <= startAt) invalid('activeResearch.durée');
        if (!research.includes(active.id)) activeResearch = { id: active.id, startAt, endAt };
    }

    const planetId = data.currentPlanetId === undefined ? 'orbita_prime' : data.currentPlanetId;
    ids([planetId], galaxyPlanets, 'currentPlanetId');
    const systemId = data.currentSystemId === undefined ? getPlanetById(planetId).systemId : data.currentSystemId;
    ids([systemId], galaxySystems, 'currentSystemId');
    const harvested = data.planetHarvested === undefined ? {} : record(data.planetHarvested, 'planetHarvested');
    Object.entries(harvested).forEach(([id, amount]) => {
        ids([id], galaxyPlanets, 'planetHarvested.id');
        number(amount, 0, 'planetHarvested');
    });
    const savedPrestige = records(data.prestigeUpgrades, prestigeUpgrades, 'prestigeUpgrades');
    return {
        score,
        totalScoreEarned,
        totalScoreConverted: number(data.totalScoreConverted, 0, 'totalScoreConverted', false, totalScoreEarned),
        stardust: number(data.stardust, 0, 'stardust'),
        lastSeenAt: number(data.lastSeenAt, 0, 'lastSeenAt'),
        prestigeUpgrades: prestigeUpgrades.map(upgrade => ({
            id: upgrade.id,
            level: number(savedPrestige.get(upgrade.id)?.level, 0, 'prestigeUpgrades.level', true, upgrade.maxLevel)
        })),
        collectedItems: collected,
        itemLevels: Object.fromEntries(collected.map(id => [id, levels[id] || 1])),
        unlockedResearch: research,
        researchPoints: number(data.researchPoints, 0, 'researchPoints', true),
        activeResearch,
        currentPlanetId: planetId,
        currentSystemId: systemId,
        visitedPlanets: [...new Set([...ids(data.visitedPlanets, galaxyPlanets, 'visitedPlanets'), planetId])],
        planetHarvested: Object.fromEntries(galaxyPlanets.map(planet => [planet.id, harvested[planet.id] || 0])),
        claimedPlanetResearchRewards: ids(data.claimedPlanetResearchRewards, galaxyPlanets, 'claimedPlanetResearchRewards'),
        farms: shopItems(data.farms, farms, 'farms', 'count'),
        tools: shopItems(data.tools, tools, 'tools', 'level')
    };
}

function applyLoadedGameData(gameData, options = {}) {
    const data = normalizeGameData(gameData);
    const refreshUI = options.refreshUI !== false;

    resetTemporaryEffects();
    for (const key of ['score', 'totalScoreEarned', 'totalScoreConverted', 'stardust', 'researchPoints',
        'activeResearch', 'currentPlanetId', 'currentSystemId', 'visitedPlanets', 'planetHarvested', 'claimedPlanetResearchRewards']) {
        window[key] = data[key];
    }
    window.collectedItems.length = 0;
    window.collectedItems.push(...data.collectedItems);
    Object.keys(window.itemLevels).forEach(key => delete window.itemLevels[key]);
    Object.assign(window.itemLevels, data.itemLevels);
    window.unlockedResearch.length = 0;
    window.unlockedResearch.push(...data.unlockedResearch);
    prestigeUpgrades.forEach((upgrade, index) => { upgrade.level = data.prestigeUpgrades[index].level; });
    farms.forEach((farm, index) => { Object.assign(farm, data.farms[index]); });
    tools.forEach((tool, index) => { Object.assign(tool, data.tools[index]); });

    // Les valeurs dérivées du fichier ne font pas autorité ; les champs absents sont remis à zéro.
    reapplyCollectionBonuses();
    applyOfflineProgress(data.lastSeenAt);
    synchroniserHorlogeJeu();
    startAutoClicker();

    if (refreshUI) {
        refreshShop();
        updateCollectionDisplay();
        initializePrestigeUpgrades();
        updatePrestigeDisplay();
        renderLaboratoryTree();
        initializeGalaxyMap();
        updateDisplay();
        autoSaveGame();
    }
}

// Progression hors-ligne : crédite la production passive écoulée depuis la dernière session
function applyOfflineProgress(lastSeenAt) {
    const derniereVisite = Number(lastSeenAt);
    const maintenant = Date.now();
    const debut = Number.isFinite(derniereVisite) && derniereVisite > 0
        ? Math.min(maintenant, Math.max(derniereVisite, maintenant - OFFLINE_MAX_SECONDS * 1000))
        : maintenant;
    const secondesEcoulees = (maintenant - debut) / 1000;
    let gainBrut = 0;

    // Une recherche achevée pendant l'absence change le taux à sa date de fin,
    // pas rétroactivement sur toute l'absence ni seulement après le chargement.
    const active = window.activeResearch;
    if (active && active.endAt <= maintenant) {
        const changement = Math.min(maintenant, Math.max(debut, active.endAt));
        gainBrut += (window.scorePerSecond || 0) * (changement - debut) / 1000;
        completeResearch(active.id, { refreshUI: false });
        gainBrut += (window.scorePerSecond || 0) * (maintenant - changement) / 1000;
    } else {
        gainBrut = (window.scorePerSecond || 0) * secondesEcoulees;
    }
    if (gainBrut <= 0) return;
    const gainReel = typeof recordPlanetHarvest === 'function'
        ? recordPlanetHarvest(gainBrut)
        : gainBrut;

    if (gainReel <= 0) {
        return;
    }

    if (typeof addScore === 'function') {
        addScore(gainReel);
    } else {
        window.score += gainReel;
        window.totalScoreEarned = (window.totalScoreEarned || 0) + gainReel;
    }

    showOfflineGain(gainReel, Math.floor(secondesEcoulees));
}

function showOfflineGain(gain, secondes) {
    const format = typeof formatNumber === 'function' ? formatNumber : (n => Math.floor(n));
    const heures = Math.floor(secondes / 3600);
    const minutes = Math.floor((secondes % 3600) / 60);
    const duree = heures > 0 ? `${heures}h${String(minutes).padStart(2, '0')}` : `${minutes} min`;

    const message = document.createElement('div');
    message.innerHTML = `⏳ Pendant votre absence (${duree}) :<br>+${format(gain)} Entropie`;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10002;
        color: #00ff88;
        text-align: center;
        font-weight: bold;
        padding: 14px 22px;
        background: rgba(0, 20, 10, 0.92);
        border: 1px solid rgba(0, 255, 136, 0.5);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.35);
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 6000);
}

// Instantané complet de l'état persistant (source unique du format de sauvegarde)
function serializeGameState() {
    return {
        version: SAVE_VERSION,
        timestamp: new Date().toISOString(),
        lastSeenAt: Date.now(),
        score: window.score || 0,
        totalScoreEarned: window.totalScoreEarned || 0,
        totalScoreConverted: window.totalScoreConverted || 0,
        clickPower: window.clickPower || 1,
        scorePerSecond: window.scorePerSecond || 0,
        stardust: window.stardust || 0,
        prestigeUpgrades: window.prestigeUpgrades || [],
        collectedItems: window.collectedItems || [],
        itemLevels: window.itemLevels || {},
        unlockedResearch: window.unlockedResearch || [],
        researchPoints: window.researchPoints || 0,
        activeResearch: window.activeResearch || null,
        currentPlanetId: window.currentPlanetId || 'orbita_prime',
        currentSystemId: window.currentSystemId || 'core_sector',
        visitedPlanets: window.visitedPlanets || ['orbita_prime'],
        planetHarvested: window.planetHarvested || { orbita_prime: 0 },
        claimedPlanetResearchRewards: window.claimedPlanetResearchRewards || [],
        farms: farms.map(farm => ({
            id: farm.id,
            count: farm.count,
            multiplier: farm.multiplier,
            upgrades: farm.upgrades
        })),
        tools: tools.map(tool => ({
            id: tool.id,
            level: tool.level,
            multiplier: tool.multiplier,
            upgrades: tool.upgrades
        }))
    };
}

function autoSaveGame() {
    try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(serializeGameState()));
    } catch (error) {
        console.error('Sauvegarde automatique impossible:', error);
    }
}

// Démarre la sauvegarde automatique périodique (idempotent)
function startAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }

    autoSaveInterval = setInterval(autoSaveGame, AUTO_SAVE_INTERVAL_MS);

    if (!window.autoSaveUnloadBound) {
        window.addEventListener('beforeunload', autoSaveGame);
        window.autoSaveUnloadBound = true;
    }

    autoSaveGame();
}

function saveGame() {
    const dataStr = JSON.stringify(serializeGameState(), null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'alien-clicker-save.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Effet visuel de confirmation
    const saveButton = document.querySelector('.save-button');
    if (!saveButton) return;

    const originalText = saveButton.textContent;
    saveButton.textContent = '✅ Sauvegarde téléchargée !';
    saveButton.style.background = 'linear-gradient(45deg, #00ff88, #00cc66)';

    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = 'linear-gradient(45deg, #66ccff, #4499cc)';
    }, 2000);
}

function loadGame(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const gameData = JSON.parse(e.target.result);
            applyLoadedGameData(gameData, { refreshUI: true });

            // Effet visuel de confirmation
            showLoadSuccess();

        } catch (error) {
            showLoadError();
        }
    };

    reader.readAsText(file);
}

function showLoadSuccess() {
    const fileInput = document.getElementById('load-file');
    const originalBorder = fileInput.style.borderColor;

    fileInput.style.borderColor = '#00ff88';
    fileInput.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.5)';

    // Créer un message de succès temporaire
    const successMsg = document.createElement('div');
    successMsg.textContent = '✅ Partie chargée avec succès !';
    successMsg.style.cssText = `
        color: #00ff88;
        text-align: center;
        font-weight: bold;
        margin-top: 10px;
        padding: 10px;
        background: rgba(0, 255, 136, 0.1);
        border-radius: 6px;
    `;

    fileInput.parentNode.appendChild(successMsg);

    setTimeout(() => {
        fileInput.style.borderColor = originalBorder;
        fileInput.style.boxShadow = '';
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 3000);
}

function showLoadError() {
    const fileInput = document.getElementById('load-file');
    fileInput.style.borderColor = '#ff4444';
    fileInput.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.5)';

    // Créer un message d'erreur temporaire
    const errorMsg = document.createElement('div');
    errorMsg.textContent = '❌ Erreur: Fichier de sauvegarde invalide';
    errorMsg.style.cssText = `
        color: #ff4444;
        text-align: center;
        font-weight: bold;
        margin-top: 10px;
        padding: 10px;
        background: rgba(255, 68, 68, 0.1);
        border-radius: 6px;
    `;

    fileInput.parentNode.appendChild(errorMsg);

    setTimeout(() => {
        fileInput.style.borderColor = '#5a5a8e';
        fileInput.style.boxShadow = '';
        if (errorMsg.parentNode) {
            errorMsg.parentNode.removeChild(errorMsg);
        }
    }, 3000);
}

window.applyLoadedGameData = applyLoadedGameData;
window.resetRunState = resetRunState;
window.serializeGameState = serializeGameState;
window.autoSaveGame = autoSaveGame;
window.startAutoSave = startAutoSave;
window.AUTO_SAVE_KEY = AUTO_SAVE_KEY;
