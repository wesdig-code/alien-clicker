// Système de laboratoire et arbre de recherche

const laboratoryResearchTree = [
    {
        id: 'xeno_fingers',
        name: 'Doigts Xéno',
        description: '+15% points/clic',
        cost: 500,
        effect: 'clickMultiplier',
        value: 1.15,
        prerequisites: []
    },
    {
        id: 'plasma_fields',
        name: 'Champs Plasma',
        description: '+20% points/seconde',
        cost: 1500,
        effect: 'farmMultiplier',
        value: 1.2,
        prerequisites: ['xeno_fingers']
    },
    {
        id: 'quantum_drills',
        name: 'Foreuses Quantiques',
        description: '+25% points/seconde',
        cost: 5000,
        effect: 'farmMultiplier',
        value: 1.25,
        prerequisites: ['plasma_fields']
    },
    {
        id: 'neural_interface',
        name: 'Interface Neurale',
        description: '+30% points/clic',
        cost: 3500,
        effect: 'clickMultiplier',
        value: 1.3,
        prerequisites: ['xeno_fingers']
    },
    {
        id: 'dark_matter_infusion',
        name: 'Infusion Matière Noire',
        description: '+25% chance de drops',
        cost: 9000,
        effect: 'dropChanceMultiplier',
        value: 1.25,
        prerequisites: ['plasma_fields']
    },
    {
        id: 'singularity_core',
        name: 'Cœur Singulier',
        description: '+50% points/clic et +35% points/seconde',
        cost: 20000,
        effect: 'hybrid',
        value: { click: 1.5, farm: 1.35 },
        prerequisites: ['quantum_drills', 'neural_interface', 'dark_matter_infusion']
    }
];

window.unlockedResearch = window.unlockedResearch || [];
window.activeResearch = window.activeResearch || null;
window.researchPoints = window.researchPoints || 0;

const LAB_RESEARCH_MIN_DURATION_MS = 30000;
const LAB_RESEARCH_MAX_DURATION_MS = 300000;
const LAB_RESEARCH_MS_PER_ENTROPY = 15;

let laboratoryIntervalId = null;
let laboratoryLastIdleRenderAt = 0;

// Durée d'une recherche : 15 ms par point d'Entropie de son coût, bornée entre 30 s et 5 min
function getResearchDurationMs(research) {
    const duree = (research?.cost || 0) * LAB_RESEARCH_MS_PER_ENTROPY;
    return Math.min(LAB_RESEARCH_MAX_DURATION_MS, Math.max(LAB_RESEARCH_MIN_DURATION_MS, duree));
}

// Durée réelle de la recherche en cours : celle enregistrée au lancement, pour qu'une
// recherche démarrée avant un rechargement se termine avec sa durée d'origine
function getActiveResearchDurationMs() {
    const active = window.activeResearch;
    if (!active) return 0;

    if (typeof active.endAt === 'number' && typeof active.startAt === 'number' && active.endAt > active.startAt) {
        return active.endAt - active.startAt;
    }

    const node = laboratoryResearchTree.find(item => item.id === active.id);
    return node ? getResearchDurationMs(node) : LAB_RESEARCH_MIN_DURATION_MS;
}

function initializeLaboratory() {
    if (!laboratoryIntervalId) {
        laboratoryIntervalId = setInterval(updateLaboratoryState, 100);
    }

    updateLaboratoryState();
    renderLaboratoryTree();
}

function isResearchUnlocked(researchId) {
    return window.unlockedResearch.includes(researchId);
}

function canUnlockResearch(research) {
    if (isResearchUnlocked(research.id)) return false;

    const prerequisitesMet = research.prerequisites.every(prereqId => isResearchUnlocked(prereqId));
    if (!prerequisitesMet) return false;

    return score >= research.cost;
}

function arePrerequisitesMet(research) {
    return research.prerequisites.every(prereqId => isResearchUnlocked(prereqId));
}

function buyResearch(researchId) {
    const research = laboratoryResearchTree.find(node => node.id === researchId);
    if (!research) return;

    if (isResearchUnlocked(research.id)) return;
    if (window.activeResearch) return;
    if (!arePrerequisitesMet(research)) return;
    if ((window.researchPoints || 0) < 1) return;
    if (score < research.cost) return;

    score -= research.cost;
    window.researchPoints -= 1;
    const now = Date.now();
    window.activeResearch = {
        id: research.id,
        startAt: now,
        endAt: now + getResearchDurationMs(research)
    };

    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }

    renderLaboratoryTree();
}

function completeResearch(researchId) {
    if (!isResearchUnlocked(researchId)) {
        window.unlockedResearch.push(researchId);
    }

    window.activeResearch = null;

    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }

    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }

    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }

    renderLaboratoryTree();
}

// Format court d'une durée de recherche (ex: "1m 15s" ou "42s")
function formatResearchDuration(ms) {
    const totalSecondes = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSecondes / 60);
    const secondes = totalSecondes % 60;

    return minutes > 0 ? `${minutes}m ${secondes.toString().padStart(2, '0')}s` : `${secondes}s`;
}

function updateLaboratoryState() {
    if (!window.activeResearch) {
        // Hors recherche, seuls le coût et les points évoluent : un rendu par seconde suffit
        const maintenant = Date.now();
        if (maintenant - laboratoryLastIdleRenderAt >= 1000) {
            laboratoryLastIdleRenderAt = maintenant;
            renderLaboratoryTree();
        }
        return;
    }

    const activeNode = laboratoryResearchTree.find(node => node.id === window.activeResearch.id);
    if (!activeNode || isResearchUnlocked(window.activeResearch.id)) {
        window.activeResearch = null;
        renderLaboratoryTree();
        return;
    }

    if (Date.now() >= window.activeResearch.endAt) {
        completeResearch(window.activeResearch.id);
        return;
    }

    renderLaboratoryTree();
}

function getResearchClickMultiplier() {
    let multiplier = 1;

    laboratoryResearchTree.forEach(research => {
        if (!isResearchUnlocked(research.id)) return;

        if (research.effect === 'clickMultiplier') {
            multiplier *= research.value;
        } else if (research.effect === 'hybrid') {
            multiplier *= research.value.click;
        }
    });

    return multiplier;
}

function getResearchFarmMultiplier() {
    let multiplier = 1;

    laboratoryResearchTree.forEach(research => {
        if (!isResearchUnlocked(research.id)) return;

        if (research.effect === 'farmMultiplier') {
            multiplier *= research.value;
        } else if (research.effect === 'hybrid') {
            multiplier *= research.value.farm;
        }
    });

    return multiplier;
}

function getResearchDropChanceMultiplier() {
    let multiplier = 1;

    laboratoryResearchTree.forEach(research => {
        if (!isResearchUnlocked(research.id)) return;

        if (research.effect === 'dropChanceMultiplier') {
            multiplier *= research.value;
        }
    });

    return multiplier;
}

function renderLaboratoryTree() {
    const treeContainer = document.getElementById('laboratory-tree');
    const statusElement = document.getElementById('laboratory-status');

    if (!treeContainer || !statusElement) return;

    // Créer les nœuds une seule fois pour éviter les vibrations visuelles
    if (treeContainer.children.length !== laboratoryResearchTree.length) {
        treeContainer.innerHTML = '';

        laboratoryResearchTree.forEach(research => {
            const node = document.createElement('button');
            node.className = 'research-node';
            node.type = 'button';
            node.dataset.researchId = research.id;
            node.innerHTML = `
                <div class="research-name"></div>
                <div class="research-desc"></div>
                <div class="research-cost"></div>
                <div class="research-progress" style="display: none;">
                    <div class="research-progress-bar"></div>
                </div>
            `;

            treeContainer.appendChild(node);
        });
    }

    laboratoryResearchTree.forEach(research => {
        const node = treeContainer.querySelector(`[data-research-id="${research.id}"]`);
        if (!node) return;

        const unlocked = isResearchUnlocked(research.id);
        const prerequisitesMet = arePrerequisitesMet(research);
        const affordable = score >= research.cost;
        const hasResearchPoint = (window.researchPoints || 0) >= 1;
        const isResearching = window.activeResearch && window.activeResearch.id === research.id;

        let progressPercent = 0;
        let remainingMs = 0;

        if (isResearching) {
            const dureeTotale = getActiveResearchDurationMs() || 1;
            const elapsed = Date.now() - window.activeResearch.startAt;
            progressPercent = Math.min(100, Math.max(0, (elapsed / dureeTotale) * 100));
            remainingMs = Math.max(0, window.activeResearch.endAt - Date.now());
        }

        if (isResearching) {
            node.className = 'research-node researching';
        } else if (unlocked) {
            node.className = 'research-node unlocked';
        } else if (prerequisitesMet && affordable && hasResearchPoint) {
            node.className = 'research-node available';
        } else if (prerequisitesMet && affordable) {
            node.className = 'research-node locked-point';
        } else if (prerequisitesMet) {
            node.className = 'research-node locked-cost';
        } else {
            node.className = 'research-node locked-prereq';
        }

        const nameElement = node.querySelector('.research-name');
        const descElement = node.querySelector('.research-desc');
        const costElement = node.querySelector('.research-cost');
        const progressElement = node.querySelector('.research-progress');
        const progressBarElement = node.querySelector('.research-progress-bar');

        if (nameElement) nameElement.textContent = research.name;
        if (descElement) descElement.textContent = research.description;
        if (costElement) {
            costElement.textContent = isResearching
                ? `⏳ Recherche: ${formatResearchDuration(remainingMs)}`
                : unlocked
                    ? '✅ Recherché'
                    : `Coût: ${formatNumber(research.cost)} + 1 point recherche • ⏱ ${formatResearchDuration(getResearchDurationMs(research))}`;
        }

        if (progressElement && progressBarElement) {
            if (isResearching) {
                progressElement.style.display = 'block';
                progressBarElement.style.width = `${progressPercent.toFixed(1)}%`;
            } else {
                progressElement.style.display = 'none';
                progressBarElement.style.width = '0%';
            }
        }

        if (!unlocked && !isResearching && !window.activeResearch && prerequisitesMet && affordable && hasResearchPoint) {
            node.onclick = () => buyResearch(research.id);
            node.disabled = false;
        } else {
            node.onclick = null;
            node.disabled = true;
        }

        const prereqText = research.prerequisites.length > 0
            ? `Prérequis: ${research.prerequisites
                .map(id => laboratoryResearchTree.find(nodeItem => nodeItem.id === id)?.name)
                .filter(Boolean)
                .join(', ')}`
            : 'Prérequis: aucun';

        node.title = `${research.name}\n${research.description}\n${prereqText}`;
    });

    const unlockedCount = window.unlockedResearch.length;
    if (window.activeResearch) {
        const activeNode = laboratoryResearchTree.find(node => node.id === window.activeResearch.id);
        const restant = Math.max(0, window.activeResearch.endAt - Date.now());
        statusElement.textContent = `Points recherche: ${window.researchPoints || 0} • En cours: ${activeNode ? activeNode.name : 'Inconnue'} (${formatResearchDuration(restant)})`;
    } else {
        statusElement.textContent = `Points recherche: ${window.researchPoints || 0} • Recherches: ${unlockedCount}/${laboratoryResearchTree.length}`;
    }
}

window.initializeLaboratory = initializeLaboratory;
window.renderLaboratoryTree = renderLaboratoryTree;
window.getResearchClickMultiplier = getResearchClickMultiplier;
window.getResearchFarmMultiplier = getResearchFarmMultiplier;
window.getResearchDropChanceMultiplier = getResearchDropChanceMultiplier;
window.getResearchDurationMs = getResearchDurationMs;
window.buyResearch = buyResearch;
window.laboratoryResearchTree = laboratoryResearchTree;
