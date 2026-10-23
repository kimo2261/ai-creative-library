const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const dataSource = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

class FakeElement {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.value = '';
    this.textContent = '';
    this.className = '';
    this.style = {};
    this.children = [];
    this.listeners = {};
  }

  addEventListener(type, handler) { this.listeners[type] = handler; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  removeChild(child) { this.children = this.children.filter(item => item !== child); }
  replaceChildren(...children) { this.children = children; }
  scrollIntoView() {}
  select() {}
  dispatch(type) { return this.listeners[type]?.({ target: this }); }
}

function boot({ storedFavorites = '[]', clipboard, storageWriteError = null } = {}) {
  const ids = ['count', 'favcount', 'search', 'cats', 'heading', 'cards', 'chosen',
    'brand', 'subject', 'style', 'ratio', 'platform', 'details', 'preview', 'copy', 'export'];
  const elements = Object.fromEntries(ids.map(id => [id, new FakeElement('div', id)]));
  Object.assign(elements.brand, { value: 'كوينز' });
  Object.assign(elements.subject, { value: 'قطعة شوكولاتة' });
  Object.assign(elements.style, { value: 'سينمائي فاخر' });
  Object.assign(elements.ratio, { value: '9:16' });
  Object.assign(elements.platform, { value: 'image' });

  const writes = [];
  const alerts = [];
  let legacyCopyCalls = 0;
  const body = new FakeElement('body');
  const document = {
    body,
    getElementById: id => elements[id],
    createElement: tag => new FakeElement(tag),
    execCommand(command) {
      if (command === 'copy') legacyCopyCalls += 1;
      return command === 'copy';
    }
  };
  const localStorage = {
    getItem: () => storedFavorites,
    setItem: (key, value) => {
      if (storageWriteError) throw storageWriteError;
      writes.push([key, value]);
    }
  };
  const context = vm.createContext({
    document,
    localStorage,
    navigator: clipboard ? { clipboard } : {},
    alert: message => alerts.push(message),
    Blob,
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    innerWidth: 1200,
    setTimeout: () => 0
  });

  vm.runInContext(dataSource, context);
  vm.runInContext(appSource, context);
  return { context, elements, writes, alerts, getLegacyCopyCalls: () => legacyCopyCalls };
}

test('catalog exposes 111 unique commands across 11 categories', () => {
  const { context } = boot();
  assert.equal(vm.runInContext('Object.keys(catalog).length', context), 11);
  assert.equal(vm.runInContext('commands.length', context), 111);
  assert.equal(vm.runInContext('new Set(commands.map(item => item.code)).size', context), 111);
});

test('search matches command codes across all categories', () => {
  const { elements } = boot();
  elements.search.value = 'remove-object';
  elements.search.dispatch('input');
  assert.equal(elements.heading.textContent, 'نتائج البحث (1)');
  assert.equal(elements.cards.children[0].children[0].textContent, 'حذف عنصر');
});

test('valid non-array favorites data is reset instead of breaking startup', () => {
  assert.doesNotThrow(() => boot({ storedFavorites: '{}' }));
  const { writes, elements } = boot({ storedFavorites: '{}' });
  assert.deepEqual(writes.at(-1), ['ai-library-favorites', '[]']);
  assert.equal(elements.favcount.textContent, 0);
});

test('blocked storage writes do not prevent rendering or in-session favorites', () => {
  const quotaError = new Error('Storage quota exceeded');
  quotaError.name = 'QuotaExceededError';
  const { elements } = boot({ storageWriteError: quotaError });

  assert.equal(elements.cards.children.length, 10);
  assert.match(elements.preview.textContent, /HERO-PRODUCT/);

  const firstFavoriteButton = elements.cards.children[0].children[2].children[1];
  firstFavoriteButton.onclick();
  assert.equal(elements.favcount.textContent, 1);
  assert.equal(elements.cards.children[0].children[2].children[1].textContent, '♥ محفوظ');
});

test('copy uses a legacy browser fallback when Clipboard API is unavailable', async () => {
  const { elements, alerts, getLegacyCopyCalls } = boot();
  await elements.copy.onclick();
  assert.equal(getLegacyCopyCalls(), 1);
  assert.equal(alerts.length, 0);
  assert.equal(elements.copy.textContent, 'تم النسخ ✓');
});

test('studio preview updates for video prompts', () => {
  const { elements } = boot();
  elements.platform.value = 'video';
  elements.platform.dispatch('input');
  assert.match(elements.preview.textContent, /Google Flow/);
  assert.match(elements.preview.textContent, /حركة الكاميرا/);
});

test('index loads repository-relative scripts suitable for GitHub Pages', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /<script src="data\.js"><\/script><script src="app\.js"><\/script>/);
});
