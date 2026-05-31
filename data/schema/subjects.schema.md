# Schemat: subjects.json i exams.json

## subject (subjects.json)

| Pole | Typ | Opis |
|------|-----|------|
| `id` | string | Identyfikator (np. `matematyka`) |
| `name` | string | Nazwa |
| `shortName` | string | Skrót (3 znaki) |
| `color` | string | Kolor HEX dla UI |
| `icon` | string | Emoji/znak |
| `exam` | boolean | Czy przedmiot egzaminu ósmoklasisty (napędza widok cyfrowego bliźniaka) |
| `area` | string | `id` obszaru z `areas` (np. `przyrodnicze`) |
| `grades` | string | Klasy nauczania, np. `IV–VIII` |
| `stage` | string | Etap (`egzamin-osmoklasisty` lub `podstawa-programowa`) |
| `examMinutes` | number? | Czas trwania egzaminu (tylko przedmioty egzaminacyjne) |
| `maxPoints` | number? | Maksymalna liczba punktów (tylko egzaminacyjne) |

Plik zawiera też listę `areas` (obszary przedmiotów): `id`, `name`, `color`.

## exam (exams.json)

| Pole | Typ | Opis |
|------|-----|------|
| `id` | string | Identyfikator arkusza |
| `year` | number | Rok |
| `session` | string | Sesja (główny / próbny / dodatkowy) |
| `subjects` | string[] | Lista przedmiotów |
| `source` | string | `id` źródła z `officialSources` |
| `sourceUrl` | string | Link do oficjalnego źródła |
| `ingested` | boolean | Czy metadane przetworzono |

Repozytorium **nie** przechowuje treści arkuszy — wyłącznie metadane i linki.
