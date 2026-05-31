<div align="center">

# 🎓 AI Nauczyciel

### Otwarty, inteligentny system przygotowania do **egzaminu ósmoklasisty** — i nie tylko.

Nie kolejna baza testów. To **cyfrowy bliźniak ucznia**: nauczyciel + psycholog + trener nauki + AI + RPG, w jednej aplikacji mobilnej.

[![Deploy](https://github.com/lkolo-prez/ai-nauczyciel/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/lkolo-prez/ai-nauczyciel/actions/workflows/deploy-pages.yml)
[![CI](https://github.com/lkolo-prez/ai-nauczyciel/actions/workflows/ci.yml/badge.svg)](https://github.com/lkolo-prez/ai-nauczyciel/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/Kod-MIT-blue.svg)](LICENSE)
[![Wiedza: CC BY-SA 4.0](https://img.shields.io/badge/Baza%20wiedzy-CC%20BY--SA%204.0-green.svg)](data/README.md)

### 👉 [**Zobacz podgląd na żywo (GitHub Pages)**](https://lkolo-prez.github.io/ai-nauczyciel/)

*Otwórz na telefonie albo włącz widok mobilny w przeglądarce (DevTools → tryb urządzenia).*

</div>

---

## 💡 Dlaczego to jest inne

Rynek jest pełny arkuszy PDF, quizów i generatorów zadań. Praktycznie **nie istnieje**
system, który buduje **model poznawczy ucznia**, przewiduje jego wynik i wykrywa problemy
edukacyjne wcześniej niż nauczyciel. To właśnie robi ten projekt.

| Luka rynkowa | Co robi AI Nauczyciel |
|---|---|
| 🧬 **Cyfrowy bliźniak** | Buduje profil: opanowanie umiejętności, **typ błędów** (rachunek / czytanie polecenia / koncept / pamięć), tempo, ryzyko wypalenia |
| 🗺️ **Mapa podstawy programowej** | **Graf wiedzy** — wie, że „bez procentów nie ogarniesz geometrii" i wskazuje *korzenie* braków |
| ⚡ **Nauka jak TikTok** | Feed mikrolekcji 15–60 s zamiast 40-minutowych kursów |
| 📈 **Symulator wyniku** | „Ucz się 20 min/dzień → matematyka 48% → 72%" na podstawie Twojego realnego profilu |
| 🤖 **Nauczyciel AI 24/7** | Tłumaczy, znajduje luki, generuje zadania i analizuje błędy — offline, na otwartej bazie wiedzy |
| 🎮 **RPG edukacyjne** | Poziomy, XP, klasy postaci, osiągnięcia, ranking szkoły i miasta |
| 🔥 **Wykrywanie wypalenia** | Widzi spadek aktywności i skuteczności → zmienia plan nauki |

## 📚 Przedmioty (MVP — Etap 1)

Egzamin ósmoklasisty: **Język polski**, **Matematyka**, **Język angielski** — z autorskim
bankiem zadań w stylu CKE i grafem wiedzy całego zakresu.

## 🏗️ Architektura w skrócie

```
data/            ← OTWARTA BAZA WIEDZY (CC BY-SA): graf wiedzy, mikrolekcje, zadania, arkusze
 └─ schema/      ← schematy + dokumentacja
src/
 ├─ lib/
 │   ├─ cognitive.ts ← model poznawczy: mastery, typy błędów, prognoza, wypalenie, RPG
 │   ├─ store.ts     ← stan ucznia (Zustand + localStorage)
 │   └─ ai.ts        ← „mózg" nauczyciela AI (offline; gotowy na podpięcie LLM)
 ├─ components/  ← wykresy SVG (radar, linia, pierścień), widok grafu wiedzy
 └─ pages/       ← Dom, Feed, Ćwicz, Mapa, AI, Symulator, Profil
scripts/         ← walidacja bazy wiedzy (CI) + pipeline danych
.github/         ← deploy Pages, CI, build APK Androida
```

Pełny opis: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🚀 Szybki start

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # produkcyjny build do dist/
npm run validate:data  # sprawdza spójność otwartej bazy wiedzy
```

## 📱 Aplikacja mobilna (Android / iOS)

Aplikacja webowa jest pakowana do natywnych aplikacji przez **Capacitor**:

```bash
BUILD_TARGET=mobile npm run build
npx cap add android        # lub: npx cap add ios
npx cap sync
```

- **Android**: gotowy workflow [`mobile-build.yml`](.github/workflows/mobile-build.yml) buduje APK w CI (uruchom ręcznie albo otaguj `v*`).
- **iOS**: wymaga macOS + Xcode — instrukcja w [`docs/MOBILE.md`](docs/MOBILE.md).
- **PWA**: działa też jako aplikacja instalowalna z przeglądarki (manifest + ikony).

## 🗺️ Roadmapa

- **Etap 1 (MVP)** — egzamin ósmoklasisty: polski, matematyka, angielski ✅ *fundament*
- **Etap 2** — pełna szkoła podstawowa (klasy 4–8), cała podstawa programowa
- **Etap 3** — matura (podstawa + rozszerzenie), egzamin zawodowy
- **Etap 4** — *AI School OS*: uczeń, rodzic, nauczyciel, korepetytor, szkoła, dyrektor na jednej platformie

Szczegóły i statusy: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## 🤝 Współtworzenie

To projekt **open source** — najszybciej rozwiniesz go, dodając treść do otwartej bazy wiedzy
(zadania, mikrolekcje, węzły grafu). Zobacz [`CONTRIBUTING.md`](CONTRIBUTING.md) i
[`data/README.md`](data/README.md).

## 📄 Licencje

- **Kod**: [MIT](LICENSE)
- **Baza wiedzy** (`data/`): [CC BY-SA 4.0](data/README.md)

> ⚠️ Repozytorium **nie** re-publikuje chronionych arkuszy CKE/OKE — przechowuje metadane i
> linki do oficjalnych źródeł. Zadania w aplikacji są autorskie, „w stylu" egzaminu.

---

<div align="center">
Zbudujmy najmocniejszy, otwarty system edukacyjny w Polsce. 🇵🇱
</div>
