# FightDaily

> Boxerský & MMA round timer — postavený jako PWA, funguje souběžně s tvojí muzikou.

🥊 **Live:** [fightdaily.pro](https://fightdaily.pro)

![FightDaily preview](https://fightdaily.pro/fightdaily-icon-512.png)

## Proč existuje

Většina round timerů na iOS přeruší muziku při alarmu. FightDaily používá **Web Audio API oscilátory** — alarmy jsou syntetizované přímo v prohlížeči, takže Spotify nebo Apple Music běží dál.

## Funkce

- ⏱ Round / Rest / Warmup timer s vizuálními fázemi
- 📢 4 typy alarmů: Air Horn, Buzzer, Zvon, 3× Zvon
- 🎵 Nepřerušuje muziku v pozadí (Web Audio API)
- 💡 Wake Lock — display nezhasne během tréninku
- 📊 Wall-clock přesné měření i v pozadí (background tab throttling fix)
- 💾 Persistentní nastavení (localStorage)
- 📱 PWA — instalace na home screen iPhonu

## Instalace na iPhone

1. Otevři [fightdaily.pro](https://fightdaily.pro) v **Safari** (nutně ne Chrome)
2. **Sdílet → Přidat na plochu**
3. Při prvním spuštění tapni 🔊 pro aktivaci audio
4. Spusť muziku v Spotify/Apple Music **před** otevřením timeru

## Tech stack

- Next.js 16 + React 19
- TypeScript / JSX
- Web Audio API (žádné mp3, vše syntetizované)
- Wake Lock API
- Geist font + Material Symbols Rounded
- Deploy: Vercel

## Local development

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

---

Made by [Miroslav](https://github.com/fightdailycz-gif) · Part of the FightDaily content brand.
