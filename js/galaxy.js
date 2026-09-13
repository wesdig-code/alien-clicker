// Système de carte galactique multi-systèmes

const galaxySystems = [
    {
        id: 'core_sector',
        name: 'Noyau d’Orbita',
        emoji: '☀️',
        unlockTotalEntropy: 0,
        planets: [
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
            }
        ]
    },
    {
        id: 'ion_cluster',
        name: 'Amas Ionique',
        emoji: '⚡',
        unlockTotalEntropy: 90000,
        planets: [
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
                id: 'aurora_station',
                name: 'Aurora Station',
                emoji: '🌠',
                biome: 'Anneaux magnétiques',
                description: 'Les champs auroraux boostent les clics précis.',
                travelCost: 32000,
                minTotalEntropy: 130000,
                harvestCap: 920000,
                clickMultiplier: 1.42,
                farmMultiplier: 1.2
            },
            {
                id: 'voltra_delta',
                name: 'Voltra Delta',
                emoji: '🔋',
                biome: 'Lacs d’énergie',
                description: 'Monde énergétique favorisant la production continue.',
                travelCost: 48000,
                minTotalEntropy: 190000,
                harvestCap: 1300000,
                clickMultiplier: 1.2,
                farmMultiplier: 1.62
            }
        ]
    },
    {
        id: 'abyss_reach',
        name: 'Confins Abyssaux',
        emoji: '🌌',
        unlockTotalEntropy: 250000,
        planets: [
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
            },
            {
                id: 'void_cradle',
                name: 'Void Cradle',
                emoji: '🕳️',
                biome: 'Vortex sombres',
                description: 'Région instable, gains massifs mais techniques.',
                travelCost: 76000,
                minTotalEntropy: 320000,
                harvestCap: 2600000,
                clickMultiplier: 1.72,
                farmMultiplier: 1.45
            },
            {
                id: 'chronos_ash',
                name: 'Chronos Ash',
                emoji: '⌛',
                biome: 'Ruines temporelles',
                description: 'Vestiges hors du temps, extraction de haut niveau.',
                travelCost: 120000,
                minTotalEntropy: 420000,
                harvestCap: 3600000,
                clickMultiplier: 1.58,
                farmMultiplier: 1.88
            }
        ]
    }
];

const galaxyPlanets = galaxySystems.flatMap(system =>
    system.planets.map(planet => ({ ...planet, systemId: system.id }))
);

window.currentPlanetId = window.currentPlanetId || 'orbita_prime';
window.currentSystemId = window.currentSystemId || 'core_sector';
window.visitedPlanets = window.visitedPlanets || ['orbita_prime'];
window.planetHarvested = window.planetHarvested || { orbita_prime: 0 };
window.claimedPlanetResearchRewards = window.claimedPlanetResearchRewards || [];

function getSystemById(systemId) {
    return galaxySystems.find(system => system.id === systemId);
}

function getPlanetById(planetId) {
    return galaxyPlanets.find(planet => planet.id === planetId);
}

function getCurrentPlanet() {
    return getPlanetById(window.currentPlanetId) || galaxyPlanets[0];
}

function getCurrentSystem() {
    const system = getSystemById(window.currentSystemId);
    if (system) return system;

    const currentPlanet = getCurrentPlanet();
    return getSystemById(currentPlanet.systemId) || galaxySystems[0];
}

function isSystemUnlocked(system) {
    return (window.totalScoreEarned || 0) >= system.unlockTotalEntropy;
}

function isPlanetUnlocked(planet) {
    return (window.totalScoreEarned || 0) >= planet.minTotalEntropy;
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

function isPlanetDepleted(planetId) {
    return getPlanetRemainingCapacity(planetId) <= 0;
}

// Rafraîchit la carte via le point d'entrée de la boucle de rendu quand il existe
function rafraichirCarteGalactique() {
    if (typeof refreshGalaxy === 'function') {
        refreshGalaxy();
    } else {
        renderGalaxyMap();
    }
}

// Remet toutes les planètes à zéro (prestige / nouvelle partie)
function resetPlanetHarvest() {
    window.planetHarvested = {};
    galaxyPlanets.forEach(planet => {
        window.planetHarvested[planet.id] = 0;
    });
    window.claimedPlanetResearchRewards = [];
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

    const isDepleted = window.planetHarvested[planetId] >= currentPlanet.harvestCap;
    const alreadyRewarded = window.claimedPlanetResearchRewards.includes(planetId);

    if (isDepleted && !alreadyRewarded) {
        window.claimedPlanetResearchRewards.push(planetId);
        window.researchPoints = (window.researchPoints || 0) + 1;

        if (typeof renderLaboratoryTree === 'function') {
            renderLaboratoryTree();
        }

        // Épuisement : événement ponctuel, la carte doit refléter le nouvel état
        rafraichirCarteGalactique();
    }

    return gained;
}

function canTravelToPlanet(planet) {
    if (!planet) return false;
    if (planet.id === window.currentPlanetId) return false;
    if (!isPlanetUnlocked(planet)) return false;

    const system = getSystemById(planet.systemId);
    if (!system || !isSystemUnlocked(system)) return false;

    return score >= planet.travelCost;
}

function travelToPlanet(planetId) {
    const planet = getPlanetById(planetId);
    if (!planet) return;
    if (!canTravelToPlanet(planet)) return;

    score -= planet.travelCost;
    window.currentPlanetId = planet.id;
    window.currentSystemId = planet.systemId;

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

    rafraichirCarteGalactique();
}

function setCurrentSystem(systemId) {
    const system = getSystemById(systemId);
    if (!system || !isSystemUnlocked(system)) return;

    window.currentSystemId = systemId;
    rafraichirCarteGalactique();
}

function getPlanetClickMultiplier() {
    return getCurrentPlanet().clickMultiplier || 1;
}

function getPlanetFarmMultiplier() {
    return getCurrentPlanet().farmMultiplier || 1;
}

function initializeGalaxyMap() {
    const currentPlanet = getPlanetById(window.currentPlanetId);
    if (!currentPlanet) {
        window.currentPlanetId = 'orbita_prime';
    }

    const resolvedCurrentPlanet = getCurrentPlanet();

    if (!window.currentSystemId || !getSystemById(window.currentSystemId)) {
        window.currentSystemId = resolvedCurrentPlanet.systemId;
    }

    if (!Array.isArray(window.visitedPlanets) || window.visitedPlanets.length === 0) {
        window.visitedPlanets = ['orbita_prime'];
    }

    if (!window.planetHarvested || typeof window.planetHarvested !== 'object') {
        window.planetHarvested = { orbita_prime: 0 };
    }

    if (!Array.isArray(window.claimedPlanetResearchRewards)) {
        window.claimedPlanetResearchRewards = [];
    }

    galaxyPlanets.forEach(planet => {
        if (typeof window.planetHarvested[planet.id] !== 'number') {
            window.planetHarvested[planet.id] = 0;
        }

        if (window.planetHarvested[planet.id] >= planet.harvestCap && !window.claimedPlanetResearchRewards.includes(planet.id)) {
            window.claimedPlanetResearchRewards.push(planet.id);
            window.researchPoints = (window.researchPoints || 0) + 1;
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
    const systemSelect = document.getElementById('galaxy-system-select');
    const galaxyGrid = document.getElementById('galaxy-grid');

    if (!currentPlanetName || !currentPlanetBiome || !currentPlanetBonus || !currentPlanetHarvestText || !currentPlanetHarvestBar || !systemSelect || !galaxyGrid) {
        return;
    }

    const current = getCurrentPlanet();
    const currentHarvested = getPlanetHarvested(current.id);
    const currentPercent = Math.min(100, (currentHarvested / current.harvestCap) * 100);
    currentPlanetName.textContent = `${current.emoji} ${current.name}`;
    currentPlanetBiome.textContent = `${getSystemById(current.systemId)?.name || ''} • ${current.biome}`;
    currentPlanetBonus.textContent = `Clic x${current.clickMultiplier.toFixed(2)} • Fermes x${current.farmMultiplier.toFixed(2)}`;
    currentPlanetHarvestText.textContent = isPlanetDepleted(current.id)
        ? `⛔ Planète épuisée (${formatNumber(current.harvestCap)} Entropie) — voyagez vers une autre planète`
        : `Récolte: ${formatNumber(currentHarvested)} / ${formatNumber(current.harvestCap)} Entropie`;
    currentPlanetHarvestBar.style.width = `${currentPercent.toFixed(2)}%`;

    if (systemSelect.options.length !== galaxySystems.length) {
        systemSelect.innerHTML = '';
        galaxySystems.forEach(system => {
            const option = document.createElement('option');
            option.value = system.id;
            option.textContent = `${system.emoji} ${system.name}`;
            systemSelect.appendChild(option);
        });

        systemSelect.onchange = event => {
            setCurrentSystem(event.target.value);
        };
    }

    [...systemSelect.options].forEach(option => {
        const system = getSystemById(option.value);
        const unlocked = !!system && isSystemUnlocked(system);
        option.disabled = !unlocked;
        option.textContent = unlocked
            ? `${system.emoji} ${system.name}`
            : `🔒 ${system.emoji} ${system.name} (${formatNumber(system.unlockTotalEntropy)})`;
    });

    const currentSystem = getCurrentSystem();
    if (!isSystemUnlocked(currentSystem)) {
        const fallback = galaxySystems.find(system => isSystemUnlocked(system)) || galaxySystems[0];
        window.currentSystemId = fallback.id;
    }
    systemSelect.value = window.currentSystemId;

    const visibleSystem = getCurrentSystem();
    const visiblePlanets = galaxyPlanets.filter(planet => planet.systemId === visibleSystem.id);
    if (galaxyGrid.dataset.systemId !== visibleSystem.id) {
        galaxyGrid.innerHTML = '';
        galaxyGrid.dataset.systemId = visibleSystem.id;
    }

    visiblePlanets.forEach(planet => {
        const unlocked = isPlanetUnlocked(planet);
        const isCurrent = planet.id === window.currentPlanetId;
        const canTravel = canTravelToPlanet(planet);
        const depleted = isPlanetDepleted(planet.id);

        let card = galaxyGrid.querySelector(`[data-planet-id="${planet.id}"]`);
        if (!card) {
            card = document.createElement('div');
            card.dataset.planetId = planet.id;
            card.innerHTML = `
                <div class="planet-title"></div>
                <div class="planet-biome"></div>
                <div class="planet-desc"></div>
                <div class="planet-bonus"></div>
                <div class="planet-meta">
                    <span class="planet-travel-cost"></span>
                    <span class="planet-unlock-cost"></span>
                    <span class="planet-harvest"></span>
                    <span class="planet-reward"></span>
                </div>
            `;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'planet-travel-button';
            button.addEventListener('click', () => travelToPlanet(planet.id));
            card.appendChild(button);
            galaxyGrid.appendChild(card);
        }
        card.className = 'planet-card';

        if (isCurrent) {
            card.classList.add('current');
        } else if (!unlocked || depleted) {
            // Une planète épuisée ne rapporte plus rien : on la présente comme indisponible
            card.classList.add('locked');
        } else {
            card.classList.add('available');
        }

        const texts = {
            '.planet-title': `${planet.emoji} ${planet.name}${depleted ? ' ⛔' : ''}`,
            '.planet-biome': planet.biome,
            '.planet-desc': planet.description,
            '.planet-bonus': `Clic x${planet.clickMultiplier.toFixed(2)} • Fermes x${planet.farmMultiplier.toFixed(2)}`,
            '.planet-travel-cost': `Coût voyage: ${formatNumber(planet.travelCost)}`,
            '.planet-unlock-cost': `Déblocage: ${formatNumber(planet.minTotalEntropy)} Entropie`,
            '.planet-harvest': `${depleted ? '⛔ Épuisée' : 'Récolte'}: ${formatNumber(getPlanetHarvested(planet.id))} / ${formatNumber(planet.harvestCap)}`,
            '.planet-reward': window.claimedPlanetResearchRewards.includes(planet.id) ? '✅ Point recherche gagné' : '🎓 Récompense: +1 point recherche'
        };
        Object.entries(texts).forEach(([selector, text]) => {
            const element = card.querySelector(selector);
            if (element.textContent !== text) element.textContent = text;
        });

        const actionButton = card.querySelector('.planet-travel-button');
        actionButton.className = 'planet-travel-button';

        if (isCurrent) {
            actionButton.textContent = depleted ? '⛔ Épuisée — changez de planète' : '📍 Planète actuelle';
            actionButton.disabled = true;
            actionButton.classList.add(depleted ? 'locked' : 'current');
        } else if (depleted && unlocked) {
            actionButton.textContent = '⛔ Planète épuisée';
            actionButton.disabled = true;
            actionButton.classList.add('locked');
        } else if (!unlocked) {
            actionButton.textContent = '🔒 Non débloquée';
            actionButton.disabled = true;
            actionButton.classList.add('locked');
        } else if (canTravel) {
            actionButton.textContent = '🚀 Voyager';
            actionButton.disabled = false;
            actionButton.classList.add('available');
        } else {
            actionButton.textContent = `❌ ${formatNumber(planet.travelCost)} requis`;
            actionButton.disabled = true;
            actionButton.classList.add('locked');
        }

    });
}

window.initializeGalaxyMap = initializeGalaxyMap;
window.renderGalaxyMap = renderGalaxyMap;
window.getPlanetClickMultiplier = getPlanetClickMultiplier;
window.getPlanetFarmMultiplier = getPlanetFarmMultiplier;
window.applyPlanetHarvestCap = applyPlanetHarvestCap;
window.getPlanetRemainingCapacity = getPlanetRemainingCapacity;
window.isPlanetDepleted = isPlanetDepleted;
window.resetPlanetHarvest = resetPlanetHarvest;
window.travelToPlanet = travelToPlanet;
window.setCurrentSystem = setCurrentSystem;
window.getCurrentPlanet = getCurrentPlanet;
window.galaxySystems = galaxySystems;
window.galaxyPlanets = galaxyPlanets;
