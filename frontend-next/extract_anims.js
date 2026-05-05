const fs = require('fs');
const path = require('path');

// Lecture brute du binaire pour trouver les chaînes de caractères des animations
const filePath = 'public/models/avatar_test.glb';
const buffer = fs.readFileSync(filePath);

console.log("Analyse des animations de avatar_test.glb...");

// Dans un GLB, les noms d'animations sont souvent précédés de certains patterns
// On va chercher les chaînes de texte lisibles
const content = buffer.toString('utf8');
const matches = content.match(/[a-zA-Z0-9_|.-]{3,30}/g);

if (matches) {
    // Filtrer les noms qui ressemblent à des animations (souvent avec | ou des noms communs)
    const animKeywords = ['idle', 'walk', 'run', 'wave', 'talk', 'happy', 'sad', 'tired', 'dance', 'action', 'armature'];
    const potentialAnims = [...new Set(matches.filter(m => 
        animKeywords.some(key => m.toLowerCase().includes(key)) || m.includes('|')
    ))];
    
    console.log("Noms potentiels trouvés :");
    potentialAnims.forEach(a => console.log("- " + a));
} else {
    console.log("Aucune chaîne trouvée.");
}
