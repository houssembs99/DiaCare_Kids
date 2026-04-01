// Fichier temporaire pour désengager les anciens Service Workers en cache sur le port 3000
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
    self.registration.unregister();
    self.clients.matchAll().then(clients => {
        clients.forEach(client => client.navigate(client.url));
    });
});
