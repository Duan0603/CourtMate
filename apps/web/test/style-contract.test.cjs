const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../src');
const walk = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(folder, entry.name)) : [path.join(folder, entry.name)]);
const files = walk(root).filter(file => /\.(tsx|css)$/.test(file) && (!file.includes(path.join('components','3d')) || /Sports(Overlays|Showcase3D)/.test(file)));
test('all web routes and UI components use the approved palette utilities', () => {
  const violations = [];
  const legacy = /\b(?:bg|text|border|ring|fill|stroke|outline|divide|from|via|to)-(?:slate|gray|red|rose|pink|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia)-\d+/g;
  for (const file of files) for (const match of fs.readFileSync(file, 'utf8').matchAll(legacy)) violations.push(path.relative(root, file) + ': ' + match[0]);
  assert.deepEqual(violations, []);
});
test('page canvas is white and accent tokens are the exact requested colors', () => {
  const css = fs.readFileSync(path.join(root, 'styles/tokens.css'), 'utf8');
  assert.match(css, /--cm-background: 255 255 255;/);
  assert.match(css, /--cm-baby: 143 217 251;/);
  assert.match(css, /--cm-tan: 210 180 140;/);
  assert.match(css, /--cm-primary: 24 72 255;/);
  assert.doesNotMatch(css, /--cm-(?:yellow|mint|coral):/);
});
test('shared elevation has no inset highlights or blurred clay shadows', () => {
  const css = fs.readFileSync(path.join(root, 'styles/tokens.css'), 'utf8');
  for (const [, value] of css.matchAll(/--cm-shadow-[a-z-]+:\s*([^;]+);/g)) {
    assert.doesNotMatch(value, /inset|rgba/);
    assert.match(value, /^\d+(?:px)? \d+(?:px)? 0 #111$/);
  }
  for (const file of files) assert.equal(/(?:box-shadow\s*:[^;}]*\binset\b|blur-(?:\[[^\]]+\]|sm|md|lg|xl|\d+xl))/.test(fs.readFileSync(file, 'utf8')), false, path.relative(root, file));
});

test('UI literals do not add accent colors outside tan, baby blue and dark blue', () => {
  const allowed = new Set(['#000','#000000','#111','#111111','#fff','#ffffff','#1848ff','#8fd9fb','#d2b48c','#3f3f3f']);
  const violations = [];
  for (const file of files) {
    if (file.endsWith('GoogleLoginButton.tsx')) continue; // Official sign-in provider artwork.
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      if (!(match[0].toLowerCase() === '#b42318' && file.endsWith('AuthCard.module.css')) && !allowed.has(match[0].toLowerCase())) violations.push(path.relative(root,file) + ': ' + match[0]);
    }
  }
  assert.deepEqual(violations, []);
});
