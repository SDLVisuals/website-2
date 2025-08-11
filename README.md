# SDL_Visuals — Static site package

Dit pakket bevat een volledig statische website (HTML/CSS/JS) die je onmiddellijk kunt hosten via **GitHub Pages**, of een andere statische host (Netlify, Vercel, ...).

## Wat zit erin
- `index.html` — publieke site (portfolio, about, contact)
- `css/style.css` — styling (light/dark via data-theme)
- `js/main.js` — frontend logica, laadt `data/portfolio.json`
- `admin.html` — admin paneel (client-side). Gebruik dit om projecten te maken en assets te uploaden.
- `js/admin.js` — admin logica (localStorage + export ZIP)
- `data/portfolio.json` — voorbeeld data (pas aan of importeer)
- `README.md` — deze uitleg

## Belangrijk — hoe werkt het admin paneel
Omdat je site statisch is (GitHub Pages) is er geen server-side schrijfrechten. Daarom werkt het admin paneel **client-side**:
1. Ga naar `admin.html` in je browser.
2. Upload afbeeldingen/video's via het uploadveld (je ziet ze in het <em>uploads</em> overzicht).
3. Voeg projecten toe (je kunt kiezen tussen type `image`, `video` of `file`).
   - Bij `file` wordt verondersteld dat je het laatst geüploade bestand gebruikt; de export pakt alle uploads in de ZIP.
4. Klik op **Exporteer ZIP**. Je ontvangt een ZIP-bestand met:
   - `data/portfolio.json` (de bijgewerkte JSON)
   - een map `uploads/` met de geüploade bestanden
5. Pak de ZIP uit en zet de bestanden in je repo:
   - Vervang `data/portfolio.json` in je repo door de geëxporteerde versie.
   - Plaats de bestanden uit `uploads/` in de root `uploads/` map van de repo (of `images/`/`videos/` zoals je wilt).
6. Push naar GitHub. GitHub Pages zal vervolgens de site updaten.

> Tip: zorg dat je in je projecten `src` paden gebruikt die overeenkomen met waar je de bestanden plaatst, bv. `uploads/myphoto.jpg` of `images/myvideo.mp4`.

## Live hosting (GitHub Pages)
1. Maak een nieuwe repo op GitHub (bijv. `sdlvisuals-website`) en upload de inhoud van deze folder.
2. Ga naar **Settings → Pages** en kies branch `main` of `gh-pages` en root folder.
3. Voeg eventueel een `CNAME` bestand met je domein `www.sdlvisuals.be` (en wees zeker dat je DNS A/CNAME-records correct staan).
4. Binnen enkele minuten is je site live.

## Opties als je liever direct kan updaten (zonder handmatig pushen)
- Koppel een licht backend (bijv. Firebase, Supabase of Strapi). Dan kan je admin paneel API-calls doen en live updates pushen.
- Of maak een GitHub Action die een `deploy` branch of content accepteert.

## Over design
Ik heb het design gemodelleerd op jouw huidige site `www.sdlvisuals.be`, maar strakker en beter mobiel-responsief. Pas `css/style.css` aan voor kleuren of fonts (gebruik bijv. Inter of jouw merk-font).

## Vervolgopties
Als je wil, kan ik:
- Een kant-en-klare GitHub repo voor je aanmaken en pushen (ik kan dat niet zelf uploaden, maar ik kan je een zip met deze bestanden geven — dat is wat deze download bevat).
- Een option met Firebase/Supabase opzetten zodat je admin direct live werkt (ik kan je stappen geven).

---

Veel succes — vervang gerust voorbeeld-afbeeldingen door je eigen werk. Als je wilt maak ik ook direct een versie waarin ik jouw exacte teksten en (publieke) Framer-afbeeldingen insluit.
