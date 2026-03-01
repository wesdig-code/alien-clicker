// Système de carte galactique

const galaxyPlanets = [
    {
        id: 'orbita_prime',
        name: 'Orbita Prime',
        emoji: '🪐',
        biome: 'Nébuleuses calmes',
        description: 'Planète de départ stable pour collecter l’Entropie.',
        travelCost: 0,
        minTotalEntropy: 0,
        harvestCap: 20000,
        clickMultiplier: 1,
        farmMultiplier: 1
    },
    {
        id: 'cryo_vii',
        name: 'Cryo VII',
        emoji: '🧊',
        biome: 'Déserts glacés',
        description: 'Le froid stabilise les fermes mais ralentit le clic.',
        travelCost: 1500,
        minTotalEntropy: 5000,
        harvestCap: 75000,
        clickMultiplier: 0.95,
        farmMultiplier: 1.2
    },
    {
        id: 'pyraxis',
        name: 'Pyraxis',
        emoji: '🔥',
        biome: 'Tempêtes de plasma',
        description: 'Cœur volcanique : clics plus puissants, production instable.',
        travelCost: 6000,
        minTotalEntropy: 25000,
        harvestCap: 220000,
        clickMultiplier: 1.35,
        farmMultiplier: 0.9
    },
    {
        id: 'zenith_ion',
        name: 'Zenith Ion',
        emoji: '⚡',
        biome: 'Orages ioniques',
        description: 'Haute tension constante, idéale pour les réseaux automatisés.',
        travelCost: 18000,
        minTotalEntropy: 90000,
        harvestCap: 650000,
        clickMultiplier: 1.15,
        farmMultiplier: 1.45
    },
    {
        id: 'abyss_nova',
        name: 'Abyss Nova',
        emoji: '🌌',
        biome: 'Faille gravitationnelle',
        description: 'Planète extrême, rendement maximal en Entropie.',
        travelCost: 45000,
        minTotalEntropy: 250000,
        harvestCap: 1800000,
        clickMultiplier: 1.5,
        farmMultiplier: 1.6
    }
];

window.currentPlanetId = window.currentPlanetId || 'orbita_prime';
window.visitedPlanets = window.visitedPlanets || ['orbita_prime'];
    window.planetHarvested = window.planetHarvested || { orbita_prime: 0 };

function getPlanetById(planetId) {
    return galaxyPlanets.find(planet => planet.id === planetId);
}

function getCurrentPlanet() {
    return getPlanetById(window.currentPlanetId) || galaxyPlanets[0];
}

function getPlanetHarvested(planetId) {
    return window.planetHarvested?.[planetId] || 0;
}

function getPlanetRemainingCapacity(planetId) {
    const planet = getPlanetById(planetId);
    if (!planet) return 0;

    const harvested = getPlanetHarvested(planetId);
    return Math.max(0, planet.harvestCap - harvested);
}

function applyPlanetHarvestCap(amount) {
    const safeAmount = Math.max(0, amount || 0);
    if (safeAmount <= 0) return 0;

    const currentPlanet = getCurrentPlanet();
    const planetId = currentPlanet.id;
    const remaining = getPlanetRemainingCapacity(planetId);

    if (remaining <= 0) {
        return 0;
    }

    const gained = Math.min(safeAmount, remaining);
    if (!window.planetHarvested[planetId]) {
        window.planetHarvested[planetId] = 0;
    }
    window.planetHarvested[planetId] += gained;

    return gained;
}

function isPlanetUnlocked(planet) {
    return (window.totalScoreEarned || 0) >= planet.minTotalEntropy;
}

function canTravelToPlanet(planet) {
    if (!planet) return false;
    if (planet.id === window.currentPlanetId) return false;
    if (!isPlanetUnlocked(planet)) return false;
    return score >= planet.travelCost;
}

function travelToPlanet(planetId) {
    const planet = getPlanetById(planetId);
    if (!planet) return;
    if (!canTravelToPlanet(planet)) return;

    score -= planet.travelCost;
    window.currentPlanetId = planet.id;

    if (!window.visitedPlanets.includes(planet.id)) {
        window.visitedPlanets.push(planet.id);
    }

    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }

    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }

    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }

    renderGalaxyMap();
}

function getPlanetClickMultiplier() {
    return getCurrentPlanet().clickMultiplier || 1;
}

function getPlanetFarmMultiplier() {
    return getCurrentPlanet().farmMultiplier || 1;
}

function initializeGalaxyMap() {
    if (!window.currentPlanetId || !getPlanetById(window.currentPlanetId)) {
        window.currentPlanetId = 'orbita_prime';
    }

    if (!Array.isArray(window.visitedPlanets) || window.visitedPlanets.length === 0) {
        window.visitedPlanets = ['orbita_prime'];
    }

    if (!window.planetHarvested || typeof window.planetHarvested !== 'object') {
        window.planetHarvested = { orbita_prime: 0 };
    }

    galaxyPlanets.forEach(planet => {
        if (typeof window.planetHarvested[planet.id] !== 'number') {
            window.planetHarvested[planet.id] = 0;
        }
    });

    renderGalaxyMap();
}

function renderGalaxyMap() {
    const currentPlanetName = document.getElementById('current-planet-name');
    const currentPlanetBiome = document.getElementById('current-planet-biome');
    const currentPlanetBonus = document.getElementById('current-planet-bonus');
    const currentPlanetHarvestText = document.getElementById('current-planet-harvest-text');
    const currentPlanetHarvestBar = document.getElementById('current-planet-harvest-bar');
    const galaxyGrid = document.getElementById('galaxy-grid');

    if (!currentPlanetName || !currentPlanetBiome || !currentPlanetBonus || !currentPlanetHarvestText || !currentPlanetHarvestBar || !galaxyGrid) {
        return;
    }

    const current = getCurrentPlanet();
    const currentHarvested = getPlanetHarvested(current.id);
    const currentPercent = Math.min(100, (currentHarvested / current.harvestCap) * 100);
    currentPlanetName.textContent = `${current.emoji} ${current.name}`;
    currentPlanetBiome.textContent = current.biome;
    currentPlanetBonus.textContent = `Clic x${current.clickMultiplier.toFixed(2)} • Fermes x${current.farmMultiplier.toFixed(2)}`;
    currentPlanetHarvestText.textContent = `Récolte: ${formatNumber(currentHarvested)} / ${formatNumber(current.harvestCap)} Entropie`;
    currentPlanetHarvestBar.style.width = `${currentPercent.toFixed(2)}%`;

    galaxyGrid.innerHTML = '';

    galaxyPlanets.forEach(planet => {
        const unlocked = isPlanetUnlocked(planet);
        const isCurrent = planet.id === window.currentPlanetId;
        const canTravel = canTravelToPlanet(planet);

        const card = document.createElement('div');
        card.className = 'planet-card';

        if (isCurrent) {
            card.classList.add('current');
        } else if (!unlocked) {
            card.classList.add('locked');
        } else {
            card.classList.add('available');
        }

        card.innerHTML = `
            <div class="planet-title">${planet.emoji} ${planet.name}</div>
            <div class="planet-biome">${planet.biome}</div>
            <div class="planet-desc">${planet.description}</div>
            <div class="planet-bonus">Clic x${planet.clickMultiplier.toFixed(2)} • Fermes x${planet.farmMultiplier.toFixed(2)}</div>
            <div class="planet-meta">
                <span>Coût voyage: ${formatNumber(planet.travelCost)}</span>
                <span>Déblocage: ${formatNumber(planet.minTotalEntropy)} Entropie</span>
                <span>Récolte: ${formatNumber(getPlanetHarvested(planet.id))} / ${formatNumber(planet.harvestCap)}</span>
            </div>
        `;

        const actionButton = document.createElement('button');
        actionButton.className = 'planet-travel-button';

        if (isCurrent) {
            actionButton.textContent = '📍 Planète actuelle';
            actionButton.disabled = true;
            actionButton.classList.add('current');
        } else if (!unlocked) {
            actionButton.textContent = '🔒 Non débloquée';
            actionButton.disabled = true;
            actionButton.classList.add('locked');
        } else if (canTravel) {
            actionButton.textContent = '🚀 Voyager';
            actionButton.disabled = false;
            actionButton.classList.add('available');
            actionButton.addEventListener('click', () => travelToPlanet(planet.id));
        } else {
            actionButton.textContent = `❌ ${formatNumber(planet.travelCost)} requis`;
            actionButton.disabled = true;
            actionButton.classList.add('locked');
        }

        card.appendChild(actionButton);
        galaxyGrid.appendChild(card);
    });
}

window.initializeGalaxyMap = initializeGalaxyMap;
window.renderGalaxyMap = renderGalaxyMap;
window.getPlanetClickMultiplier = getPlanetClickMultiplier;
window.getPlanetFarmMultiplier = getPlanetFarmMultiplier;
window.applyPlanetHarvestCap = applyPlanetHarvestCap;
window.galaxyPlanets = galaxyPlanets;
