const $ = id => document.getElementById(id);

let category = 'تصوير المنتجات';
let onlyFav = false;
let selected = commands.find(item => item.code === 'HERO-PRODUCT');
let favorites = [];

try {
  const storedFavorites = JSON.parse(localStorage.getItem('ai-library-favorites') || '[]');
  if (Array.isArray(storedFavorites)) {
    const validCodes = new Set(commands.map(item => item.code));
    favorites = [...new Set(storedFavorites.filter(code => validCodes.has(code)))];
  }
} catch {
  favorites = [];
}

function save() {
  localStorage.setItem('ai-library-favorites', JSON.stringify(favorites));
  $('favcount').textContent = favorites.length;
}

function buildPrompt() {
  return `/${selected.code}
المطلوب: ${selected.name}.
البراند: ${$('brand').value}.
المنتج أو الموضوع: ${$('subject').value}.
الأسلوب: ${$('style').value}.
الأبعاد: ${$('ratio').value}.
تفاصيل إضافية: ${$('details').value || 'لا يوجد'}.
${$('platform').value === 'video'
    ? 'جهز برومبت فيديو متسلسلًا مع حركة الكاميرا والإضاءة مناسبًا لـ Google Flow.'
    : 'أنشئ أو عدل صورة بجودة احترافية مع ضبط الإضاءة والمنظور.'}
استخدم المرجع المرفق عند توفره وحافظ على الملامح والشعارات وتفاصيل المنتج الأصلية.`;
}

function renderPrompt() {
  $('chosen').textContent = `${selected.name} /${selected.code}`;
  $('preview').textContent = buildPrompt();
}

function render() {
  const query = $('search').value.trim().toLowerCase();
  $('cats').replaceChildren();

  for (const name of ['كل الأوامر', 'المفضلة', ...Object.keys(catalog)]) {
    const button = document.createElement('button');
    button.textContent = name;
    button.className = ((onlyFav && name === 'المفضلة') || (!onlyFav && name === category))
      ? 'active'
      : '';
    button.onclick = () => {
      onlyFav = name === 'المفضلة';
      category = name;
      render();
    };
    $('cats').append(button);
  }

  const found = commands.filter(item => (
    (category === 'كل الأوامر' || onlyFav || query || item.category === category)
    && (!onlyFav || favorites.includes(item.code))
    && `${item.name} ${item.code} ${item.category}`.toLowerCase().includes(query)
  ));

  $('heading').textContent = `${onlyFav ? 'المفضلة' : query ? 'نتائج البحث' : category} (${found.length})`;
  $('cards').replaceChildren();

  for (const item of found) {
    const card = document.createElement('article');
    card.className = 'card';

    const heading = document.createElement('h3');
    heading.textContent = item.name;

    const code = document.createElement('div');
    code.className = 'code';
    code.textContent = `/${item.code}`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const useButton = document.createElement('button');
    useButton.textContent = 'استخدام';
    useButton.onclick = () => {
      selected = item;
      renderPrompt();
      if (innerWidth < 760) $('chosen').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'heart';
    favoriteButton.textContent = favorites.includes(item.code) ? '♥ محفوظ' : '♡ مفضلة';
    favoriteButton.onclick = () => {
      favorites = favorites.includes(item.code)
        ? favorites.filter(codeValue => codeValue !== item.code)
        : [...favorites, item.code];
      save();
      render();
    };

    actions.append(useButton, favoriteButton);
    card.append(heading, code, actions);
    $('cards').append(card);
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // The API can exist but still be blocked outside a secure or focused context.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute?.('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('Copy command was rejected');
}

$('search').addEventListener('input', render);
for (const id of ['brand', 'subject', 'style', 'ratio', 'platform', 'details']) {
  $(id).addEventListener('input', renderPrompt);
}

$('copy').onclick = async () => {
  try {
    await copyText(buildPrompt());
    $('copy').textContent = 'تم النسخ ✓';
    setTimeout(() => { $('copy').textContent = 'نسخ البرومبت'; }, 1500);
  } catch {
    alert('تعذر النسخ تلقائيًا؛ حدد النص من المعاينة وانسخه.');
  }
};

$('export').onclick = () => {
  const data = JSON.stringify(commands.filter(item => favorites.includes(item.code)), null, 2);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  link.download = 'ai-library-favorites.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

$('count').textContent = commands.length;
save();
render();
renderPrompt();
