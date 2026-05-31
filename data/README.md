# 📚 Otwarta baza wiedzy — AI Nauczyciel

Ten katalog to **serce projektu**: open-source'owa, wersjonowana baza wiedzy do
egzaminu ósmoklasisty. Każdy plik jest czytelny dla człowieka i dla maszyny, więc
społeczność może go rozwijać przez Pull Requesty, a aplikacja czyta go bezpośrednio.

## Licencja treści

Zawartość bazy wiedzy (pliki w tym katalogu) jest objęta licencją
**CC-BY-SA 4.0** — możesz jej używać i ją rozwijać, zachowując atrybucję i tę samą
licencję. Kod aplikacji jest objęty licencją **MIT** (patrz `LICENSE` w katalogu głównym).

> ⚠️ **Ważne — prawa autorskie.** Oryginalne arkusze CKE/OKE są materiałami
> chronionymi i **nie są** kopiowane do tego repozytorium. Plik `exams.json`
> przechowuje wyłącznie metadane i **linki do oficjalnych źródeł**. Zadania w
> `questions.json` są autorskie i napisane „w stylu" egzaminu.

## Pliki

| Plik | Co zawiera |
|------|------------|
| `subjects.json` | Przedmioty egzaminacyjne, czas, punktacja |
| `knowledge-graph.json` | **Graf wiedzy** — węzły umiejętności i zależności (prerekwizyty) |
| `micro-lessons.json` | Mikrolekcje 15–60 s do feedu „jak TikTok" |
| `questions.json` | Bank zadań z typami błędów (zasila model poznawczy ucznia) |
| `exams.json` | Katalog oficjalnych arkuszy + linki do źródeł |
| `schema/` | Opis struktury każdego pliku |

## Jak dodać treść

1. Edytuj odpowiedni plik JSON (trzymaj się schematu z `schema/`).
2. Uruchom walidację: `npm run validate:data`.
3. Otwórz Pull Request. CI sprawdzi spójność danych.

## Pipeline danych

`scripts/ingest-exams.mjs` to szkielet pipeline'u, który (docelowo) pobiera listy
arkuszy z oficjalnych źródeł i aktualizuje metadane. Pobieranie treści chronionych
jest świadomie wyłączone — pipeline operuje na metadanych i linkach.
