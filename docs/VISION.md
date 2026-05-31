# 🌐 EduOS — system operacyjny edukacji

> To nie jest „aplikacja do egzaminu". To **system operacyjny edukacji**, który
> zaczyna od egzaminu ósmoklasisty, ale docelowo prowadzi ucznia **od 4 klasy
> podstawówki aż po studia i rynek pracy**.
>
> **Cel:** każde dziecko otrzymuje własnego nauczyciela AI dostępnego 24/7.

To repozytorium to **żywy fundament** tej wizji. Poniżej wszystkie 25 warstw wraz
ze statusem implementacji. Legenda: ✅ działa · 🟡 częściowo · 🔮 planowane.

| # | Warstwa | Status | Gdzie w projekcie / plan |
|---|---------|--------|--------------------------|
| 1 | **Cyfrowy bliźniak ucznia** | ✅ | `src/lib/cognitive.ts` — mastery, typy błędów, ryzyko, tempo |
| 2 | **Mapa wiedzy (graf)** | ✅ | `data/knowledge-graph.json` + `pages/KnowledgeMap.tsx` |
| 3 | **AI Tutor (tekst/głos/zdjęcie/ekran)** | 🟡 | tekst + **głos** (Web Speech API): `src/lib/ai.ts`, `src/lib/speech.ts`; zdjęcia/ekran — plan |
| 4 | **Analiza odręcznych rozwiązań (OCR)** | 🔮 | model multimodalny: odczyt pisma → wykrycie błędnego kroku |
| 5 | **Tryb TikTok (feed)** | ✅ | `data/micro-lessons.json` + `pages/Feed.tsx` |
| 6 | **RPG (poziomy, XP, klasy)** | ✅ | `src/lib/store.ts`, `pages/Profile.tsx` |
| 7 | **Gildie i rankingi** | 🟡 | ligi tygodniowe + ranking: `src/lib/engagement.ts`; gildie/klasy — plan |
| 8 | **Symulator egzaminu** | ✅ | `pages/Simulator.tsx`, `projectScore()` |
| 9 | **Generator egzaminów** | ✅ | `pages/Generator.tsx` — wybór tematów/trudności, klucz, druk PDF; + `pages/Exam.tsx` |
| 10 | **Analiza wszystkich arkuszy** | 🟡 | katalog 2019–2025: `data/exams.json`; analityka wag tematów i błędów: `pages/Trends.tsx` |
| 11 | **AI psycholog nauki** | ✅ | `burnoutRisk()` w `cognitive.ts` |
| 12 | **Rodzic AI** | ✅ | `pages/Parent.tsx` — raport bez żargonu |
| 13 | **Nauczyciel AI (raport klasy)** | 🟡 | `pages/Teacher.tsx` — raport klasy (demo, kohorta symulowana) + skrót do generatora |
| 14 | **Dyrektor AI** | 🔮 | statystyki szkoły/klas/nauczycieli, wskaźniki egzaminacyjne |
| 15 | **Samorząd AI (JST)** | 🔮 | wyniki szkół w mieście, trendy, potrzeby edukacyjne |
| 16 | **Marketplace** | 🔮 | korepetytorzy, mentorzy, psycholodzy, logopedzi |
| 17 | **Kariera** | 🟡 | `pages/Career.tsx` — dopasowanie ścieżek i zawodów do mocnych stron |
| 18 | **CV ucznia** | 🔮 | budowane automatycznie z osiągnięć i projektów |
| 19 | **Portfolio** | 🔮 | projekty, prezentacje, filmy |
| 20 | **AI rekrutacja do szkół** | 🔮 | szanse, progi punktowe, ranking szkół |
| 21 | **Tryb offline** | 🟡 | PWA + localStorage działają offline; pełny offline-first — plan |
| 22 | **Multijęzykowość** | 🔮 | PL teraz; EN, UA, DE — warstwa i18n |
| 23 | **Integracje** | 🔮 | mObywatel, dzienniki elektroniczne, LMS, M365, Google Workspace, Moodle |
| 24 | **AI dla nauczycieli** | 🟡 | generator sprawdzianów z kluczem i drukiem: `pages/Generator.tsx`; konspekty/prezentacje — plan |
| 25 | **AI dla szkół** | 🔮 | sekretariat, dokumenty, plany zajęć, raporty |

## 🧱 Architektura warstwowa

```
ROLE:    Uczeń · Rodzic · Nauczyciel · Korepetytor · Dyrektor · Samorząd
            │        │         │            │            │          │
APLIKACJE: nauka · raport · panel klasy · marketplace · BI · dashboard JST
            └────────────────────────┬───────────────────────────┘
SILNIKI:   bliźniak poznawczy · graf wiedzy · SRS · adaptacja · zaangażowanie
            └────────────────────────┬───────────────────────────┘
DANE:      OTWARTA BAZA WIEDZY (graf · zadania · mikrolekcje · arkusze · błędy)
```

## 🏆 Największa przewaga: dane, nie AI

Prawdziwą fosą nie są quizy ani arkusze, lecz **baza danych** obejmująca:

- całą podstawę programową (jako graf wiedzy),
- wszystkie egzaminy z wielu lat (metadane + analiza typów zadań),
- **wszystkie błędy uczniów** (mapowane na typy: rachunek/polecenie/koncept/pamięć/język),
- **modele skuteczności nauki** (jak dany profil najszybciej robi postępy).

Po kilku latach taki system potrafi powiedzieć:

> „Uczeń z takim profilem, w wieku 14 lat, popełniający te błędy, ma 83% szans
> osiągnąć wynik 75–85% i powinien uczyć się w ten sposób."

Dlatego **otwarta baza wiedzy** (`data/`) i **rejestr typów błędów** (już w MVP) są
zaprojektowane jako fundament tej przewagi — od pierwszego commita.

## 🛣️ Od MVP do EduOS

Kolejność wdrażania (szczegóły w [`ROADMAP.md`](ROADMAP.md)):

1. **Teraz** — egzamin ósmoklasisty (3 przedmioty), pętle zaangażowania, SRS, role: uczeń + rodzic.
2. **Etap 2** — pełna podstawa 4–8, generator egzaminów klasowych, rola nauczyciela.
3. **Etap 3** — matura/zawodowy, integracje (dzienniki, M365/Google/Moodle), i18n, offline-first.
4. **Etap 4** — dyrektor/samorząd (BI), marketplace, kariera/CV/portfolio, rekrutacja do szkół.
