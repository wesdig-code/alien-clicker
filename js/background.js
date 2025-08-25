// Système d'émojis flottants en arrière-plan

// Liste des émojis aliens et spatiaux
const floatingEmojis = [
    '👽', '🛸', '🚀', '🌌', '⭐', '✨', '🌟', '💫', 
    '🌠', '🛰️', '🌙', '🌕', '🌖', '🌗', '🌘', '🌑',
    '🌒', '🌓', '🌔', '👾', '🤖', '🔮', '💎', '⚡'
];

// Types d'animations
const animationTypes = ['floatVertical']; // Une seule animation : de bas en haut

// Variables de contrôle
let backgroundEmojisEnabled = true;
let backgroundInterval = null;

// Fonction pour créer un micro-émoji (plus petit et plus rapide)
function createMicroFloatingEmoji() {
    const emoji = document.createElement('div');
    emoji.className = 'floating-emoji';
    
    // Choisir un émoji aléatoire
    const randomEmoji = floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];
    emoji.textContent = randomEmoji;
    
    // Durée plus courte pour les micro-émojis
    const duration = Math.random() * 10 + 8; // Entre 8 et 18 secondes
    
    // Taille plus petite
    const size = Math.random() * 0.8 + 0.5; // Entre 0.5 et 1.3rem
    emoji.style.fontSize = `${size}rem`;
    
    // Opacité encore plus faible
    emoji.style.opacity = '0.2';
    
    // Position de départ : en bas de l'écran, position horizontale aléatoire
    emoji.style.left = Math.random() * 100 + '%';
    emoji.style.top = '100vh'; // Commence en bas de l'écran
    
    // Appliquer l'animation de montée
    emoji.style.animation = `floatVertical ${duration}s linear infinite`;
    
    // Délai aléatoire avant le démarrage
    const delay = Math.random() * 2;
    emoji.style.animationDelay = `${delay}s`;
    
    // Ajouter au body
    document.body.appendChild(emoji);
    
    // Supprimer l'émoji après l'animation
    setTimeout(() => {
        if (emoji.parentNode) {
            emoji.parentNode.removeChild(emoji);
        }
    }, (duration + delay) * 1000);
}

// Fonction pour créer un émoji flottant
function createFloatingEmoji() {
    const emoji = document.createElement('div');
    emoji.className = 'floating-emoji';
    
    // Choisir un émoji aléatoire
    const randomEmoji = floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];
    emoji.textContent = randomEmoji;
    
    // Durée aléatoire entre 15 et 30 secondes
    const duration = Math.random() * 15 + 30;
    
    // Taille aléatoire
    const size = Math.random() * 1.5 + 1; // Entre 1 et 2.5rem
    emoji.style.fontSize = `${size}rem`;
    
    // Position de départ : en bas de l'écran, position horizontale aléatoire
    emoji.style.left = Math.random() * 100 + '%';
    emoji.style.top = '100vh'; // Commence en bas de l'écran
    
    // Appliquer l'animation de montée
    emoji.style.animation = `floatVertical ${duration}s linear infinite`;
    
    // Délai aléatoire avant le démarrage
    const delay = Math.random() * 5;
    emoji.style.animationDelay = `${delay}s`;
    
    // Ajouter au body
    document.body.appendChild(emoji);
    
    // Supprimer l'émoji après l'animation
    setTimeout(() => {
        if (emoji.parentNode) {
            emoji.parentNode.removeChild(emoji);
        }
    }, (duration + delay) * 1000);
}

// Fonction pour démarrer le système d'émojis flottants
function startFloatingEmojis() {
    if (!backgroundEmojisEnabled) return;
    
    console.log('🌌 Démarrage des émojis flottants');
    
    // Créer le premier lot d'émojis
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            if (backgroundEmojisEnabled) {
                createFloatingEmoji();
            }
        }, i * 1500); // Espacer de 1.5 secondes
    }
    
    // Continuer à créer des émojis de manière aléatoire
    backgroundInterval = setInterval(() => {
        if (backgroundEmojisEnabled) {
            // Probabilité de créer un émoji (90% de chance)
            if (Math.random() < 0.9) {
                createFloatingEmoji();
            }
            
            // Chance supplémentaire de créer un deuxième émoji (40% de chance)
            if (Math.random() < 0.4) {
                setTimeout(() => {
                    if (backgroundEmojisEnabled) {
                        createFloatingEmoji();
                    }
                }, 500); // Délai de 0.5 seconde
            }
            
            // Chance de créer des micro-émojis (60% de chance)
            if (Math.random() < 0.6) {
                setTimeout(() => {
                    if (backgroundEmojisEnabled) {
                        createMicroFloatingEmoji();
                    }
                }, Math.random() * 1000); // Délai aléatoire jusqu'à 1 seconde
            }
        }
    }, 2000); // Vérifier toutes les 2 secondes
}

// Fonction pour arrêter les émojis flottants
function stopFloatingEmojis() {
    // Arrêter l'intervalle
    if (backgroundInterval) {
        clearInterval(backgroundInterval);
        backgroundInterval = null;
    }
    
    // Supprimer tous les émojis existants
    const existingEmojis = document.querySelectorAll('.floating-emoji');
    existingEmojis.forEach(emoji => {
        if (emoji.parentNode) {
            emoji.parentNode.removeChild(emoji);
        }
    });
}

// Fonction pour basculer l'état des émojis flottants
function toggleBackgroundEmojis() {
    backgroundEmojisEnabled = !backgroundEmojisEnabled;
    
    const statusSpan = document.getElementById('background-status');
    
    if (backgroundEmojisEnabled) {
        startFloatingEmojis();
        if (statusSpan) statusSpan.textContent = '🌟 Désactiver les émojis';
        console.log('✅ Émojis flottants activés');
    } else {
        stopFloatingEmojis();
        if (statusSpan) statusSpan.textContent = '🚫 Activer les émojis';
        console.log('❌ Émojis flottants désactivés');
    }
}

// Démarrer automatiquement quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    startFloatingEmojis();
});

// Rendre les fonctions accessibles globalement
window.startFloatingEmojis = startFloatingEmojis;
window.stopFloatingEmojis = stopFloatingEmojis;
window.toggleBackgroundEmojis = toggleBackgroundEmojis;
