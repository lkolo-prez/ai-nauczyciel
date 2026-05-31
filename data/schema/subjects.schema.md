# Schemat: subjects.json i exams.json

## subject (subjects.json)

| Pole | Typ | Opis |
|------|-----|------|
| `id` | string | Identyfikator (np. `matematyka`) |
| `name` | string | Nazwa |
| `shortName` | string | Skrót (3 znaki) |
| `color` | string | Kolor HEX dla UI |
| `icon` | string | Emoji/znak |
| `examMinutes` | number | Czas trwania egzaminu |
| `maxPoints` | number | Maksymalna liczba punktów |
| `stage` | string | Etap (np. `egzamin-osmoklasisty`) |

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
