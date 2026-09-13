const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Les scripts tournent dans un même contexte, comme les <script> classiques du navigateur.
function createGame() {
    let now = 1_800_000_000_000;
    let nextTimer = 0;
    const intervals = new Map();
    const storage = new Map();
    const context = vm.createContext({
        console,
        Date: class extends Date {
            constructor(...args) { super(...(args.length ? args : [now])); }
            static now() { return now; }
        },
        setInterval(callback, delay) {
            const id = ++nextTimer;
            intervals.set(id, { callback, delay });
            return id;
        },
        clearInterval(id) { intervals.delete(id); },
        setTimeout() { return ++nextTimer; },
        clearTimeout() {},
        addEventListener() {},
        localStorage: {
            setItem(key, value) { storage.set(key, value); },
            getItem(key) { return storage.get(key) ?? null; },
            removeItem(key) { storage.delete(key); }
        },
        document: {
            addEventListener() {},
            getElementById() { return null; },
            querySelector() { return null; }
        }
    });
    context.window = context;
    const root = path.resolve(__dirname, '../..');
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    for (const [, filename] of html.matchAll(/<script src="([^"]+)"/g)) {
        vm.runInContext(fs.readFileSync(path.join(root, filename), 'utf8'), context, { filename });
    }
    // Seul le rendu est neutralisé : calculs, mutations et timers restent ceux du jeu.
    for (const name of ['updateDisplay', 'refreshShop', 'renderGalaxyMap', 'renderLaboratoryTree',
        'updateCollectionDisplay', 'updatePrestigeDisplay', 'initializePrestigeUpgrades',
        'updateActiveEffectsDisplay', 'showFloatingText', 'showOfflineGain']) {
        context[name] = () => {};
    }
    return {
        context,
        intervals,
        storage,
        evaluate: source => vm.runInContext(source, context),
        advance: milliseconds => { now += milliseconds; }
    };
}

module.exports = { createGame };
