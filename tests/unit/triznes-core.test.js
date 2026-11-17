import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';


const sdkCode = fs.readFileSync(path.resolve('apps/web/src/js/triznes-core-sdk.js'), 'utf8');
const manifestJson = JSON.parse(fs.readFileSync(path.resolve('apps/web/manifest.webmanifest'), 'utf8'));


function loadSdk() {
const storage = new Map();
const sandbox = {
window: {
TRIZNES_CONFIG: {},
matchMedia: () => ({ matches: false }),
navigator: {},
addEventListener: () => {}
},
document: {
querySelector: () => null,
getElementById: () => null
},
navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' },
localStorage: {
getItem: (k) => storage.get(k) ?? null,
setItem: (k, v) => storage.set(k, String(v)),
removeItem: (k) => storage.delete(k)
}
};
vm.createContext(sandbox);
vm.runInContext(sdkCode, sandbox);
return sandbox.window.TRIZNES_SDK;
}


describe('TRIZNES MASTER BUILD (SIGNAL_013) — Core & Security Invariants', () => {
let sdk;


beforeEach(() => {
sdk = loadSdk();
});


it('строго разделяет линии DANIEL и НЕО и проверяет 14 персонажей', () => {
expect(sdk.CHARACTER_ROSTER.length).toBe(14);
const daniel = sdk.CHARACTER_ROSTER.find((c) => c.slug === 'daniel');
const neo = sdk.CHARACTER_ROSTER.find((c) => c.slug === 'neo');
expect(daniel).toBeDefined();
expect(neo).toBeDefined();
expect(daniel.verified).toBe(true);
expect(neo.verified).toBe(false);
});


it('блокирует воспроизведение медиа при playback_url === null', () => {
const blocked = sdk.evaluateMediaPlayback({ title: 'Test', origin: 'REAL', playback_url: null });
expect(blocked.playable).toBe(false);
expect(blocked.statusLabel).toContain('ОЖИДАЕТ');


const ready = sdk.evaluateMediaPlayback({ title: 'Ready', origin: 'REAL', playback_url: 'https://cdn.example/master.mp4' });
expect(ready.playable).toBe(true);
expect(ready.url).toBe('https://cdn.example/master.mp4');
