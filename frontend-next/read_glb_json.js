const fs = require('fs');

const buffer = fs.readFileSync('public/models/boykidavatar.glb');

const jsonLen = buffer.readUInt32LE(12);
const jsonData = buffer.slice(20, 20 + jsonLen).toString('utf8');

try {
    const gltf = JSON.parse(jsonData);
    if (gltf.animations && gltf.animations.length > 0) {
        console.log("=== ANIMATIONS TROUVÉES ===");
        gltf.animations.forEach((anim, i) => console.log(`[${i}] "${anim.name}"`));
        console.log("===========================");
    } else {
        console.log("Aucune animation trouvée.");
    }
} catch (e) {
    console.error("Erreur:", e.message);
}
