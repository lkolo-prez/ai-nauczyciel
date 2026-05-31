# Schemat: knowledge-graph.json

Graf wiedzy — mapa zależności umiejętności (DAG, skierowany graf acykliczny).

## node

| Pole | Typ | Opis |
|------|-----|------|
| `id` | string | Unikalny identyfikator, format `<subject>.<slug>` (np. `mat.procenty`) |
| `subject` | string | `id` przedmiotu z `subjects.json` |
| `name` | string | Nazwa wyświetlana |
| `tier` | number | Poziom w hierarchii (0 = fundament). Używany do układu mapy |
| `difficulty` | 1–5 | Trudność umiejętności |
| `examWeight` | 1–5 | Jak często pojawia się na egzaminie (waga) |
| `prereq` | string[] | Lista `id` węzłów wymaganych wcześniej (krawędzie A→B) |
| `summary` | string | Krótki opis zakresu |

## Zasady

- `prereq` muszą wskazywać istniejące `id`.
- Graf musi być **acykliczny** (walidator to sprawdza).
- `tier` węzła powinien być większy niż maksymalny `tier` jego prerekwizytów.
