/* main.js - loads data/portfolio.json and renders the portfolio.
   Includes theme toggle and lightbox.
*/
const DEFAULT_JSON = 'data/portfolio.json';
const grid = document.getElementById('grid');
const catsEl = document.getElementById('cats');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('theme-toggle');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');

let portfolio = [];
let categories = ['Alles'];
let activeCat = 'Alles';

// Mobile menu toggle
mobileMenuBtn && mobileMenuBtn.addEventListener('click', () => {
  if(mainNav.style.display === 'flex') mainNav.style.display = 'none';
  else mainNav.style.display = 'flex';
});

function fetchData(){
  return fetch(DEFAULT_JSON)
    .then(r => r.json())
    .catch(err => {
      console.warn('Kan data niet laden, gebruik default sample.', err);
      return [];
    });
}

function buildCategories(){
  catsEl.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === activeCat ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => {
      activeCat = cat;
      buildCategories();
      renderGrid();
    };
    catsEl.appendChild(btn);
  });
}

function renderGrid(){
  grid.innerHTML = '';
  let q = searchInput.value.trim().toLowerCase();
  let visible = portfolio.filter(item => {
    if(activeCat !== 'Alles' && item.category !== activeCat) return false;
    if(q && !(item.title.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q))) return false;
    return true;
  });

  visible.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    // media
    const media = document.createElement('div');
    media.className = 'card-media';
    if(item.type === 'image'){
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = item.title || '';
      img.src = item.src;
      img.addEventListener('click', () => openLightbox('image', item));
      media.appendChild(img);
    } else if(item.type === 'video'){
      const vid = document.createElement('video');
      vid.controls = true;
      vid.src = item.src;
      vid.preload = 'metadata';
      vid.addEventListener('click', () => openLightbox('video', item));
      media.appendChild(vid);
    }
    card.appendChild(media);

    // body
    const body = document.createElement('div');
    body.className = 'card-body';
    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = item.title || '';
    const p = document.createElement('p');
    p.className = 'card-desc';
    p.textContent = item.description || '';
    body.appendChild(h3);
    body.appendChild(p);
    card.appendChild(body);
    grid.appendChild(card);
  });

  if(visible.length === 0){
    grid.innerHTML = '<p style="color:var(--muted)">Geen items gevonden — probeer een andere categorie of zoekterm.</p>';
  }
}

// lightbox
const lb = document.getElementById('lightbox');
const lbContent = document.getElementById('lb-content');
const lbClose = document.getElementById('lb-close');
const lbCaption = document.getElementById('lb-caption');

function openLightbox(type, item){
  lbContent.innerHTML = '';
  lbCaption.textContent = item.title || '';
  if(type === 'image'){
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title || '';
    lbContent.appendChild(img);
  } else {
    const vid = document.createElement('video');
    vid.src = item.src;
    vid.controls = true;
    vid.autoplay = true;
    lbContent.appendChild(vid);
  }
  lb.classList.add('show');
  lb.setAttribute('aria-hidden', 'false');
}
lbClose.addEventListener('click', closeLightbox);
lb.addEventListener('click', (e) => { if(e.target === lb) closeLightbox();});
function closeLightbox(){ lb.classList.remove('show'); lb.setAttribute('aria-hidden', 'true'); lbContent.innerHTML = ''; }

// theme
function getPreferredTheme(){
  const stored = localStorage.getItem('theme');
  if(stored) return stored;
  if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}
themeToggle && themeToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

// search
searchInput && searchInput.addEventListener('input', () => renderGrid());

// initialise
(async function init(){
  const data = await fetchData();
  portfolio = data;
  const cats = new Set(portfolio.map(i => i.category));
  categories = ['Alles', ...[...cats].sort()];
  buildCategories();
  renderGrid();
  applyTheme(getPreferredTheme());
})();
