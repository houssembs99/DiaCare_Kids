const fs = require('fs');
const { parse } = require('@gltf-transform/core');

// Simple way to check strings in binary GLB
const buffer = fs.readFileSync('public/models/avatar_test.glb');
const content = buffer.toString('utf8');

// Animations names are usually stored as strings
// This is a hacky way to find them, but let's try a better one with a small script
console.log("Checking animation names...");
