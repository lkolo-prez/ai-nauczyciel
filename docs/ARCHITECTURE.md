# 🏗️ Architektura

AI Nauczyciel to **statyczna aplikacja front-end** (React + Vite + TypeScript), która
działa offline na **otwartej bazie wiedzy** i pakuje się do natywnych aplikacji
mobilnych (Capacitor). Brak backendu = zero kosztów hostingu, pełna prywatność
(dane ucznia zostają w przeglądarce) i prosty deploy na GitHub Pages.

```
┌───────────────────────────────────────────────────────────────┐
│                        Aplikacja (PWA)                         │
│                                                                │
│  pages/  Dom · Feed · Ćwicz · Mapa · AI · Symulator · Profil   │
│            │                                                   │
│  lib/store.ts  ── stan ucznia (Zustand + localStorage)         │
│            │                                                   │
│  lib/cognitive.ts  ── MODEL POZNAWCZY (czysta logika)          │
│     • mastery per umiejętność (aktualizacja bayesowska)        │
│     • effectiveMastery — tłumiona przez prerekwizyty z grafu   │
│     • rootGaps — „korzenie" braków (co naprawić najpierw)      │
│     • projectScore — prognoza wyniku                           │
│     • burnoutRisk — wykrywanie wypalenia                       │
│     • levelInfo / streak — warstwa RPG                         │
│            │                                                   │
│  lib/ai.ts  ── „mózg" nauczyciela (offline, na bazie wiedzy)   │
└───────────────────────────────┬───────────────────────────────┘
                                 │ import
                  ┌──────────────▼───────────────┐
                  │   data/  OTWARTA BAZA WIEDZY  │
                  │  subjects · knowledge-graph   │
                  │  micro-lessons · questions    │
                  │  exams (metadane + linki)     │
                  └──────────────────────────────┘
```

## Kluczowe decyzje

### 1. Graf wiedzy jako serce systemu
`knowledge-graph.json` to skierowany graf acykliczny (DAG). Krawędź `A → B` znaczy
„B wymaga A". `effectiveMastery()` tłumi ocenę węzła, jeśli jego prerekwizyty są
słabe — dlatego system potrafi powiedzieć *„nie umiesz geometrii, bo kuleją procenty"*
i wskazać **korzeń** problemu (`rootGaps()`), zamiast leczyć objaw.

### 2. Model poznawczy zamiast samego wyniku %
Każda zła odpowiedź ma przypisany **typ błędu** (`misconceptions` w zadaniu):
`rachunek` / `polecenie` / `koncept` / `pamiec` / `jezyk`. Z tego powstaje profil
„*na czym naprawdę tracisz punkty*", który napędza spersonalizowane wskazówki.

### 3. Czysta logika, łatwa do testów i rozbudowy
`cognitive.ts` to funkcje czyste operujące na `LearnerState`. Dzięki temu prognozy,
wykrywanie wypalenia i symulator są deterministyczne i łatwe do rozwijania.

### 4. Seam pod prawdziwy LLM
`lib/ai.ts` ma jeden punkt wejścia (`generateReply`). Dziś odpowiada offline z bazy
wiedzy; jutro można tu podłączyć Claude API (analiza toku rozumowania, OCR zdjęcia
zeszytu, wypowiedź głosowa) bez przepisywania UI.

### 5. Brak backendu, dane lokalnie
Stan ucznia trzyma `localStorage` (Zustand `persist`). Prywatność z założenia,
zero serwerów. Synchronizacja kont/rankingi na żywo to opcjonalny Etap 4.

## Stack
- **React 18 + TypeScript + Vite** — szybki build, statyczny output.
- **Tailwind CSS** — mobile-first, spójny design system.
- **Zustand** — lekki stan z trwałością.
- **Własne komponenty SVG** (radar, wykres liniowy, pierścień, graf) — zero ciężkich bibliotek wykresów.
- **Capacitor** — pakowanie do Android/iOS.

## Build i deploy
- `vite.config.ts` przełącza `base`: `/ai-nauczyciel/` dla GitHub Pages, `./` dla mobile (`BUILD_TARGET=mobile`).
- Routing oparty o `HashRouter` — działa na GitHub Pages bez konfiguracji serwera.
- `404.html = index.html` jako dodatkowy fallback SPA.
