// Pipeline danych (szkielet): lista oficjalnych arkuszy z metadanych.
//
// Uwaga prawna: ten skrypt CELOWO nie pobiera treści arkuszy CKE/OKE (są
// chronione prawem autorskim). Operuje na metadanych z data/exams.json i
// raportuje, które pozycje czekają na ręczne uzupełnienie/weryfikację linków.
//
// Docelowo można rozszerzyć o:
//   - sprawdzanie dostępności linków (HEAD request),
//   - parsowanie list arkuszy ze stron OKE,
//   - mapowanie zadań na węzły grafu wiedzy.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const exams = JSON.parse(readFileSync(join(root, 'exams.json'), 'utf8'));

console.log('📦 Pipeline danych — katalog arkuszy\n');
console.log('Oficjalne źródła:');
for (const s of exams.officialSources) console.log(`  • ${s.name}\n    ${s.url}`);

const pending = exams.exams.filter((e) => !e.ingested);
console.log(`\nArkusze oczekujące na przetworzenie metadanych: ${pending.length}`);
for (const e of pending) console.log(`  • [${e.year}] ${e.id} → ${e.sourceUrl}`);

console.log('\nℹ️  Treści arkuszy nie są pobierane (ochrona praw autorskich).');
console.log('   Uzupełnij metadane ręcznie lub przez PR, a następnie ustaw "ingested": true.');
