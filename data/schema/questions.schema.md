# Schemat: questions.json

Bank zadań. Kluczowa innowacja: `misconceptions` mapuje każdą złą odpowiedź na
**typ błędu**, dzięki czemu system buduje model poznawczy ucznia.

| Pole | Typ | Opis |
|------|-----|------|
| `id` | string | Unikalny identyfikator |
| `subject` | string | `id` przedmiotu |
| `nodeId` | string | `id` węzła grafu wiedzy, którego dotyczy zadanie |
| `type` | enum | `single` \| `truefalse` \| `multiple` \| `open` |
| `difficulty` | 1–5 | Trudność |
| `stem` | string | Treść zadania |
| `options` | string[] | Odpowiedzi (dla `single`/`truefalse`/`multiple`) |
| `answerIndex` | number | Indeks poprawnej odpowiedzi |
| `misconceptions` | string[] | Dla każdej opcji: typ błędu (`rachunek`/`polecenie`/`koncept`/`pamiec`/`jezyk`) lub `""` dla poprawnej |
| `explanation` | string | Wyjaśnienie rozwiązania i pułapek |

Typy błędów opisuje pole `errorTypes` na początku pliku.
