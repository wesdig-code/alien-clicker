const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('./helpers/game.cjs');

function collect(game, id) {
    game.evaluate(`applyPermanentItemEffect(permanentItems.find(item => item.id === '${id}'))`);
}

function closeTo(actual, expected) {
    assert(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
}

test('les neuf objets de collection agissent sur les calculs annoncés', () => {
    const game = createGame();
    game.evaluate('farms[0].count = 10; tools[0].level = 10; updateScorePerSecond(); updateClickPower();');
    collect(game, 'alien_egg');
    assert.equal(game.context.clickPower, 16);
    collect(game, 'crystal_core');
    closeTo(game.context.scorePerSecond, 11);
    collect(game, 'golden_wrench');
    closeTo(game.context.clickPower, 17.5);
    collect(game, 'star_fragment');
    assert.equal(game.evaluate('calculateStardustGain(1000000)'), 24);
    collect(game, 'time_orb');
    assert.equal(game.evaluate('getAutoClickIntervalMs()'), 800);
    collect(game, 'quantum_chip');
    assert.equal(game.evaluate("getUpgradeCost(farms[0], 10, 'farm')"), 900);
    collect(game, 'cosmic_shard');
    closeTo(game.evaluate('getCollectionDropMultiplier()'), 1.3);
    collect(game, 'void_essence');
    closeTo(game.context.clickPower, 21.875);
    closeTo(game.context.scorePerSecond, 13.75);
    collect(game, 'infinity_stone');
    closeTo(game.context.clickPower, 24.0625);
    closeTo(game.context.scorePerSecond, 15.125);
    assert.equal(game.evaluate('calculateStardustGain(1000000)'), 26);
    assert.equal(game.evaluate('getAutoClickIntervalMs()'), 727);
    assert.equal(game.evaluate("getUpgradeCost(farms[0], 10, 'farm')"), 818);
    closeTo(game.evaluate('getCollectionDropMultiplier()'), 1.43);
});

test('les niveaux améliorent les bonus, sans intervalle négatif ni double application', () => {
    const game = createGame();
    game.evaluate('score = totalScoreEarned = 1e12; farms[0].count = 10; farms[0].upgrades.level10 = true;');
    collect(game, 'crystal_core');
    game.evaluate("upgradeItem('crystal_core'); reapplyCollectionBonuses(); reapplyCollectionBonuses();");
    closeTo(game.context.scorePerSecond, 22.2);
    collect(game, 'cosmic_shard');
    game.evaluate("upgradeItem('cosmic_shard')");
    closeTo(game.evaluate('getCollectionDropMultiplier()'), 1.33);
    collect(game, 'star_fragment');
    game.evaluate("upgradeItem('star_fragment')");
    assert.equal(game.evaluate('calculateStardustGain(100000000)'), 244);
    collect(game, 'quantum_chip');
    game.evaluate("upgradeItem('quantum_chip')");
    assert.equal(game.evaluate("getUpgradeCost(farms[0], 10, 'farm')"), 890);
    collect(game, 'time_orb');
    game.evaluate("upgradeItem('time_orb'); prestigeUpgrades.find(u => u.id === 'auto_click').level = 1; startAutoClicker();");
    assert.equal(game.intervals.get(game.context.autoClickerInterval).delay, 780);
    game.evaluate("itemLevels.time_orb = 50; startAutoClicker();");
    assert.equal(game.intervals.get(game.context.autoClickerInterval).delay, 100);
    assert.equal([...game.intervals.values()].filter(timer => timer.delay === 100).length, 1);
});

test('la réduction de coût couvre les améliorations et le Stardust bonus couvre les drops', () => {
    const game = createGame();
    collect(game, 'quantum_chip');
    assert.equal(game.evaluate("getPrestigeUpgradeCost(prestigeUpgrades.find(u => u.id === 'click_boost'))"), 9);
    assert.equal(game.evaluate("getItemUpgradeCost('alien_egg', 1)"), 5091);
    collect(game, 'star_fragment');
    game.evaluate("applyItemEffect({ effect: 'stardust', value: () => 2, color: '' })");
    closeTo(game.context.stardust, 2.4);
});

test("le niveau de l'Éclat Cosmique change effectivement le tirage des drops", () => {
    const game = createGame();
    collect(game, 'cosmic_shard');
    game.evaluate(`
        createDropEffect = item => { window.lastDropId = item.id; };
        function rollDrop(level) {
            itemLevels.cosmic_shard = level;
            window.lastDropId = null;
            const rolls = [0.33, 0.99, 0];
            Math.random = () => rolls.shift();
            handleClickDrop(0, 0);
            return window.lastDropId;
        }
    `);
    // Un tirage à 33 % échoue au niveau 1 (32,5 %), mais passe au niveau 2 (33,25 %).
    assert.equal(game.evaluate('rollDrop(1)'), null);
    assert.equal(game.evaluate('rollDrop(2)'), 'coin');
});

test('le seuil de prestige et son calcul concordent à 2500 Entropie', () => {
    const game = createGame();
    assert.equal(game.evaluate('calculateStardustGain(1000)'), 0);
    assert.equal(game.evaluate('calculateStardustGain(2499)'), 0);
    assert.equal(game.evaluate('calculateStardustGain(PRESTIGE_MIN_ENTROPY)'), 1);
});

function snapshot(game) {
    return JSON.parse(game.evaluate('JSON.stringify(serializeGameState())'));
}

test('un import invalide ne modifie ni la partie, ni ses effets, ni son autosave', () => {
    const game = createGame();
    game.evaluate(`
        score = totalScoreEarned = 10000;
        farms[0].count = 10;
        prestigeUpgrades.find(u => u.id === 'auto_click').level = 1;
        applyItemEffect({ effect: 'clickBoost', value: () => 4, duration: 10000 });
        applyPrestigeBonuses();
        autoSaveGame();
    `);
    const before = snapshot(game);
    const stored = game.storage.get('alienClickerSave');
    const timer = game.context.autoClickerInterval;
    for (const invalid of [
        { score: 123, farms: [null] },
        { score: '123' }, { score: -1 }, { score: Infinity }, {},
        { score: 123, farms: [{ id: 'basic', count: -1 }] },
        { score: 123, tools: [{ id: 'cursor', level: 1.5 }] },
        { score: 123, itemLevels: { alien_egg: 51 } },
        { score: 123, collectedItems: ['unknown'] },
        { score: 123, prestigeUpgrades: [{ id: 'auto_click', level: 2 }] },
        { score: 123, activeResearch: { id: 'xeno_fingers', startAt: 10, endAt: 1 } },
        { score: 123, totalScoreConverted: 124 },
        { score: 123, version: '9.0' },
        { score: 123, planetHarvested: { orbita_prime: NaN } }
    ]) {
        assert.throws(() => game.context.applyLoadedGameData(invalid), /Sauvegarde invalide/);
        assert.deepEqual(snapshot(game), before);
        assert.equal(game.storage.get('alienClickerSave'), stored);
        assert.equal(game.context.autoClickerInterval, timer);
        assert.equal(game.evaluate('getActiveEffectsInfo().length'), 1);
    }
});

test('une sauvegarde 1.3 complète les champs absents sans hériter de la partie ouverte', () => {
    const game = createGame();
    game.evaluate('score = totalScoreEarned = 10000; farms[1].count = 12; tools[1].level = 7; stardust = 99;');
    collect(game, 'alien_egg');
    game.evaluate("prestigeUpgrades.find(u => u.id === 'click_boost').level = 8;");
    game.context.applyLoadedGameData({ version: '1.3', score: 12, farms: [{ id: 'basic', count: 2 }] }, { refreshUI: false });
    assert.equal(game.context.score, 12);
    assert.equal(game.context.totalScoreConverted, 0);
    assert.equal(game.context.stardust, 0);
    assert.equal(game.context.clickPower, 1);
    assert.equal(game.context.scorePerSecond, 2);
    assert.equal(game.evaluate('farms[1].count + tools[1].level'), 0);
    assert.equal(game.context.collectedItems.length, 0);
});

test('export/import conserve la collection, ses références et les bonus sans les cumuler', () => {
    const game = createGame();
    game.evaluate('score = totalScoreEarned = 1e6; farms[0].count = 10; farms[0].upgrades.level10 = true; tools[0].level = 3;');
    for (const id of ['alien_egg', 'crystal_core', 'golden_wrench', 'void_essence', 'infinity_stone']) collect(game, id);
    game.evaluate("upgradeItem('crystal_core');");
    const original = snapshot(game);
    const collectedReference = game.context.collectedItems;
    const levelsReference = game.context.itemLevels;
    game.context.applyLoadedGameData(original, { refreshUI: false });
    assert.equal(game.context.collectedItems, collectedReference);
    assert.equal(game.context.itemLevels, levelsReference);
    closeTo(game.context.clickPower, original.clickPower);
    closeTo(game.context.scorePerSecond, original.scorePerSecond);
    game.context.applyLoadedGameData(snapshot(game), { refreshUI: false });
    closeTo(game.context.scorePerSecond, original.scorePerSecond);
    original.farms[0].count = 999;
    original.itemLevels.crystal_core = 50;
    assert.equal(game.evaluate('farms[0].count'), 10);
    assert.equal(game.context.itemLevels.crystal_core, 2);
});

for (const keepPrestige of [false, true]) {
    test(`le reset nettoie les effets et respecte keepPrestige=${keepPrestige}`, () => {
        const game = createGame();
        game.evaluate('score = totalScoreEarned = 10000; totalScoreConverted = 500; stardust = 25;');
        collect(game, 'alien_egg');
        game.evaluate(`
            prestigeUpgrades.find(u => u.id === 'click_boost').level = 2;
            farms[0].count = 4;
            unlockedResearch.push('xeno_fingers');
            researchPoints = 2;
            activeResearch = { id: 'plasma_fields', startAt: Date.now(), endAt: Date.now() + 30000 };
            planetHarvested.orbita_prime = 20000;
            claimedPlanetResearchRewards.push('orbita_prime');
            applyItemEffect({ effect: 'clickBoost', value: () => 4, duration: 10000 });
            applyItemEffect({ effect: 'scoreMultiplier', value: () => 2, duration: 15000 });
        `);
        game.context.resetRunState({ keepPrestige });
        assert.equal(game.evaluate('getActiveEffectsInfo().length'), 0);
        assert.equal(game.evaluate('getCurrentScoreMultiplier()'), 1);
        assert.equal(game.context.score, 0);
        assert.equal(game.context.scorePerSecond, 0);
        assert.equal(game.context.clickPower, keepPrestige ? 8 : 1);
        assert.equal(game.context.totalScoreEarned, keepPrestige ? 10000 : 0);
        assert.equal(game.context.totalScoreConverted, keepPrestige ? 500 : 0);
        assert.equal(game.context.stardust, keepPrestige ? 25 : 0);
        assert.equal(game.context.researchPoints, 0);
        assert.equal(game.context.activeResearch, null);
        assert.equal(game.context.unlockedResearch.length, 0);
        assert.equal(game.context.planetHarvested.orbita_prime, 0);
        assert.equal(game.context.claimedPlanetResearchRewards.length, 0);
    });
}

test('un import efface les effets temporaires avant de recalculer la puissance', () => {
    const game = createGame();
    const clean = snapshot(game);
    game.evaluate("applyItemEffect({ effect: 'clickBoost', value: () => 4, duration: 10000 });");
    game.context.applyLoadedGameData(clean, { refreshUI: false });
    assert.equal(game.context.clickPower, 1);
    assert.equal(game.evaluate('getActiveEffectsInfo().length'), 0);
});

test('les gains hors ligne changent de taux à la fin de la recherche', () => {
    const game = createGame();
    const data = snapshot(game);
    const now = game.evaluate('Date.now()');
    data.farms[0].count = 10;
    data.unlockedResearch = ['xeno_fingers', 'plasma_fields'];
    data.activeResearch = { id: 'quantum_drills', startAt: now - 135000, endAt: now - 60000 };
    data.lastSeenAt = now - 120000;
    game.context.applyLoadedGameData(data, { refreshUI: false });
    assert.equal(game.context.score, 1620);
    assert.equal(game.context.totalScoreEarned, 1620);
    assert.equal(game.context.scorePerSecond, 15);
    assert.equal(game.context.activeResearch, null);
    assert(game.context.unlockedResearch.includes('quantum_drills'));
});

test('les gains hors ligne restent plafonnés à huit heures et à la capacité planétaire', () => {
    const game = createGame();
    const data = snapshot(game);
    data.currentPlanetId = 'chronos_ash';
    data.currentSystemId = 'abyss_reach';
    data.farms[0].count = 1;
    data.lastSeenAt -= 12 * 3600 * 1000;
    game.context.applyLoadedGameData(data, { refreshUI: false });
    closeTo(game.context.score, 1.88 * 8 * 3600);

    data.currentPlanetId = 'orbita_prime';
    data.currentSystemId = 'core_sector';
    data.planetHarvested.orbita_prime = 19990;
    game.context.applyLoadedGameData(data, { refreshUI: false });
    assert.equal(game.context.score, 10);
    assert.equal(game.context.researchPoints, 1);
    assert.equal(game.context.planetHarvested.orbita_prime, 20000);
    game.advance(10000);
    game.context.applyLoadedGameData(snapshot(game), { refreshUI: false });
    assert.equal(game.context.researchPoints, 1);
});

test('une recherche achevée avant la fenêtre de huit heures utilise le nouveau taux', () => {
    const game = createGame();
    const data = snapshot(game);
    data.currentPlanetId = 'chronos_ash';
    data.currentSystemId = 'abyss_reach';
    data.farms[0].count = 1;
    data.unlockedResearch = ['xeno_fingers'];
    data.lastSeenAt -= 12 * 3600 * 1000;
    data.activeResearch = { id: 'plasma_fields', startAt: data.lastSeenAt - 15000, endAt: data.lastSeenAt + 15000 };
    game.context.applyLoadedGameData(data, { refreshUI: false });
    closeTo(game.context.score, 1.88 * 1.2 * 8 * 3600);
    assert.equal(game.context.activeResearch, null);
});

test('une date future ne crédite rien et une sauvegarde sans date termine quand même sa recherche échue', () => {
    const game = createGame();
    const data = snapshot(game);
    data.farms[0].count = 1;
    data.lastSeenAt += 60000;
    game.context.applyLoadedGameData(data, { refreshUI: false });
    assert.equal(game.context.score, 0);
    data.activeResearch = { id: 'xeno_fingers', startAt: data.lastSeenAt - 120000, endAt: data.lastSeenAt - 90000 };
    delete data.lastSeenAt;
    game.context.applyLoadedGameData(data, { refreshUI: false });
    assert.equal(game.context.score, 0);
    assert(game.context.unlockedResearch.includes('xeno_fingers'));
});

test('le tick suivant un import ne recrédite pas le temps de la partie précédente', () => {
    const game = createGame();
    game.evaluate('farms[0].count = 1; updateScorePerSecond(); demarrerBoucleJeu();');
    game.advance(5000);
    game.context.applyLoadedGameData(snapshot(game), { refreshUI: false });
    game.advance(1000);
    game.evaluate('tickBoucleJeu()');
    assert.equal(game.context.score, 1);
    assert.equal(game.context.planetHarvested.orbita_prime, 1);
});
