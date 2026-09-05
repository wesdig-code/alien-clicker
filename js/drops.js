// Système de drop d'items

// Configuration des items qui peuvent être droppés
const dropItems = [
    {
        id: 'coin',
        name: 'Pièce Alien',
        emoji: '🪙',
        rarity: 'common',
        chance: 15, // 15% de chance
        effect: 'score',
        value: () => Math.floor(clickPower * (1 + Math.random() * 2)), // 1x à 3x le clickPower
        color: '#FFD700'
    },
    {
        id: 'gem',
        name: 'Cristal Énergétique',
        emoji: '💎',
        rarity: 'uncommon',
        chance: 8, // 8% de chance
        effect: 'score',
        value: () => Math.floor(clickPower * (3 + Math.random() * 5)), // 3x à 8x le clickPower
        color: '#00BFFF'
    },
    {
        id: 'battery',
        name: 'Batterie Quantum',
        emoji: '🔋',
        rarity: 'uncommon',
        chance: 6, // 6% de chance
        effect: 'clickBoost',
        value: () => 2 + Math.floor(Math.random() * 3), // +2 à +4 click power temporaire
        duration: 10000, // 10 secondes
        color: '#00FF7F'
    },
    {
        id: 'multiplier',
        name: 'Amplificateur',
        emoji: '⚡',
        rarity: 'rare',
        chance: 3, // 3% de chance
        effect: 'scoreMultiplier',
        value: () => 1.5 + Math.random() * 1, // x1.5 à x2.5 multiplicateur temporaire
        duration: 15000, // 15 secondes
        color: '#FF6B35'
    },
    {
        id: 'stardust',
        name: 'Stardust Bonus',
        emoji: '✨',
        rarity: 'epic',
        chance: 1, // 1% de chance
        effect: 'stardust',
        value: () => 1 + Math.floor(Math.random() * 3), // +1 à +3 stardust
        color: '#9B59B6'
    },
    {
        id: 'treasure',
        name: 'Trésor Galactique',
        emoji: '👑',
        rarity: 'legendary',
        chance: 0.5, // 0.5% de chance
        effect: 'score',
        value: () => Math.floor(score * (0.1 + Math.random() * 0.15)), // 10% à 25% du score actuel
        color: '#FF1493'
    }
];

// Items permanents collectables une seule fois
const permanentItems = [
    {
        id: 'alien_egg',
        name: 'Œuf Alien',
        emoji: '🥚',
        rarity: 'rare',
        chance: 0.8,
        effect: 'permanent',
        bonus: 'clickPower',
        value: 5,
        description: '+5 Click Power permanent',
        color: '#90EE90'
    },
    {
        id: 'crystal_core',
        name: 'Cœur de Cristal',
        emoji: '🔮',
        rarity: 'rare',
        chance: 0.7,
        effect: 'permanent',
        bonus: 'farmMultiplier',
        value: 1.1,
        description: 'x1.1 Production des fermes',
        color: '#9370DB'
    },
    {
        id: 'golden_wrench',
        name: 'Clé Dorée',
        emoji: '🔧',
        rarity: 'epic',
        chance: 0.5,
        effect: 'permanent',
        bonus: 'toolMultiplier',
        value: 1.15,
        description: 'x1.15 Efficacité des outils',
        color: '#FFD700'
    },
    {
        id: 'star_fragment',
        name: 'Fragment d\'Étoile',
        emoji: '⭐',
        rarity: 'epic',
        chance: 0.4,
        effect: 'permanent',
        bonus: 'stardustBonus',
        value: 1.2,
        description: 'x1.2 Gain de Stardust',
        color: '#FFFF99'
    },
    {
        id: 'time_orb',
        name: 'Orbe Temporel',
        emoji: '🔵',
        rarity: 'epic',
        chance: 0.3,
        effect: 'permanent',
        bonus: 'autoClickSpeed',
        value: 0.8,
        description: '20% plus rapide auto-click',
        color: '#1E90FF'
    },
    {
        id: 'quantum_chip',
        name: 'Puce Quantique',
        emoji: '🧠',
        rarity: 'legendary',
        chance: 0.2,
        effect: 'permanent',
        bonus: 'upgradeDiscount',
        value: 0.9,
        description: '-10% coût des améliorations',
        color: '#FF69B4'
    },
    {
        id: 'cosmic_shard',
        name: 'Éclat Cosmique',
        emoji: '💫',
        rarity: 'legendary',
        chance: 0.15,
        effect: 'permanent',
        bonus: 'dropChance',
        value: 1.3,
        description: '+30% chance de drops',
        color: '#FF6347'
    },
    {
        id: 'void_essence',
        name: 'Essence du Vide',
        emoji: '🌌',
        rarity: 'mythic',
        chance: 0.1,
        effect: 'permanent',
        bonus: 'globalMultiplier',
        value: 1.25,
        description: 'x1.25 Production globale',
        color: '#8A2BE2'
    },
    {
        id: 'infinity_stone',
        name: 'Pierre d\'Infinité',
        emoji: '💠',
        rarity: 'mythic',
        chance: 0.05,
        effect: 'permanent',
        bonus: 'allBonuses',
        value: 1.1,
        description: 'x1.1 TOUS les bonus',
        color: '#FF0080'
    }
];

// Variables pour suivre les items collectés
let collectedItems = [];

// Système de qualité et niveaux
const qualityTiers = {
    basic: { min: 1, max: 10, name: 'Basique', color: '#808080' },
    common: { min: 11, max: 20, name: 'Commune', color: '#FFFFFF' },
    rare: { min: 21, max: 30, name: 'Rare', color: '#0099FF' },
    epic: { min: 31, max: 40, name: 'Épique', color: '#9933FF' },
    legendary: { min: 41, max: 49, name: 'Légendaire', color: '#FF6600' },
    unique: { min: 50, max: 50, name: 'Unique', color: '#FF0080' }
};

// Structure pour stocker les niveaux des items collectés
let itemLevels = {}; // { itemId: level }

// Fonction pour obtenir la qualité d'un item selon son niveau
function getItemQuality(level) {
    for (const [key, tier] of Object.entries(qualityTiers)) {
        if (level >= tier.min && level <= tier.max) {
            return { key, ...tier };
        }
    }
    return qualityTiers.basic;
}

// Fonction pour calculer le coût d'amélioration d'un item permanent
function getItemUpgradeCost(itemId, currentLevel) {
    const item = permanentItems.find(i => i.id === itemId);
    if (!item) return 0;
    
    const nextLevel = currentLevel + 1;
    if (nextLevel > 50) return Infinity; // Niveau max atteint
    
    // Coût de base * niveau^2.5 * multiplicateur selon la rareté de l'item original
    const rarityMultiplier = {
        'rare': 1000,
        'epic': 5000,
        'legendary': 25000,
        'mythic': 100000
    };
    
    const baseCost = rarityMultiplier[item.rarity] || 1000;
    return Math.floor(baseCost * Math.pow(nextLevel, 2.5));
}

// Fonction pour calculer le bonus actuel d'un item selon son niveau
function getItemBonus(itemId, level) {
    const item = permanentItems.find(i => i.id === itemId);
    if (!item) return item.value;
    
    // Le bonus augmente avec le niveau
    const levelMultiplier = 1 + (level - 1) * 0.1; // +10% par niveau
    
    if (item.bonus === 'clickPower') {
        return Math.floor(item.value * levelMultiplier);
    } else {
        // Pour les multiplicateurs, augmentation plus modérée
        const baseBonus = item.value - 1; // Retirer la base de 1
        return 1 + (baseBonus * levelMultiplier);
    }
}

// Variables pour les effets temporaires
let activeEffects = [];

// Fonction principale pour gérer les drops lors d'un clic
function handleClickDrop(clickX, clickY) {
    // Calculer la chance totale de drop (peut être améliorée par des upgrades plus tard)
    let totalDropChance = 25; // 25% de chance qu'un item drop

    const researchDropMultiplier = typeof getResearchDropChanceMultiplier === 'function' ? getResearchDropChanceMultiplier() : 1;
    totalDropChance *= researchDropMultiplier;
    
    // Bonus de chance de drop si on a l'éclat cosmique
    if (collectedItems.includes('cosmic_shard')) {
        totalDropChance *= 1.3;
    }
    
    if (Math.random() * 100 > totalDropChance) {
        return; // Pas de drop cette fois
    }
    
    // D'abord vérifier si on peut dropper un item permanent
    const availablePermanentItems = permanentItems.filter(item => !collectedItems.includes(item.id));
    
    if (availablePermanentItems.length > 0) {
        // Calculer la chance de dropper un item permanent (plus rare)
        const permanentChance = Math.random() * 100;
        let cumulativePermanentChance = 0;
        
        for (const item of availablePermanentItems) {
            cumulativePermanentChance += item.chance;
            if (permanentChance <= cumulativePermanentChance) {
                createDropEffect(item, clickX, clickY, true); // true = permanent
                return; // Un item permanent a été droppé, pas d'item temporaire
            }
        }
    }
    
    // Si pas d'item permanent, dropper un item temporaire normal
    const randomValue = Math.random() * 100;
    let cumulativeChance = 0;
    
    for (const item of dropItems) {
        cumulativeChance += item.chance;
        if (randomValue <= cumulativeChance) {
            createDropEffect(item, clickX, clickY, false); // false = temporaire
            break;
        }
    }
}

// Créer l'effet visuel et appliquer l'effet de l'item
function createDropEffect(item, x, y, isPermanent = false) {
    // Créer l'élément visuel
    const dropElement = document.createElement('div');
    dropElement.className = 'drop-item';
    if (isPermanent) dropElement.classList.add('permanent-drop');
    
    dropElement.innerHTML = `
        <div class="drop-emoji">${item.emoji}</div>
        <div class="drop-name">${item.name}</div>
    `;
    
    // Position de départ (où le clic a eu lieu)
    dropElement.style.position = 'fixed';
    dropElement.style.left = (x - 30) + 'px';
    dropElement.style.top = (y - 30) + 'px';
    dropElement.style.pointerEvents = 'none';
    dropElement.style.zIndex = '1000';
    dropElement.style.color = item.color;
    dropElement.style.fontWeight = 'bold';
    dropElement.style.textAlign = 'center';
    dropElement.style.fontSize = '14px';
    dropElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    
    // Animation CSS différente pour les items permanents
    if (isPermanent) {
        dropElement.style.animation = 'permanentDropFloat 3s ease-out forwards';
        dropElement.style.boxShadow = '0 0 20px ' + item.color;
    } else {
        dropElement.style.animation = 'dropFloat 2s ease-out forwards';
    }
    
    document.body.appendChild(dropElement);
    
    // Appliquer l'effet de l'item
    if (isPermanent) {
        applyPermanentItemEffect(item);
    } else {
        applyItemEffect(item);
    }
    
    // Supprimer l'élément après l'animation
    const duration = isPermanent ? 3000 : 2000;
    setTimeout(() => {
        if (dropElement.parentNode) {
            dropElement.parentNode.removeChild(dropElement);
        }
    }, duration);
    
    // Log pour debug
    const type = isPermanent ? 'PERMANENT' : 'temporaire';
    console.log(`🎁 Drop ${type}: ${item.name} (${item.rarity})`);
}

// Appliquer l'effet de l'item dropé
function applyItemEffect(item) {
    const value = item.value();
    
    switch (item.effect) {
        case 'score':
            const adjustedDropGain = typeof applyPlanetHarvestCap === 'function'
                ? applyPlanetHarvestCap(value)
                : value;
            if (typeof addScore === 'function') {
                addScore(adjustedDropGain);
            }
            showFloatingText(`+${formatNumber(adjustedDropGain)} Entropie!`, '#FFD700');
            break;
            
        case 'clickBoost':
            // Vérifier s'il y a déjà un effet clickBoost actif
            const existingClickBoost = activeEffects.find(effect => effect.type === 'clickBoost');
            
            if (existingClickBoost) {
                // Remettre le timer au maximum et mettre à jour la valeur
                existingClickBoost.value = value;
                existingClickBoost.endTime = Date.now() + item.duration;
                existingClickBoost.item = item;
                showFloatingText(`🔋 Batterie rechargée! +${value}`, item.color);
            } else {
                // Créer un nouvel effet
                const clickBoost = {
                    type: 'clickBoost',
                    value: value,
                    endTime: Date.now() + item.duration,
                    item: item
                };
                activeEffects.push(clickBoost);
                showFloatingText(`+${value} Click Power!`, item.color);
            }

            // Le bonus est lu par getDropFlatClickBonus() lors du recalcul
            if (typeof updateClickPower === 'function') {
                updateClickPower();
            }
            updateActiveEffectsDisplay(); // Mettre à jour l'affichage
            break;
            
        case 'scoreMultiplier':
            // Vérifier s'il y a déjà un effet scoreMultiplier actif
            const existingMultiplier = activeEffects.find(effect => effect.type === 'scoreMultiplier');
            
            if (existingMultiplier) {
                // Remettre le timer au maximum et mettre à jour la valeur si elle est meilleure
                existingMultiplier.endTime = Date.now() + item.duration;
                if (value > existingMultiplier.value) {
                    existingMultiplier.value = value;
                    existingMultiplier.item = item;
                    showFloatingText(`⚡ Amplificateur amélioré! x${value.toFixed(2)}`, item.color);
                } else {
                    showFloatingText(`⚡ Amplificateur rechargé!`, item.color);
                }
            } else {
                // Créer un nouvel effet
                const multiplier = {
                    type: 'scoreMultiplier',
                    value: value,
                    endTime: Date.now() + item.duration,
                    item: item
                };
                activeEffects.push(multiplier);
                showFloatingText(`x${value.toFixed(2)} Multiplicateur!`, item.color);
            }
            updateActiveEffectsDisplay(); // Mettre à jour l'affichage
            break;
            
        case 'stardust':
            if (typeof window.stardust !== 'undefined') {
                window.stardust += value;
                showFloatingText(`+${value} Stardust!`, item.color);
                if (typeof updatePrestigeDisplay === 'function') {
                    updatePrestigeDisplay();
                }
            }
            break;
    }
    
    // Mettre à jour l'affichage
    updateDisplay();
}

// Appliquer l'effet d'un item permanent
function applyPermanentItemEffect(item) {
    // Ajouter l'item à la collection
    collectedItems.push(item.id);
    
    // Initialiser le niveau à 1
    itemLevels[item.id] = 1;
    
    // Appliquer l'effet permanent selon le type avec le bonus de niveau 1
    const bonus = getItemBonus(item.id, 1);
    applyItemBonusToGame(item, bonus);
    
    // Affichage de confirmation
    showFloatingText(`🎊 ${item.name} collecté!`, item.color);
    
    // Mettre à jour l'affichage de la collection
    updateCollectionDisplay();
    
    // Mettre à jour l'affichage général
    updateDisplay();
    
    console.log(`🏆 Item permanent collecté: ${item.name} - Niveau 1`);
}

// Fonction pour appliquer le bonus d'un item au jeu
function applyItemBonusToGame(item, bonusValue) {
    switch (item.bonus) {
        case 'clickPower':
            // Bonus additif lu par getCollectionFlatClickBonus() lors du recalcul
            if (typeof updateClickPower === 'function') {
                updateClickPower();
            }
            break;
            
        case 'farmMultiplier':
            // Bonus permanent aux fermes
            if (typeof farms !== 'undefined') {
                farms.forEach(farm => {
                    farm.multiplier *= bonusValue;
                });
                updateScorePerSecond();
            }
            break;
            
        case 'toolMultiplier':
            // Bonus permanent aux outils
            if (typeof tools !== 'undefined') {
                tools.forEach(tool => {
                    tool.multiplier *= bonusValue;
                });
                updateClickPower();
            }
            break;
            
        case 'stardustBonus':
            // Bonus permanent au gain de stardust
            break;
            
        case 'autoClickSpeed':
            // Améliorer la vitesse d'auto-click
            break;
            
        case 'upgradeDiscount':
            // Réduction des coûts d'améliorations
            break;
            
        case 'dropChance':
            // Bonus de chance de drop
            break;
            
        case 'globalMultiplier':
            // Multiplicateur global appliqué à tout
            break;
            
        case 'allBonuses':
            // Petit bonus à tous les autres effets
            break;
    }
}

// Fonction pour améliorer un item
function upgradeItem(itemId) {
    if (!collectedItems.includes(itemId)) return false;
    
    const currentLevel = itemLevels[itemId] || 1;
    const upgradeCost = getItemUpgradeCost(itemId, currentLevel);
    
    if (currentLevel >= 50) {
        showFloatingText('Niveau maximum atteint!', '#FF0000');
        return false;
    }
    
    if (score < upgradeCost) {
        showFloatingText(`Pas assez de points! (${formatNumber(upgradeCost)} requis)`, '#FF0000');
        return false;
    }
    
    // Retirer l'ancien bonus
    const item = permanentItems.find(i => i.id === itemId);
    const oldBonus = getItemBonus(itemId, currentLevel);
    removeItemBonusFromGame(item, oldBonus);
    
    // Déduire le coût
    score -= upgradeCost;
    
    // Augmenter le niveau
    itemLevels[itemId] = currentLevel + 1;
    
    // Appliquer le nouveau bonus
    const newBonus = getItemBonus(itemId, currentLevel + 1);
    applyItemBonusToGame(item, newBonus);
    
    // Obtenir la nouvelle qualité
    const quality = getItemQuality(currentLevel + 1);
    
    // Affichage de confirmation
    showFloatingText(`⬆️ ${item.name} niveau ${currentLevel + 1}!`, quality.color);
    
    // Mettre à jour l'affichage
    updateCollectionDisplay();
    updateDisplay();
    
    console.log(`🔼 Item amélioré: ${item.name} niveau ${currentLevel + 1} (${quality.name})`);
    return true;
}

// Fonction pour retirer le bonus d'un item du jeu (pour les améliorations)
function removeItemBonusFromGame(item, bonusValue) {
    switch (item.bonus) {
        case 'clickPower':
            // Rien à retirer : le bonus est recalculé depuis le niveau courant de l'item
            if (typeof updateClickPower === 'function') {
                updateClickPower();
            }
            break;
            
        case 'farmMultiplier':
            if (typeof farms !== 'undefined') {
                farms.forEach(farm => {
                    farm.multiplier /= bonusValue;
                });
                updateScorePerSecond();
            }
            break;
            
        case 'toolMultiplier':
            if (typeof tools !== 'undefined') {
                tools.forEach(tool => {
                    tool.multiplier /= bonusValue;
                });
                updateClickPower();
            }
            break;
    }
}

// Fonction pour afficher du texte flottant
function showFloatingText(text, color) {
    const textElement = document.createElement('div');
    textElement.className = 'floating-drop-text';
    textElement.textContent = text;
    textElement.style.position = 'fixed';
    textElement.style.left = '50%';
    textElement.style.top = '20%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.color = color;
    textElement.style.fontSize = '18px';
    textElement.style.fontWeight = 'bold';
    textElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    textElement.style.pointerEvents = 'none';
    textElement.style.zIndex = '1001';
    textElement.style.animation = 'floatUp 1.5s ease-out forwards';
    
    document.body.appendChild(textElement);
    
    setTimeout(() => {
        if (textElement.parentNode) {
            textElement.parentNode.removeChild(textElement);
        }
    }, 1500);
}

// Fonction pour nettoyer les effets expirés
function cleanupExpiredEffects() {
    const now = Date.now();
    const expiredEffects = activeEffects.filter(effect => effect.endTime <= now);
    
    expiredEffects.forEach(effect => {
        switch (effect.type) {
            case 'clickBoost':
                recalculerClic = true;
                showFloatingText(`🔋 Batterie épuisée`, '#888888');
                break;
            case 'scoreMultiplier':
                showFloatingText(`⚡ Amplificateur épuisé`, '#888888');
                break;
        }
    });
    
    // Garder seulement les effets non expirés
    activeEffects = activeEffects.filter(effect => effect.endTime > now);
    
    // Mettre à jour l'affichage des effets
    updateActiveEffectsDisplay();
}

// Fonction pour mettre à jour l'affichage des effets actifs
function updateActiveEffectsDisplay() {
    const container = document.getElementById('active-effects');
    const effectsList = document.getElementById('effects-list');
    
    if (!container || !effectsList) return;
    
    // Si aucun effet actif, cacher le container
    if (activeEffects.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    // Afficher le container
    container.classList.remove('hidden');
    
    // Vider la liste
    effectsList.innerHTML = '';
    
    const now = Date.now();
    
    // Ajouter chaque effet
    activeEffects.forEach(effect => {
        const timeLeft = Math.max(0, effect.endTime - now);
        const secondsLeft = Math.ceil(timeLeft / 1000);
        
        const effectElement = document.createElement('div');
        effectElement.className = `effect-item ${effect.type}`;
        
        // Ajouter la classe d'expiration si moins de 3 secondes
        if (secondsLeft <= 3) {
            effectElement.classList.add('expiring');
        }
        
        let description = '';
        switch (effect.type) {
            case 'clickBoost':
                description = `+${effect.value} Click Power`;
                break;
            case 'scoreMultiplier':
                description = `x${effect.value.toFixed(2)} Score`;
                break;
        }
        
        effectElement.innerHTML = `
            <div class="effect-icon">${effect.item.emoji}</div>
            <div class="effect-info">
                <div class="effect-name">${effect.item.name}</div>
                <div class="effect-description">${description}</div>
                <div class="effect-timer">${secondsLeft}s</div>
            </div>
        `;
        
        effectsList.appendChild(effectElement);
    });
}

// Fonction pour afficher/cacher manuellement la zone d'effets
function toggleActiveEffectsDisplay() {
    const container = document.getElementById('active-effects');
    if (container) {
        container.classList.toggle('hidden');
    }
}

// Fonction utilitaire pour obtenir les effets actifs (debug)
function getActiveEffectsInfo() {
    return activeEffects.map(effect => ({
        type: effect.type,
        value: effect.value,
        timeLeft: Math.max(0, effect.endTime - Date.now()),
        itemName: effect.item.name
    }));
}

// Fonction pour mettre à jour l'affichage de la collection
function updateCollectionDisplay() {
    const container = document.getElementById('collection-panel');
    if (!container) return;
    
    const collectionGrid = document.getElementById('collection-grid');
    if (!collectionGrid) return;
    
    // Vider la grille
    collectionGrid.innerHTML = '';
    
    // Afficher tous les items permanents (collectés et non collectés)
    permanentItems.forEach(item => {
        const isCollected = collectedItems.includes(item.id);
        
        const itemElement = document.createElement('div');
        itemElement.className = `collection-item ${isCollected ? 'collected' : 'locked'}`;
        
        if (isCollected) {
            const level = itemLevels[item.id] || 1;
            const quality = getItemQuality(level);
            const currentBonus = getItemBonus(item.id, level);
            const upgradeCost = level < 50 ? getItemUpgradeCost(item.id, level) : 0;
            
            let bonusText = '';
            if (item.bonus === 'clickPower') {
                bonusText = `+${currentBonus} Click Power`;
            } else {
                bonusText = `x${currentBonus.toFixed(2)} ${item.description.split(' ').slice(1).join(' ')}`;
            }
            
            itemElement.innerHTML = `
                <div class="collection-emoji">${item.emoji}</div>
                <div class="collection-name">${item.name}</div>
                <div class="collection-level" style="color: ${quality.color}">Niv. ${level}</div>
                <div class="collection-quality" style="color: ${quality.color}">${quality.name}</div>
                <div class="collection-bonus">${bonusText}</div>
                ${level < 50 ? `<div class="collection-upgrade-cost">${formatNumber(upgradeCost)}</div>` : '<div class="collection-max">MAX</div>'}
            `;
            
            itemElement.style.borderColor = quality.color;
            itemElement.style.boxShadow = `0 0 10px ${quality.color}40`;
            
            // Ajouter l'événement de clic pour améliorer
            if (level < 50) {
                itemElement.style.cursor = 'pointer';
                itemElement.addEventListener('click', () => upgradeItem(item.id));
                
                // Désactiver visuellement si pas assez de points
                if (score < upgradeCost) {
                    itemElement.classList.add('insufficient-funds');
                }
            }
            
            itemElement.title = `${item.name} - Niveau ${level} (${quality.name})\n${bonusText}${level < 50 ? `\nCoût amélioration: ${formatNumber(upgradeCost)}` : '\nNiveau maximum atteint'}`;
        } else {
            itemElement.innerHTML = `
                <div class="collection-emoji">❓</div>
                <div class="collection-name">???</div>
                <div class="collection-level">???</div>
                <div class="collection-quality">???</div>
            `;
            itemElement.title = 'Item non découvert';
        }
        
        collectionGrid.appendChild(itemElement);
    });
    
    // Mettre à jour le compteur
    const counter = document.getElementById('collection-counter');
    if (counter) {
        counter.textContent = `${collectedItems.length}/${permanentItems.length}`;
    }
    
    // Afficher le panel s'il y a au moins un item collecté
    if (collectedItems.length > 0) {
        container.classList.remove('hidden');
    }
}

// Fonction pour afficher/masquer le panel de collection
function toggleCollectionPanel() {
    const container = document.getElementById('collection-panel');
    if (container) {
        container.classList.toggle('minimized');
    }
}

// Fonction pour obtenir le multiplicateur de score actuel
function getCurrentScoreMultiplier() {
    let multiplier = 1;
    activeEffects.forEach(effect => {
        if (effect.type === 'scoreMultiplier') {
            multiplier *= effect.value;
        }
    });
    return multiplier;
}

// Fonction d'initialisation
function initializeDropSystem() {
    // Nettoyer les effets expirés toutes les secondes
    setInterval(cleanupExpiredEffects, 1000);
    
    // Mettre à jour l'affichage des effets plus fréquemment pour les timers
    setInterval(updateActiveEffectsDisplay, 100);

    // Rafraîchir l'affichage de la collection au démarrage/chargement
// Somme des bonus ADDITIFS temporaires de puissance de clic (batteries actives)
function getDropFlatClickBonus() {
    return activeEffects.reduce((total, effect) => {
        return effect.type === 'clickBoost' ? total + effect.value : total;
    }, 0);
}

// Somme des bonus ADDITIFS permanents de puissance de clic apportés par la collection
function getCollectionFlatClickBonus() {
    return collectedItems.reduce((total, itemId) => {
        const item = permanentItems.find(permanentItem => permanentItem.id === itemId);
        if (!item || item.bonus !== 'clickPower') return total;

        return total + getItemBonus(itemId, itemLevels[itemId] || 1);
    }, 0);
}

// Réapplique les multiplicateurs de la collection aux fermes / outils.
// Précondition : les multiplicateurs viennent d'être remis à 1 (prestige, nouvelle partie).
// Chaque palier d'amélioration acheté double la production de l'objet
function getMultiplicateurAmeliorations(item) {
    const paliersAchetes = Object.values(item.upgrades || {}).filter(Boolean).length;
    return Math.pow(2, paliersAchetes);
}

function reapplyCollectionBonuses() {
    let bonusFermes = 1;
    let bonusOutils = 1;

    collectedItems.forEach(itemId => {
        const item = permanentItems.find(permanentItem => permanentItem.id === itemId);
        if (!item) return;

        const bonus = getItemBonus(itemId, itemLevels[itemId] || 1);

        if (item.bonus === 'farmMultiplier') {
            bonusFermes *= bonus;
        } else if (item.bonus === 'toolMultiplier') {
            bonusOutils *= bonus;
        }
    });

    // Le multiplicateur est entièrement dérivable : chaque amélioration achetée le double,
    // et la collection s'applique par-dessus. On le recalcule au lieu de l'accumuler,
    // pour que la fonction reste idempotente quel que soit le nombre d'appels.
    if (typeof farms !== 'undefined') {
        farms.forEach(farm => {
            farm.multiplier = getMultiplicateurAmeliorations(farm) * bonusFermes;
        });
    }

    if (typeof tools !== 'undefined') {
        tools.forEach(tool => {
            tool.multiplier = getMultiplicateurAmeliorations(tool) * bonusOutils;
        });
    }

    if (typeof updateScorePerSecond === 'function') {
        updateScorePerSecond();
    }

    if (typeof updateClickPower === 'function') {
        updateClickPower();
    }
}

    updateCollectionDisplay();
    
    console.log('🎁 Système de drops initialisé');
}

// Rendre les fonctions accessibles globalement
window.handleClickDrop = handleClickDrop;
window.getCurrentScoreMultiplier = getCurrentScoreMultiplier;
window.initializeDropSystem = initializeDropSystem;
window.updateActiveEffectsDisplay = updateActiveEffectsDisplay;
window.toggleActiveEffectsDisplay = toggleActiveEffectsDisplay;
window.getActiveEffectsInfo = getActiveEffectsInfo;
window.updateCollectionDisplay = updateCollectionDisplay;
window.toggleCollectionPanel = toggleCollectionPanel;
window.upgradeItem = upgradeItem;
window.collectedItems = collectedItems;
window.itemLevels = itemLevels;
window.permanentItems = permanentItems;
window.getDropFlatClickBonus = getDropFlatClickBonus;
window.getCollectionFlatClickBonus = getCollectionFlatClickBonus;
window.reapplyCollectionBonuses = reapplyCollectionBonuses;
