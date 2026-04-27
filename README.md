# FightDaily

Boxing & MMA round timer — webová appka, PWA-ready.

## Features

- 🥊 Round / Rest / Warmup timer s vizuálními fázemi
- 📢 8 typů alarmu syntetizovaných přes Web Audio API (nepřeruší muziku na iOS)
- ⏱ Wall-clock přesné měření i v pozadí
- 💡 Wake Lock — display nezhasne během tréninku
- 💾 Persistent settings v localStorage
- 📱 PWA — přidej na home screen na iPhonu pro fullscreen zážitek

## Lokální vývoj

```bash
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel přes GitHub

### 1. Vytvoř GitHub repo

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TVOJE_USERNAME/fightdaily.git
git push -u origin main
```

### 2. Deploy na Vercel

1. Jdi na [vercel.com/new](https://vercel.com/new)
2. Import GitHub repository `fightdaily`
3. Framework Preset: **Next.js** (auto-detected)
4. Klikni **Deploy**

Hotovo, máš `fightdaily.vercel.app`.

### 3. Custom doména (volitelné)

V Vercel dashboardu → Settings → Domains → přidej `timer.dropdaily.cz` nebo
podobnou subdoménu, kterou ovládáš v DNS.

## Přidat ikony

Před deployem **musíš** přidat 3 PNG ikony do `/public/`:

- `apple-touch-icon.png` — 180×180 (iOS home screen)
- `icon-192.png` — 192×192 (Android, standard)
- `icon-512.png` — 512×512 (PWA install prompt)
- `icon-512-maskable.png` — 512×512 (Android adaptive icon, safe zone uvnitř kruhu o průměru ~80% canvasu)

Doporučeno: navrhni v Figmě 1024×1024, vyexportuj všechny varianty
nebo použij [realfavicongenerator.net](https://realfavicongenerator.net).

## Instalace na iPhone

1. Otevři appku v **Safari** (ne v Chrome — iOS PWA jen v Safari)
2. Sdílet → **Přidat na plochu**
3. Při prvním spuštění tapni 🔊 pro aktivaci audio
4. Spusť muziku v Spotify/Apple Music **před** otevřením timeru
