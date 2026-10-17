'use strict';
/* ---------- Config ---------- */
const CFG = { email: 'jutthamid148@gmail.com', cur: 'Rs. ' };
// Real photos: put files in an images/ folder named by key (e.g. images/1.jpg, images/h0.jpg). Or override here:
// Optional real photos: PHOTOS = { 1: 'https://…/lawn.jpg' }  (falls back to generated art if the URL fails)
const PHOTOS = {};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => CFG.cur + n.toLocaleString('en-PK');
const svgIcon = name => `<svg class="svg" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let deferredInstallPrompt = null;

function initPwaInstall() {
  const prompt = $('#pwaInstall');
  const action = $('#pwaInstallAction');
  const help = $('#pwaInstallHelp');
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  let showingInstallHelp = false;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) return;

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isDismissed = () => {
    try { return sessionStorage.getItem('hf_install_dismissed') === '1'; }
    catch { return false; }
  };
  const dismiss = () => {
    prompt.hidden = true;
    try { sessionStorage.setItem('hf_install_dismissed', '1'); } catch {}
  };
  const show = () => {
    if (!isDismissed()) prompt.hidden = false;
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    prompt.hidden = true;
  });
  $('#pwaInstallDismiss').addEventListener('click', dismiss);
  action.addEventListener('click', async () => {
    if (showingInstallHelp) { dismiss(); return; }
    if (!deferredInstallPrompt) {
      help.textContent = ios
        ? 'In Safari, tap Share, then choose “Add to Home Screen”.'
        : 'Open your browser menu and choose “Install app” or “Add to Home Screen”.';
      help.hidden = false;
      action.textContent = 'Close';
      showingInstallHelp = true;
      return;
    }
    const installEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') prompt.hidden = true;
      else dismiss();
    } catch (error) {
      console.error('Hamid Fabrics app installation could not be started:', error);
      help.textContent = 'Use your browser menu to choose “Install app” or “Add to Home Screen”.';
      help.hidden = false;
      action.textContent = 'Close';
      showingInstallHelp = true;
    }
  });

  setTimeout(show, 5000);
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(error => {
      console.error('Hamid Fabrics offline support could not be enabled:', error);
    });
  }
}

/* Generated placeholder art (no external images needed) */
const uri = svg => 'data:image/svg+xml,' + encodeURIComponent(svg);
const art = h => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},65%,92%)"/><stop offset="1" stop-color="hsl(${h + 25},50%,74%)"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="62" r="20" fill="#fff" fill-opacity=".7"/><path d="M170 90h60l12 85 52 275H106l52-275z" fill="#fff" fill-opacity=".6" stroke="#b76e79" stroke-opacity=".5" stroke-width="3"/></svg>`);
const wide = h => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},70%,94%)"/><stop offset="1" stop-color="hsl(${h + 30},55%,78%)"/></linearGradient></defs><rect width="1600" height="700" fill="url(#g)"/><circle cx="1000" cy="330" r="300" fill="#fff" fill-opacity=".35"/><path d="M940 130h120l25 160 100 380h-370l100-380z" fill="#fff" fill-opacity=".55" stroke="#b76e79" stroke-opacity=".4" stroke-width="4"/></svg>`);
const img = (id, h, alt, extra = '') => `<img src="${PHOTOS[id] || 'images/' + id + '.jpg'}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src=art(${h})" ${extra}>`;
function addChatMessage(text, type) {
  const message = document.createElement('p');
  message.className = `chat-bubble ${type}-message`;
  message.textContent = text;
  $('#chatMessages').append(message);
  $('#chatMessages').scrollTop = $('#chatMessages').scrollHeight;
}
function chatReply(question) {
  const q = question.toLowerCase();
  if (/deliver|shipping|ship|courier/.test(q)) return 'Delivery time and charges depend on your location. Please confirm the current details with the store before ordering.';
  if (/cod|cash|payment|pay|jazzcash|easypaisa|visa|card/.test(q)) return 'Payment options shown are examples for this demo. Please ask the store which payment methods are currently available.';
  if (/size|fit|measurement|measure/.test(q)) return 'Open a product and use “View size guide” where available. These measurements are approximate; please confirm fit and garment measurements with the store.';
  if (/return|refund|exchange|replace/.test(q)) return 'Return and exchange terms can vary by item. Please confirm the current policy with the store before placing an order.';
  if (/price|stock|available|availability|order|product|item/.test(q)) return 'Product prices and availability on this demo page are examples. Please message the store to confirm the item, size, price and stock.';
  if (/hello|salam|assalam|hi\b|help/.test(q)) return 'Wa-alaikum-assalam! Ask me about delivery, payment, sizes or returns. Use the Email support link to reach the store.';
  return 'I can help with general delivery, payment, sizes and return questions. For a specific order or product, use the Email support link.';
}

/* ---------- Demo data ---------- */
const C = { pink: '#e8a0b4', cream: '#f3e3c3', char: '#2f2f33', sage: '#a9c0a6', navy: '#2b3a67', plum: '#7a3b5e', gold: '#c69548', blue: '#83a8bc', brown: '#8c6047', red: '#b74748' };
const P = [
  { id: 1, n: 'Elegant Floral Lawn Suit', cat: 'lawn', p: 3499, o: 4399, pop: 98, h: 340, col: ['pink', 'cream', 'sage'], sz: ['S', 'M', 'L'], nw: 1 },
  { id: 2, n: 'Luxury Embroidered Suit', cat: 'embroidered', p: 5999, o: 7499, pop: 92, h: 15, col: ['plum', 'cream'], sz: ['S', 'M', 'L', 'XL'], nw: 1 },
  { id: 3, n: 'Premium Winter Khaddar Suit', cat: 'winter', p: 4499, o: 5999, pop: 88, h: 350, col: ['navy', 'plum', 'char'], sz: ['M', 'L', 'XL'] },
  { id: 4, n: 'Festive Party Wear Dress', cat: 'party', p: 7999, o: 9999, pop: 85, h: 330, col: ['pink', 'char'], sz: ['S', 'M', 'L'], nw: 1 },
  { id: 5, n: 'Pastel Digital Print Unstitched 3-Piece', cat: 'unstitched', p: 2999, o: 3799, pop: 80, h: 160, col: ['sage', 'cream'], sz: [] },
  { id: 6, n: 'Chikankari Stitched Kurta Set', cat: 'stitched', p: 4799, o: 0, pop: 76, h: 40, col: ['cream', 'pink'], sz: ['S', 'M', 'L'] },
  { id: 7, n: 'Rose Gold Chiffon Formal', cat: 'party', p: 8999, o: 11999, pop: 74, h: 10, col: ['pink', 'plum'], sz: ['S', 'M', 'L'] },
  { id: 8, n: 'Cotton Printed Lawn 3-Piece', cat: 'lawn', p: 2799, o: 3499, pop: 70, h: 200, col: ['navy', 'cream'], sz: ['S', 'M', 'L', 'XL'] },
  { id: 9, n: 'Wool Shawl Winter Suit', cat: 'winter', p: 6299, o: 7999, pop: 66, h: 280, col: ['char', 'plum'], sz: ['M', 'L'], nw: 1 },
  { id: 10, n: 'Organza Embroidered Shirt', cat: 'embroidered', p: 6499, o: 0, pop: 62, h: 320, col: ['cream', 'sage'], sz: ['S', 'M', 'L'] },
  { id: 11, n: 'Ready-to-Wear Co-ord Set', cat: 'stitched', p: 3999, o: 4999, pop: 58, h: 180, col: ['sage', 'char'], sz: ['S', 'M', 'L'] },
  { id: 12, n: 'Jacquard Unstitched Set', cat: 'unstitched', p: 5299, o: 0, pop: 54, h: 25, col: ['plum', 'navy'], sz: [] },
  { id: 13, n: 'Printed Occasion Heels', cat: 'shoes', p: 5499, o: 6499, pop: 79, h: 205, col: ['blue', 'pink'], sz: ['36', '37', '38', '39', '40'], nw: 1, description: 'A statement heel for festive outfits and special plans.' },
  { id: 14, n: 'Navy Evening Heels', cat: 'shoes', p: 4999, o: 5999, pop: 65, h: 215, col: ['navy', 'char'], sz: ['36', '37', '38', '39', '40'], description: 'A timeless navy pair with a clean, occasion-ready shape.' },
  { id: 15, n: 'Everyday Beauty Essentials Kit', cat: 'beauty', p: 2299, o: 2799, pop: 75, h: 28, col: ['pink', 'cream'], sz: [], nw: 1, description: 'A feel-good edit of everyday makeup essentials.' },
  { id: 16, n: 'Soft Glam Face Palette', cat: 'beauty', p: 1899, o: 0, pop: 61, h: 35, col: ['cream', 'brown'], sz: [], description: 'A makeup palette for soft daytime looks and evening glam.' },
  { id: 17, n: 'Rose Garden Eau de Parfum', cat: 'beauty', p: 3299, o: 3999, pop: 59, h: 345, col: ['pink', 'red'], sz: [], description: 'A sample perfume listing for the beauty edit.' },
  { id: 18, n: 'Everyday Structured Shoulder Bag', cat: 'accessories', p: 4499, o: 0, pop: 57, h: 4, col: ['red', 'char'], sz: [], description: 'A polished carry-everywhere bag to finish your look.' },
  { id: 19, n: 'Everyday Printed Layers', cat: 'accessories', p: 1499, o: 0, pop: 51, h: 30, col: ['sage', 'pink'], sz: [], description: 'A versatile printed layer to add an easy finishing touch.' },
  { id: 20, n: 'Modern Longline Modest Dress', cat: 'abayas', p: 4999, o: 5999, pop: 68, h: 210, col: ['plum'], sz: ['S', 'M', 'L', 'XL'], nw: 1, description: 'An easy modest silhouette in a deep berry tone.' },
  { id: 21, n: 'Floral Suit + Printed Heels Pair', cat: 'bundles', p: 7499, o: 8998, pop: 96, h: 340, col: ['pink', 'blue'], sz: ['S', 'M', 'L'], nw: 1, bundleItems: [1, 13], description: 'A complete outfit preview: the Elegant Floral Lawn Suit plus Printed Occasion Heels, together for a sample price of Rs. 7,499.' },
  { id: 22, n: 'Classic Cat-Eye Glasses (Sample)', cat: 'glasses', p: 1799, o: 0, pop: 48, h: 18, col: ['char', 'brown'], sz: [], nw: 1, description: 'Illustrated eyewear preview. Confirm frame dimensions, lens type and availability with the store.' },
  { id: 23, n: 'Round Frame Glasses (Sample)', cat: 'glasses', p: 2199, o: 0, pop: 47, h: 28, col: ['brown', 'gold'], sz: [], nw: 1, description: 'Illustrated eyewear preview. Confirm frame dimensions, lens type and availability with the store.' },
  { id: 24, n: 'Everyday Square Glasses (Sample)', cat: 'glasses', p: 2499, o: 0, pop: 46, h: 210, col: ['navy', 'char'], sz: [], nw: 1, description: 'Illustrated eyewear preview. Confirm frame dimensions, lens type and availability with the store.' },
  { id: 25, n: 'Embroidered Evening Shawl (Sample)', cat: 'shawls', p: 3299, o: 0, pop: 45, h: 335, col: ['plum', 'gold'], sz: [], nw: 1, description: 'Original illustration for a shawl concept. Confirm fabric, dimensions, price and stock with the store.' },
  { id: 26, n: 'Soft Winter Wrap Shawl (Sample)', cat: 'shawls', p: 2799, o: 0, pop: 44, h: 210, col: ['navy', 'cream'], sz: [], nw: 1, description: 'Original illustration for a shawl concept. Confirm fabric, dimensions, price and stock with the store.' },
  { id: 27, n: 'Classic Printed Ladies’ Shawl (Sample)', cat: 'shawls', p: 2499, o: 0, pop: 43, h: 27, col: ['brown', 'sage'], sz: [], nw: 1, description: 'Original illustration for a shawl concept. Confirm fabric, dimensions, price and stock with the store.' },
  { id: 28, n: 'Classic Black Burqa (Sample)', cat: 'burqas', p: 7999, o: 0, pop: 42, h: 0, col: ['char'], sz: ['S', 'M', 'L', 'XL'], nw: 1, description: 'Original concept illustration for a modestwear sample. Confirm garment design, fabric, sizing and availability with the store.' },
  { id: 29, n: 'Front-Open Burqa (Sample)', cat: 'burqas', p: 8499, o: 0, pop: 41, h: 215, col: ['char', 'navy'], sz: ['S', 'M', 'L', 'XL'], nw: 1, description: 'Original concept illustration for a modestwear sample. Confirm garment design, fabric, sizing and availability with the store.' },
  { id: 30, n: 'Everyday Modest Burqa (Sample)', cat: 'burqas', p: 7499, o: 0, pop: 40, h: 280, col: ['char', 'plum'], sz: ['S', 'M', 'L', 'XL'], nw: 1, description: 'Original concept illustration for a modestwear sample. Confirm garment design, fabric, sizing and availability with the store.' }
];
const COLLS = [
  ['new', 'New Arrivals', 'Fresh designs, just landed.', 340], ['unstitched', 'Unstitched 3-Piece Suits', 'Fabric to stitch your way.', 160],
  ['stitched', "Stitched Women's Suits", 'Ready to wear today.', 40], ['embroidered', 'Luxury Embroidered Dresses', 'Hand-finished detail.', 15],
  ['winter', 'Winter Collection', 'Khaddar, wool and shawls.', 280], ['party', 'Festive & Party Wear', 'For weddings and celebrations.', 330],
  ['shoes', 'Shoes & Occasion Heels', 'The finishing touch to every look.', 205], ['beauty', 'Beauty & Makeup', 'Your everyday beauty edit.', 28],
  ['abayas', 'Abayas & Modest Wear', 'Elegant layers, thoughtfully chosen.', 210], ['burqas', 'Burqas & Modestwear', 'Modest style concepts to explore.', 210],
  ['glasses', 'Ladies’ Glasses', 'Everyday frames and statement shapes.', 18], ['shawls', 'Ladies’ Shawls', 'Soft layers and seasonal wraps.', 335],
  ['accessories', 'Bags & Accessories', 'Little details, big difference.', 4]
];
const MEGA_MENUS = {
  home: { eyebrow: 'WELCOME TO HAMID FABRICS', title: 'Find a look for every moment', cards: [['New-season styles', 'images/2.jpg', 'A fresh pastel outfit from the new season', 'new'], ['Occasion favourites', 'images/4.jpg', 'Rust embroidered outfit for an occasion', 'party'], ['The complete look', 'images/21.jpg', 'A suit and shoes styled as a pair', 'bundles']] },
  new: { eyebrow: 'JUST ARRIVED', title: 'Meet your new favourites', cards: [['Fresh lawn prints', 'images/1.jpg', 'Fresh floral lawn suit', 'lawn'], ['Elegant details', 'images/2.jpg', 'New embroidered suit', 'embroidered'], ['A special look', 'images/4.jpg', 'Rust embroidered occasion outfit', 'party']] },
  lawn: { eyebrow: 'EASY, EVERYDAY STYLE', title: 'Lawn & suits to love', cards: [['Printed lawn', 'images/1.jpg', 'Floral printed lawn suit', 'lawn'], ['Soft pastels', 'images/5.jpg', 'Pastel printed three-piece suit', 'unstitched'], ['Ready to wear', 'images/6.jpg', 'Chikankari stitched kurta set', 'stitched']] },
  shoes: { eyebrow: 'THE FINISHING TOUCH', title: 'Find your perfect pair', cards: [['Printed occasion heels', 'images/13.jpg', 'Printed heels for an occasion outfit', 'shoes'], ['Classic evening heels', 'images/14.jpg', 'Navy evening heels', 'shoes'], ['Shoes with a suit', 'images/21.jpg', 'A suit and printed heels together', 'bundles']] },
  beauty: { eyebrow: 'A LITTLE BEAUTY MOMENT', title: 'Beauty for your own kind of day', cards: [['Everyday essentials', 'images/15.jpg', 'Everyday beauty essentials', 'beauty'], ['Soft glam', 'images/16.jpg', 'Soft glam makeup palette', 'beauty'], ['Ladies’ glasses', 'images/cglasses.jpg', 'Illustrated ladies’ eyewear collection preview', 'glasses']] },
  abayas: { eyebrow: 'MODEST, MADE MODERN', title: 'Grace in every layer', cards: [['Longline elegance', 'images/20.jpg', 'Longline modest dress', 'abayas'], ['Burqa collection', 'images/cburqas.jpg', 'Illustrated burqa collection preview', 'burqas'], ['Soft shawls', 'images/cshawls.jpg', 'Illustrated ladies’ shawl collection preview', 'shawls']] },
  pair: { eyebrow: 'THE COMPLETE LOOK', title: 'A lovely outfit, all together', cards: [['Floral lawn suit', 'images/1.jpg', 'Floral lawn suit in the pair offer', 'lawn'], ['Printed occasion heels', 'images/13.jpg', 'Printed heels in the pair offer', 'shoes'], ['Shop the pair offer', 'images/21.jpg', 'Suit and shoes pair offer', 'bundles']] },
  sale: { eyebrow: 'A LITTLE SOMETHING EXTRA', title: 'Browse the special-price edit', cards: [['Lawn favourites', 'images/1.jpg', 'Floral lawn suit', 'sale'], ['Beauty picks', 'images/15.jpg', 'Everyday beauty essentials', 'sale'], ['Winter layers', 'images/9.jpg', 'Winter suit with warm layers', 'sale']] },
  contact: { eyebrow: 'HERE WHEN YOU NEED US', title: 'A little help with your order', cards: [['Delivery questions', 'images/12.jpg', 'Pakistani suit from the collection', 'help'], ['Size guidance', 'images/4.jpg', 'Embroidered outfit with full-length fit', 'size'], ['Open help chat', 'images/20.jpg', 'Modest longline outfit from the collection', 'chat']] }
};
function openMegaMenu(key) {
  const menu = MEGA_MENUS[key];
  if (!menu) return;
  $('#megaEyebrow').textContent = menu.eyebrow;
  $('#megaTitle').textContent = menu.title;
  $('#megaCards').innerHTML = menu.cards.map(([title, photo, alt, action]) => {
    const isCategory = !['help', 'size', 'chat'].includes(action);
    const href = isCategory ? '#shop' : action === 'chat' ? '#' : '#help';
    const attrs = isCategory ? `data-cat="${esc(action)}"` : action === 'chat' ? 'data-chat-open' : '';
    return `<a class="mega-card" href="${href}" data-mega-item ${attrs}>${img(photo.replace(/^images\/|\.jpg$/g, ''), 330, alt)}<span>${esc(title)}</span><svg class="svg" aria-hidden="true"><use href="#i-arrow-right"/></svg></a>`;
  }).join('');
  $('#megaMenu').hidden = false;
  $('#megaMenu').setAttribute('aria-hidden', 'false');
  $$('#nav [data-mega]').forEach(link => link.setAttribute('aria-expanded', link.dataset.mega === key));
}
function closeMegaMenu() {
  const panel = $('#megaMenu');
  if (!panel) return;
  panel.hidden = true;
  panel.setAttribute('aria-hidden', 'true');
  $$('#nav [data-mega]').forEach(link => link.setAttribute('aria-expanded', 'false'));
}
const SLIDES = [
  { h: 330, image: 'images/4.jpg', mobile: 'images/4.jpg', alt: 'Model wearing a full-length rust-red embroidered suit', kicker: 'THE OCCASION EDIT', script: 'A fresh note of colour', title: 'Elegance in Every Detail', copy: 'A warm, rich tone and delicate embroidery for a beautifully considered look.', c: 'party' },
  { h: 15, image: 'images/hero-blue-suit.jpg', mobile: 'images/hero-blue-mobile.jpg', alt: 'Model wearing a pale blue embroidered suit', kicker: 'THE NEW SEASON', script: 'A softer kind of statement', title: 'Soft Colour, Fresh Style', copy: 'Discover delicate detail and easy elegance in a fresh seasonal palette.', c: 'new' },
  { h: 280, image: 'images/hero-modest-black.jpg', mobile: 'images/hero-modest-mobile.jpg', alt: 'Model in a black modest outfit with a navy shawl', kicker: 'MODEST, MADE MODERN', script: 'Everyday elegance', title: 'Modern Layers, Timeless Grace', copy: 'Thoughtfully styled modest looks, made to feel beautifully your own.', c: 'abayas' }
];
const CATS = [
  ['all', 'All'], ['new', 'New In'], ['lawn', 'Lawn'], ['stitched', 'Stitched'], ['unstitched', 'Unstitched'],
  ['embroidered', 'Embroidered'], ['winter', 'Winter'], ['party', 'Party Wear'], ['shoes', 'Shoes'], ['beauty', 'Beauty'],
  ['abayas', 'Abayas'], ['burqas', 'Burqas'], ['glasses', 'Ladies’ Glasses'], ['shawls', 'Shawls'],
  ['accessories', 'Accessories'], ['bundles', 'Pair & Save'], ['sale', 'Sale']
];
const SAMPLE_REVIEWS = [
  { n: 'Ayesha (sample)', r: 5, t: 'Beautiful fabric and the colours match the photos.' },
  { n: 'Sana (sample)', r: 5, t: 'Lovely embroidery. Will order again.' },
  { n: 'Hira (sample)', r: 4, t: 'A lovely finishing touch for a special occasion.' }
];

/* ---------- State ---------- */
let cart = load('hf_cart', {}), wish = load('hf_wish', []), reviews = load('hf_rev', SAMPLE_REVIEWS);
let state = { cat: 'all', sort: 'pop', q: '', wishOnly: false, budget: 'all' };
let compareIds = [];
const byId = id => P.find(x => x.id === +id);
const off = p => p.o ? Math.round((p.o - p.p) / p.o * 100) : 0;
const productCard = p => `
  <article class="card"><div class="ph">
    ${off(p) ? `<span class="badge">${off(p)}% OFF</span>` : ''}
    <button class="icon wish" data-w="${p.id}" aria-pressed="${wish.includes(p.id)}" aria-label="Toggle wishlist for ${esc(p.n)}">${svgIcon('heart')}</button>
    ${img(p.id, p.h, p.n + ' front view')}${img('b' + p.id, (p.h + 30) % 360, p.n + ' alternate view')}</div>
  <div class="info"><h3>${esc(p.n)}</h3>
    <p class="pr"><b>${fmt(p.p)}</b>${p.o ? `<s>${fmt(p.o)}</s>` : ''}</p>
    <div class="sw">${p.col.map(c => `<i style="background:${C[c]}" title="${c}"></i>`).join('')}</div>
    <div class="sz">${(p.sz.length ? p.sz : [p.cat === 'unstitched' ? '3-piece' : 'One size']).map(s => `<span>${esc(s)}</span>`).join('')}</div>
    ${p.bundleItems ? '<p class="card-note">Includes suit + shoes</p>' : ''}
    <div class="act"><button class="btn" data-a="${p.id}">${svgIcon('bag')} Add to Cart</button>
    <button class="sq" data-q="${p.id}" aria-label="Quick view ${esc(p.n)}">${svgIcon('eye')}</button></div>
    <button class="compare-link" data-compare="${p.id}" aria-pressed="${compareIds.includes(p.id)}">${compareIds.includes(p.id) ? 'Added to compare' : '＋ Compare'}</button></div></article>`;

/* ---------- UI helpers ---------- */
let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); };

/* ---------- Products ---------- */
function render() {
  const budgetMatch = {
    all: () => true,
    under3k: p => p.p < 3000,
    '3to5k': p => p.p >= 3000 && p.p <= 5000,
    over5k: p => p.p > 5000
  }[state.budget];
  let list = P.filter(p => {
    const c = state.cat;
    const okC = c === 'all' || p.cat === c || (c === 'new' && p.nw) || (c === 'sale' && p.o);
    const searchable = `${p.n} ${p.cat} ${p.cat === 'burqas' ? 'burka' : ''} ${p.description || ''}`.toLowerCase();
    return okC && searchable.includes(state.q) && (!state.wishOnly || wish.includes(p.id)) && budgetMatch(p);
  });
  list.sort((a, b) => state.sort === 'lo' ? a.p - b.p : state.sort === 'hi' ? b.p - a.p
    : state.sort === 'new' ? (b.id - a.id) : state.sort === 'discount' ? off(b) - off(a) : b.pop - a.pop);
  $('#count').textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
  $('#resultsText').textContent = `${list.length} ${list.length === 1 ? 'style' : 'styles'}${state.wishOnly ? ' in your wishlist' : ''}`;
  $('#grid').innerHTML = list.length ? list.map(productCard).join('')
    : '<div class="empty-state"><p>No styles match those filters.</p><span>Try clearing a filter or browsing all pieces.</span><button class="btn" data-clear-filters>Clear filters</button></div>';
  updateCompareControls();
}
function renderPicks() {
  const featured = [21, 13, 1, 15, 20, 18, 3, 17, 22, 25, 28].map(byId);
  $('#picksTrack').innerHTML = featured.map(productCard).join('');
}
function clearFilters() {
  state = { cat: 'all', sort: 'pop', q: '', wishOnly: false, budget: 'all' };
  $('#q').value = '';
  $('#sort').value = 'pop';
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === 'all'));
  $$('[data-budget]').forEach(b => b.classList.toggle('on', b.dataset.budget === 'all'));
  $('#wishBtn').setAttribute('aria-pressed', 'false');
  render();
}
function recordViewed(id) {
  id = +id;
  const stored = load('hf_recent', []);
  const recent = [id, ...(Array.isArray(stored) ? stored : []).filter(x => x !== id)].slice(0, 8);
  save('hf_recent', recent);
  renderRecentlyViewed();
}
function renderRecentlyViewed() {
  const stored = load('hf_recent', []);
  const recent = (Array.isArray(stored) ? stored : []).map(byId).filter(Boolean);
  $('#recentSec').hidden = recent.length === 0;
  $('#recentTrack').innerHTML = recent.map(productCard).join('');
}
function updateCompareControls() {
  $('#compareCount').textContent = compareIds.length;
  $('#compareOpen').disabled = compareIds.length < 2;
  $$('[data-compare]').forEach(button => {
    const selected = compareIds.includes(+button.dataset.compare);
    button.setAttribute('aria-pressed', selected);
    button.textContent = selected ? 'Added to compare' : '＋ Compare';
  });
}
function toggleCompare(id) {
  id = +id;
  if (compareIds.includes(id)) compareIds = compareIds.filter(x => x !== id);
  else if (compareIds.length < 3) compareIds.push(id);
  else { toast('Compare up to three styles at a time'); return; }
  updateCompareControls();
}
function openCompare() {
  if (compareIds.length < 2) return;
  const products = compareIds.map(byId).filter(Boolean);
  const rows = [
    ['Price', p => fmt(p.p)],
    ['Category', p => CATS.find(([category]) => category === p.cat)?.[1] || p.cat],
    ['Sizes', p => p.sz.length ? p.sz.join(', ') : 'One size'],
    ['Available colours', p => p.col.join(', ')],
    ['Offer', p => p.o ? `${fmt(p.o)} list price` : 'No listed offer']
  ];
  $('#compareContent').innerHTML = `<div class="compare-table" style="--compare-cols:${products.length}"><div class="compare-label"></div>${products.map(p => `<div class="compare-product">${img(p.id, p.h, p.n)}<b>${esc(p.n)}</b><button class="text-action" data-remove-compare="${p.id}">Remove</button></div>`).join('')}${rows.map(([label, value]) => `<b class="compare-label">${label}</b>${products.map(p => `<span>${esc(value(p))}</span>`).join('')}`).join('')}</div>`;
  $('#compareDialog').showModal();
}
function showSizeGuide(p) {
  const shoes = p.cat === 'shoes';
  const headers = shoes ? ['EU size', 'Approx. foot length'] : ['Size', 'Bust', 'Waist', 'Hip'];
  const rows = shoes
    ? [['36', '22.5 cm'], ['37', '23.2 cm'], ['38', '24 cm'], ['39', '24.7 cm'], ['40', '25.5 cm']]
    : [['S', '34–35 in', '27–28 in', '37–38 in'], ['M', '36–37 in', '29–30 in', '39–40 in'], ['L', '38–40 in', '31–33 in', '41–43 in'], ['XL', '41–43 in', '34–36 in', '44–46 in']];
  $('#sizeTitle').textContent = shoes ? 'Shoe size guide' : 'Clothing size guide';
  $('#sizeGuideContent').innerHTML = `<div class="size-table" style="--size-cols:${headers.length}">${headers.map(h => `<b>${h}</b>`).join('')}${rows.map(row => row.map(cell => `<span>${cell}</span>`).join('')).join('')}</div>`;
  $('#sizeGuide').showModal();
}
function setCat(c, scroll) {
  state.cat = c;
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === c));
  render();
  if (scroll) $('#shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Cart & wishlist ---------- */
function renderCart() {
  const ids = Object.keys(cart); let sub = 0, n = 0;
  const itemMarkup = ids.length ? ids.map(id => {
    const p = byId(id), q = cart[id]; sub += p.p * q; n += q;
    return `<div class="ci">${img(p.id, p.h, p.n)}<div><h4>${esc(p.n)}</h4>${p.bundleItems ? '<small>Includes Floral Lawn Suit + Printed Occasion Heels</small>' : ''}<small>${fmt(p.p)}</small>
      <div class="q"><button data-d="${id}" aria-label="Decrease quantity">${svgIcon('minus')}</button><span>${q}</span><button data-i="${id}" aria-label="Increase quantity">${svgIcon('plus')}</button></div></div>
      <button class="rm" data-r="${id}">Remove</button></div>`;
  }).join('') : '<p class="empty">Your cart is empty. Add something you like.</p>';
  const cartProducts = ids.map(byId).filter(Boolean);
  const preferred = cartProducts.some(p => p.cat === 'glasses')
    ? [1, 15, 18]
    : cartProducts.some(p => ['burqas', 'shawls', 'abayas'].includes(p.cat))
      ? [25, 22, 1]
      : cartProducts.some(p => ['lawn', 'stitched', 'unstitched', 'embroidered', 'winter', 'party'].includes(p.cat))
        ? [13, 25, 18]
        : cartProducts.some(p => p.cat === 'shoes') ? [1, 18, 25] : [18, 19, 1];
  const suggestions = preferred.map(byId).filter(p => p && !cart[p.id]).slice(0, 2);
  $('#items').innerHTML = itemMarkup + (suggestions.length ? `<div class="cart-suggest"><b>Complete your look</b><div>${suggestions.map(p => `<article>${img(p.id, p.h, p.n)}<span>${esc(p.n)}<small>${fmt(p.p)}</small></span><button class="icon" data-a="${p.id}" aria-label="Add ${esc(p.n)} to cart">${svgIcon('plus')}</button></article>`).join('')}</div></div>` : '');
  $('#sub').textContent = $('#tot').textContent = fmt(sub);
  $('#cartN').textContent = n; $('#wishN').textContent = wish.length;
  save('hf_cart', cart); save('hf_wish', wish);
}
function add(id) { cart[id] = (cart[id] || 0) + 1; recordViewed(id); renderCart(); toast('Added to cart'); }
function toggleWish(id) { id = +id; wish = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id]; renderCart(); render(); }
function drawer(open) { $('#drawer').classList.toggle('on', open); $('#scrim').classList.toggle('on', open); $('#drawer').setAttribute('aria-hidden', !open); }
function setNav(open, restoreFocus = true) {
  const nav = $('#nav'), mobile = matchMedia('(max-width: 1120px)').matches;
  nav.classList.toggle('on', open && mobile);
  $('#navScrim').classList.toggle('on', open && mobile);
  $('#burger').setAttribute('aria-expanded', open && mobile);
  $('#burger').setAttribute('aria-label', open && mobile ? 'Close menu' : 'Open menu');
  nav.setAttribute('aria-hidden', mobile && !open);
  document.body.classList.toggle('nav-open', open && mobile);
  if (open && mobile) $('a', nav).focus();
  else if (restoreFocus && mobile) $('#burger').focus();
}

function relatedProducts(p) {
  const picks = p.cat === 'shoes' ? [1, 18, 21]
    : p.cat === 'beauty' ? [18, 19, 1]
      : p.cat === 'abayas' ? [14, 18, 19]
        : p.cat === 'burqas' ? [25, 22, 20]
          : p.cat === 'shawls' ? [20, 28, 1]
            : p.cat === 'glasses' ? [1, 25, 18]
        : p.cat === 'bundles' ? [16, 17, 18] : [13, 18, 19];
  return picks.map(byId).filter(item => item && item.id !== p.id).slice(0, 2);
}
function quickView(id) {
  const p = byId(id), d = $('#qv');
  if (!p) return;
  recordViewed(p.id);
  const related = relatedProducts(p);
  d.innerHTML = `<div class="qvb"><button class="icon x" aria-label="Close" data-x>${svgIcon('close')}</button>${img(p.id, p.h, p.n)}
  <div><h2>${esc(p.n)}</h2><p class="pr"><b>${fmt(p.p)}</b>${p.o ? `<s>${fmt(p.o)}</s> (${off(p)}% off)` : ''}</p>
  <p>${esc(p.description || 'A Hamid Fabrics pick, thoughtfully chosen for your wardrobe.')}</p>
  ${p.bundleItems ? `<div class="bundle-includes"><b>Pair offer includes:</b>${p.bundleItems.map(id => `<span>${esc(byId(id).n)}</span>`).join('')}</div>` : ''}
  <div class="opt">${p.col.map(c => `<span>${c}</span>`).join('')}</div>
  <div class="opt">${(p.sz.length ? p.sz : [p.cat === 'unstitched' ? 'Unstitched 3-piece' : 'One size']).map(s => `<span>${esc(s)}</span>`).join('')}</div>
  ${p.sz.length && ['shoes', 'abayas', 'burqas', 'lawn', 'stitched', 'embroidered', 'winter', 'party'].includes(p.cat) ? `<button class="size-guide-link" data-size-guide="${p.id}" type="button">View size guide</button>` : ''}
  ${related.length ? `<section class="qv-related"><b>Style it with</b>${related.map(item => `<button type="button" data-q="${item.id}">${img(item.id, item.h, item.n)}<span>${esc(item.n)}<small>${fmt(item.p)}</small></span></button>`).join('')}</section>` : ''}
  <button class="btn" data-a="${p.id}" data-x>Add to Cart</button></div></div>`;
  d.showModal();
}

/* ---------- Hero slider ---------- */
let cur = 0, timer, paused = false, hovered = false, swipeStart = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateCarouselTimer() {
  clearInterval(timer);
  if (!paused && !hovered && !reducedMotion && !document.hidden) timer = setInterval(() => go(cur + 1), 6000);
  const control = $('#slideToggle');
  control.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
  control.innerHTML = svgIcon(paused ? 'play' : 'pause');
}
function buildHero() {
  $('#slides').innerHTML = SLIDES.map((s, i) => `<div class="slide${i === 0 ? ' on' : ''}" role="group" aria-roledescription="slide" aria-label="Slide ${i + 1} of ${SLIDES.length}" aria-hidden="${i !== 0}">
    <picture class="bg"><source media="(max-width: 600px)" srcset="${s.mobile}"><img src="${PHOTOS['h' + i] || s.image}" alt="${esc(s.alt)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} onerror="this.onerror=null;this.src='${wide(s.h)}'"></picture>
    <div class="txt"><span class="hero-kicker">${esc(s.kicker)}</span><span class="script">${esc(s.script)}</span><h1>${esc(s.title)}</h1><p class="cats">${esc(s.copy)}</p>
    <div class="hero-actions"><a class="btn" href="#shop" data-cat="${s.c}">Explore the edit ${svgIcon('arrow-right')}</a><a class="btn ghost" href="#shop" data-cat="all">Shop all styles</a></div></div></div>`).join('');
  $('#dots').innerHTML = SLIDES.map((_, i) => `<button aria-label="Go to slide ${i + 1}" aria-current="${i === 0}" data-s="${i}"><span></span></button>`).join('');
  go(0);
}
function go(i) {
  cur = (i + SLIDES.length) % SLIDES.length;
  $$('.slide').forEach((s, k) => { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k !== cur); s.inert = k !== cur; });
  $$('#dots button').forEach((b, k) => { b.classList.toggle('on', k === cur); b.setAttribute('aria-current', k === cur); });
  updateCarouselTimer();
}

/* ---------- Newsletter ---------- */
function initForms() {
  $$('.nl').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const em = $('input', f).value.trim(), m = $('small', f), ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em);
    m.className = ok ? 'ok' : 'bad';
    if (!ok) {
      m.textContent = 'Enter a valid email address, like name@example.com.';
      return;
    }
    m.textContent = 'Your email app should open. Send the draft to request updates; this site does not store sign-ups.';
    window.location.href = `mailto:${CFG.email}?subject=${encodeURIComponent('Newsletter updates request')}&body=${encodeURIComponent(`Please send store updates to: ${em}`)}`;
  }));
  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    const items = Object.entries(cart).map(([id, quantity]) => ({ product: byId(id), quantity })).filter(item => item.product);
    if (!items.length) {
      $('#orderFeedback').textContent = 'Your cart is empty. Add a product before preparing an enquiry.';
      $('#orderDialog').close();
      toast('Your cart is empty');
      return;
    }
    const formData = new FormData(e.currentTarget);
    const subtotal = items.reduce((sum, item) => sum + item.product.p * item.quantity, 0);
    const orderLines = items.map(({ product, quantity }) => `${quantity} × ${product.n} — ${fmt(product.p)} each`).join('\n');
    const body = [
      'Hello Hamid Fabrics,',
      '',
      'I would like to enquire about the following items. Please confirm current stock, prices, COD availability, delivery charges/timing, and the applicable return/exchange terms before accepting an order.',
      '',
      orderLines,
      `Product subtotal shown on the preview: ${fmt(subtotal)}`,
      '',
      `Name: ${formData.get('name')}`,
      `Phone: ${formData.get('phone')}`,
      `City: ${formData.get('city')}`,
      `Delivery address: ${formData.get('address')}`,
      '',
      'I understand this is an enquiry only and is not an accepted order.'
    ].join('\n');
    $('#orderFeedback').textContent = 'Opening your email app. Review the draft and send it to deliver your enquiry; this website does not receive or store it.';
    window.location.href = `mailto:${CFG.email}?subject=${encodeURIComponent('Order enquiry - Hamid Fabrics')}&body=${encodeURIComponent(body)}`;
  });
  $('#revForm').addEventListener('submit', e => {
    e.preventDefault();
    reviews.unshift({ n: $('#rn').value.trim(), r: +$('#rs').value, t: $('#rt').value.trim() });
    reviews = reviews.slice(0, 9); save('hf_rev', reviews); renderRevs(); e.target.reset(); toast('Review posted (saved in this browser only)');
  });
}
const renderRevs = () => $('#revs').innerHTML = reviews.map(r => `<blockquote class="rev"><div class="st" role="img" aria-label="${r.r} out of 5 stars">${Array.from({ length: 5 }, (_, i) => `<svg class="svg${i < r.r ? ' filled' : ''}" aria-hidden="true"><use href="#i-star"/></svg>`).join('')}</div><p>${esc(r.t)}</p><small>${esc(r.n)}</small></blockquote>`).join('');

/* ---------- Init & events ---------- */
function init() {
  initPwaInstall();
  setNav(false, false);
  $('#tabs').innerHTML = CATS.map(([c, label], i) => `<button${i === 0 ? ' class="on"' : ''} data-tab="${c}">${label}</button>`).join('');
  $('#cols').innerHTML = [...COLLS, ['bundles', 'The Perfect Pair', 'A suit and heels, together for less.', 340]].map(([c, t, d, h]) => `<article class="col">${img('c' + c, h, t)}<div><h3>${t}</h3><p>${d}</p><a class="btn" href="#shop" data-cat="${c}">Shop Collection</a></div></article>`).join('');
  renderPicks();
  renderRecentlyViewed();
  $('#gal').innerHTML = [340, 15, 200, 280, 40, 160].map((h, i) => img('g' + i, h, `Customer styling photo ${i + 1}`)).join('');
  const pi = $('#promoImg'); pi.onerror = () => { pi.onerror = null; pi.src = art(350); }; pi.src = PHOTOS.promo || 'images/promo.jpg';
  const supportMail = `mailto:${CFG.email}?subject=${encodeURIComponent('Hamid Fabrics enquiry')}`;
  $('#emailSupport').href = supportMail;
  $('#footerEmail').href = supportMail;
  $('#chatEmail').href = supportMail;
  $('#orderEmailAddress').href = `mailto:${CFG.email}`;
  $('#orderEmailAddress').textContent = CFG.email;
  buildHero(); render(); renderCart(); renderRevs(); initForms();

  const header = $('.hdr');
  let megaCloseTimer;
  $$('#nav [data-mega]').forEach(link => {
    link.addEventListener('pointerenter', () => {
      clearTimeout(megaCloseTimer);
      if (matchMedia('(min-width: 1121px)').matches) openMegaMenu(link.dataset.mega);
    });
    link.addEventListener('focus', () => {
      if (matchMedia('(min-width: 1121px)').matches) openMegaMenu(link.dataset.mega);
    });
  });
  header.addEventListener('pointerenter', () => clearTimeout(megaCloseTimer));
  header.addEventListener('pointerleave', () => {
    megaCloseTimer = setTimeout(closeMegaMenu, 160);
  });
  header.addEventListener('focusout', () => setTimeout(() => {
    if (!header.contains(document.activeElement)) closeMegaMenu();
  }, 0));
  $('#megaClose').onclick = closeMegaMenu;

  document.addEventListener('click', e => {
    const t = e.target, g = a => t.closest(`[${a}]`);
    let el;
    if (!t.closest('.hdr')) closeMegaMenu();
    if (g('data-mega-close')) closeMegaMenu();
    else if ((el = g('data-mega-item'))) {
      closeMegaMenu();
      if (el.hasAttribute('data-chat-open')) { e.preventDefault(); setChatOpen(true); }
      else if (el.dataset.cat) { e.preventDefault(); setCat(el.dataset.cat, true); }
    }
    else if ((el = g('data-mega')) && matchMedia('(min-width: 1121px)').matches) {
      e.preventDefault();
      openMegaMenu(el.dataset.mega);
    }
    else if ((el = g('data-clear-filters'))) { e.preventDefault(); clearFilters(); }
    else if ((el = g('data-cat'))) { e.preventDefault(); setCat(el.dataset.cat, true); setNav(false, false); }
    else if ((el = g('data-a'))) { add(el.dataset.a); if (el.hasAttribute('data-x')) $('#qv').close(); }
    else if ((el = g('data-w'))) toggleWish(el.dataset.w);
    else if ((el = g('data-q'))) { if ($('#qv').open) $('#qv').close(); quickView(el.dataset.q); }
    else if ((el = g('data-pick-scroll'))) $('#picksTrack').scrollBy({ left: +el.dataset.pickScroll * $('#picksTrack').clientWidth * .8, behavior: 'smooth' });
    else if ((el = g('data-track-scroll'))) $(`#${el.dataset.trackScroll}`).scrollBy({ left: +el.dataset.direction * $(`#${el.dataset.trackScroll}`).clientWidth * .8, behavior: 'smooth' });
    else if ((el = g('data-budget'))) { state.budget = el.dataset.budget; $$('[data-budget]').forEach(b => b.classList.toggle('on', b === el)); render(); }
    else if ((el = g('data-compare'))) toggleCompare(el.dataset.compare);
    else if ((el = g('data-remove-compare'))) { compareIds = compareIds.filter(id => id !== +el.dataset.removeCompare); updateCompareControls(); openCompare(); if (compareIds.length < 2) $('#compareDialog').close(); }
    else if ((el = g('data-size-guide'))) showSizeGuide(byId(el.dataset.sizeGuide));
    else if (g('data-close-size')) $('#sizeGuide').close();
    else if (g('data-close-compare')) $('#compareDialog').close();
    else if (g('data-close-order')) $('#orderDialog').close();
    else if ((el = g('a')) && $('#nav').contains(el)) setNav(false, false);
    else if ((el = g('data-i'))) { cart[el.dataset.i]++; renderCart(); }
    else if ((el = g('data-d'))) { if (--cart[el.dataset.d] < 1) delete cart[el.dataset.d]; renderCart(); }
    else if ((el = g('data-r'))) { delete cart[el.dataset.r]; renderCart(); }
    else if ((el = g('data-s'))) go(+el.dataset.s);
    else if ((el = g('data-tab'))) setCat(el.dataset.tab);
    else if (g('data-x')) $('#qv').close();
    else if (t === $('#qv')) $('#qv').close();
  });
  $('.prev').onclick = () => go(cur - 1); $('.next').onclick = () => go(cur + 1);
  $('#addPair').onclick = () => add(21);
  $('#slideToggle').onclick = () => { paused = !paused; updateCarouselTimer(); };
  document.addEventListener('visibilitychange', updateCarouselTimer);
  $('#hero').addEventListener('mouseenter', () => { hovered = true; clearInterval(timer); });
  $('#hero').addEventListener('mouseleave', () => { hovered = false; updateCarouselTimer(); });
  $('#hero').addEventListener('pointerdown', e => { swipeStart = e.clientX; });
  $('#hero').addEventListener('pointerup', e => {
    if (swipeStart === null) return;
    const distance = e.clientX - swipeStart;
    if (Math.abs(distance) > 55) go(cur + (distance < 0 ? 1 : -1));
    swipeStart = null;
  });
  $('#hero').addEventListener('pointercancel', () => { swipeStart = null; });
  $('#hero').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });
  $('#sort').onchange = e => { state.sort = e.target.value; render(); };
  $('#clearFilters').onclick = clearFilters;
  $('#compareOpen').onclick = openCompare;
  $('#wishBtn').onclick = () => { state.wishOnly = !state.wishOnly; $('#wishBtn').setAttribute('aria-pressed', state.wishOnly); toast(state.wishOnly ? 'Showing wishlist only' : 'Showing all products'); render(); $('#shop').scrollIntoView(); };
  $('#q').addEventListener('input', e => { state.q = e.target.value.trim().toLowerCase(); render(); });
  $('#searchForm').onsubmit = e => { e.preventDefault(); $('#shop').scrollIntoView(); };
  $('#cartBtn').onclick = () => drawer(true); $('#closeCart').onclick = $('#scrim').onclick = () => drawer(false);
  $('#checkout').onclick = () => {
    if (!Object.keys(cart).length) { toast('Your cart is empty'); return; }
    $('#orderFeedback').textContent = '';
    $('#orderDialog').showModal();
    $('input[name="name"]', $('#orderForm')).focus();
  };
  $('#burger').onclick = () => setNav(!$('#nav').classList.contains('on'));
  $('#navClose').onclick = () => setNav(false);
  $('#navScrim').onclick = () => setNav(false);
  addEventListener('resize', () => { setNav(false, false); closeMegaMenu(); }, { passive: true });
  const chatPanel = $('#chatPanel'), chatToggle = $('#chatToggle');
  const setChatOpen = open => {
    chatPanel.hidden = !open;
    chatToggle.setAttribute('aria-expanded', open);
    chatToggle.setAttribute('aria-label', open ? 'Close store help chat' : 'Open store help chat');
    if (open) $('#chatInput').focus();
    else chatToggle.focus();
  };
  chatToggle.onclick = () => setChatOpen(chatPanel.hidden);
  $('#chatClose').onclick = () => setChatOpen(false);
  $('#shoppingChatCta').onclick = () => setChatOpen(true);
  chatPanel.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); setChatOpen(false); }
  });
  $('#chatForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#chatInput'), question = input.value.trim();
    if (!question) return;
    addChatMessage(question, 'user');
    addChatMessage(chatReply(question), 'bot');
    input.value = '';
    input.focus();
  });
  $$('#chatPanel [data-chat-question]').forEach(button => button.onclick = () => {
    const question = button.dataset.chatQuestion;
    addChatMessage(button.textContent, 'user');
    addChatMessage(chatReply(question), 'bot');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      drawer(false);
      setNav(false, $('#nav').classList.contains('on'));
      closeMegaMenu();
      if (!chatPanel.hidden) setChatOpen(false);
    }
    if (e.key === 'Tab' && $('#nav').classList.contains('on')) {
      const focusable = $$('a[href], button:not([disabled])', $('#nav'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  const top = $('#topBtn');
  addEventListener('scroll', () => top.classList.toggle('on', scrollY > 500), { passive: true });
  top.onclick = () => scrollTo({ top: 0 });
}
init();
