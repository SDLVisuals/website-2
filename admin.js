/* admin.js
   Client-side admin panel.
   - Files uploaded are kept in memory (and packaged in the export zip).
   - Projects are stored in localStorage under 'sdl_portfolio'.
   - Export ZIP contains /data/portfolio.json and any uploaded files.
*/

const defaultDataPath = 'data/portfolio.json';
const STORAGE_KEY = 'sdl_portfolio';
let uploads = []; // {name, file, dataUrl}
let projects = [];

// Elements
const fileInput = document.getElementById('file-input');
const uploadList = document.getElementById('upload-list');
const newCat = document.getElementById('new-cat');
const addCatBtn = document.getElementById('add-cat');
const catsList = document.getElementById('cats-list');
const projTitle = document.getElementById('proj-title');
const projDesc = document.getElementById('proj-desc');
const projCat = document.getElementById('proj-cat');
const projType = document.getElementById('proj-type');
const projSrc = document.getElementById('proj-src');
const addProj = document.getElementById('add-proj');
const currentList = document.getElementById('current-list');
const exportZip = document.getElementById('export-zip');
const importJsonBtn = document.getElementById('import-json');
const importFile = document.getElementById('import-file');
const resetData = document.getElementById('reset-data');

function readInitialData(){
  // try localStorage first
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{
      projects = JSON.parse(raw);
      return Promise.resolve();
    }catch(e){}
  }
  // else fetch default JSON
  return fetch(defaultDataPath).then(r => r.json()).then(data => {
    projects = data || [];
    saveLocal();
  }).catch(err => { console.warn('Kon default data niet laden', err); projects = []; saveLocal(); });
}

function saveLocal(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  renderCurrent();
  populateCats();
}

function renderCurrent(){
  currentList.innerHTML = '';
  if(!projects.length){ currentList.innerHTML = '<p>Geen projecten in lokale data.</p>'; return; }
  projects.forEach((p, idx) => {
    const el = document.createElement('div');
    el.style.padding = '8px 0';
    el.innerHTML = `<strong>${p.title}</strong> — <em>${p.category}</em>
      <div style="color:var(--muted)">${p.type} — ${p.src}</div>
      <div style="margin-top:6px"><button data-i="${idx}" class="btn ghost del">Verwijder</button></div>`;
    currentList.appendChild(el);
  });
  // attach delete handlers
  currentList.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.dataset.i);
      projects.splice(i,1);
      saveLocal();
    });
  });
}

function populateCats(){
  const unique = [...new Set(projects.map(p => p.category))].sort();
  // render list
  catsList.innerHTML = '';
  unique.forEach(c => {
    const chip = document.createElement('span');
    chip.className = 'upload-item';
    chip.textContent = c;
    catsList.appendChild(chip);
  });
  // populate select
  projCat.innerHTML = '';
  unique.forEach(c => {
    const op = document.createElement('option'); op.value = c; op.textContent = c;
    projCat.appendChild(op);
  });
  // allow creating new category via input too
}

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  files.forEach(f => {
    const reader = new FileReader();
    reader.onload = function(ev){
      uploads.push({name:f.name, file:f, dataUrl: ev.target.result});
      renderUploads();
    };
    reader.readAsDataURL(f);
  });
  fileInput.value = '';
});

function renderUploads(){
  uploadList.innerHTML = '';
  uploads.forEach((u, i) => {
    const d = document.createElement('div');
    d.className = 'upload-item';
    d.innerHTML = `${u.name} <button data-i="${i}" class="btn ghost">X</button>`;
    uploadList.appendChild(d);
  });
  uploadList.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.dataset.i);
      uploads.splice(i,1);
      renderUploads();
    });
  });
}

addCatBtn.addEventListener('click', () => {
  const v = newCat.value && newCat.value.trim();
  if(!v) return alert('Voer een categorie naam in');
  // add to projects as a dummy? just populate select
  const op = document.createElement('option'); op.value=v; op.textContent=v;
  projCat.appendChild(op);
  newCat.value = '';
  populateCats();
});

addProj.addEventListener('click', () => {
  const title = projTitle.value.trim();
  if(!title) return alert('Voer een titel in');
  const category = projCat.value || 'Overig';
  let src = projSrc.value.trim();
  const type = projType.value;
  // if type is file and uploads exist, allow choosing the most recent upload
  if(type === 'file'){
    if(uploads.length === 0) return alert('Upload eerst bestanden en kies het bestand in de lijst.');
    // take last uploaded for simplicity
    const last = uploads[uploads.length-1];
    src = 'uploads/' + last.name;
  }
  const obj = { id: Date.now(), title, description: projDesc.value.trim(), category, type: (type==='file' ? (lastIsVideo(lastName=uploads.length?uploads[uploads.length-1].name:'') ? 'video' : 'image') : type), src };
  projects.unshift(obj);
  saveLocal();
  // clear inputs
  projTitle.value=''; projDesc.value=''; projSrc.value='';
});

function lastIsVideo(name){
  if(!name) return false;
  return name.match(/\.(mp4|webm|mov|ogg)$/i);
}

exportZip.addEventListener('click', async () => {
  // create zip with data/portfolio.json and uploads files (their binary data from dataUrl)
  const zip = new JSZip();
  // portfolio json from projects
  zip.file('data/portfolio.json', JSON.stringify(projects, null, 2));
  // add uploads
  const up = zip.folder('uploads');
  uploads.forEach(u => {
    // dataUrl => binary
    const base64 = u.dataUrl.split(',')[1];
    up.file(u.name, base64, {base64:true});
  });
  const content = await zip.generateAsync({type:'blob'});
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url; a.download = 'sdlvisuals-export.zip';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// import
importJsonBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const raw = ev.target.result;
      // try json
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed)){
        projects = parsed;
        saveLocal();
        alert('JSON geïmporteerd naar lokale data.');
        return;
      }
    }catch(err){}
    // else try zip
    JSZip.loadAsync(f).then(z => {
      // try read data/portfolio.json
      if(z.file('data/portfolio.json')){
        z.file('data/portfolio.json').async('string').then(txt => {
          projects = JSON.parse(txt);
          // extract uploads into in-memory uploads array for convenience
          uploads = [];
          Object.keys(z.files).forEach(k => {
            if(k.startsWith('uploads/')){
              z.file(k).async('base64').then(b64 => {
                uploads.push({name:k.split('/').pop(), dataUrl: 'data:;base64,'+b64});
                renderUploads();
              });
            }
          });
          saveLocal();
          alert('ZIP geïmporteerd en lokale data bijgewerkt.');
        });
      } else {
        alert('Geen data/portfolio.json gevonden in ZIP.');
      }
    });
  };
  reader.readAsText(f);
});

// reset
resetData.addEventListener('click', () => {
  if(!confirm('Weet je het zeker? Dit verwijdert lokale portfolio data.')) return;
  localStorage.removeItem(STORAGE_KEY);
  projects = [];
  uploads = [];
  renderUploads();
  renderCurrent();
  populateCats();
  alert('Lokale data gereset. Je kan nu opnieuw importeren of starten met nieuwe items.');
});

// init
readInitialData().then(() => {
  renderCurrent();
  renderUploads();
  populateCats();
});
