// GGamble Service Worker – nur damit man GGamble als App installieren kann.
// Speichert NICHTS zwischen (sonst kämen Updates zu spät an): immer frisch aus dem Netz.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { });
