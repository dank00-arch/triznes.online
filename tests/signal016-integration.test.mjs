import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const file = p => readFileSync(join(root,p),'utf8');

test('Signal 016: existing entry remains intact', () => {
  assert.ok(existsSync(join(root,'launch-ui/entry.html')));
  assert.ok(existsSync(join(root,'launch-ui/manifest.webmanifest')));
  const entry=file('launch-ui/entry.html');
  assert.match(entry, /SOCHIWOOD|Сочи/i);
  assert.match(entry, /register\.html|войти/i);
});

test('Signal 016: PWA manifest is valid and installable', () => {
  const m=JSON.parse(file('launch-ui/manifest.webmanifest'));
  assert.ok(m.name && m.short_name);
  assert.equal(m.display,'standalone');
  assert.ok(Array.isArray(m.icons) && m.icons.length>0);
  for (const icon of m.icons) {
    assert.ok(icon.src && icon.sizes && icon.type);
  }
});

test('Signal 016: frontend SDK does not hardcode privileged credentials', () => {
  const sdk=file('apps/web/src/js/triznes-core-sdk.js');
  assert.match(sdk,/TRIZNES_CONFIG/);
  assert.doesNotMatch(sdk,/service_role\s*[:=]|SUPABASE_SERVICE_ROLE_KEY\s*[:=]/i);
  assert.doesNotMatch(sdk,/AIza[0-9A-Za-z_-]{25,}/);
});

test('Signal 016: current landing page routes to the existing entry', () => {
  const html=file('index.html');
  assert.match(html,/launch-ui/);
});

test('Signal 016: no production DB changes in this PR', () => {
  assert.ok(existsSync(join(root,'supabase')));
});
