self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
// Fetch-handler niet nodig; dit is genoeg voor installability.
