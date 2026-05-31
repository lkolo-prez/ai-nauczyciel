# 🤝 Współtworzenie AI Nauczyciel

Dzięki, że chcesz pomóc zbudować najmocniejszy otwarty system edukacyjny w Polsce!

## Najłatwiejszy wkład: treść (bez kodu)

Największą wartość dodasz, rozwijając **otwartą bazę wiedzy** w katalogu [`data/`](data/):

- ➕ **Zadania** → `data/questions.json` (pamiętaj o polu `misconceptions` — typ błędu dla każdej złej odpowiedzi!)
- ⚡ **Mikrolekcje** → `data/micro-lessons.json` (15–60 s, jeden „takeaway")
- 🗺️ **Węzły grafu wiedzy** → `data/knowledge-graph.json` (z poprawnymi `prereq`)

Każdy plik ma schemat w [`data/schema/`](data/schema/).

### Zanim wyślesz PR

```bash
npm run validate:data   # sprawdza spójność danych (uruchamia się też w CI)
npm run build           # type-check + build
```

## Wkład w kod

1. Sforknij repo i utwórz gałąź: `git checkout -b feature/nazwa`.
2. Trzymaj się stylu istniejącego kodu (TypeScript, mobile-first, komponenty SVG bez ciężkich zależności).
3. `npm run build` musi przechodzić bez błędów.
4. Otwórz Pull Request z krótkim opisem „co i dlaczego".

## Zasady dot. treści chronionych

- **Nie** dodawaj skanów ani treści arkuszy CKE/OKE — to materiały chronione prawem autorskim.
- Zadania pisz **autorsko**, „w stylu" egzaminu.
- Do `data/exams.json` dodawaj wyłącznie **metadane i linki** do oficjalnych źródeł.

## Dobre praktyki dydaktyczne

- Każde zadanie powinno mieć wartościowe `explanation` (czego uczy błąd).
- Mikrolekcja = jeden konkret + jedna pułapka + jeden „takeaway".
- Węzeł grafu powinien realnie odpowiadać umiejętności z podstawy programowej.

Masz pomysł na nową funkcję (analiza głosu, OCR zeszytu, tryb rodzica)? Otwórz Issue i pogadajmy. 🚀
