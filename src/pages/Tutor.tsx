import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateReply } from '../lib/ai';
import type { TutorReply } from '../lib/ai';
import { useStore } from '../lib/store';
import { listenOnce, speak, stopSpeaking, speechSupported, ttsSupported } from '../lib/speech';

interface Msg {
  role: 'user' | 'ai';
  text: string;
  reply?: TutorReply;
}

export default function Tutor() {
  const state = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'ai',
      text: 'Cześć! Jestem Twoim nauczycielem AI 🤖. Wytłumaczę temat, znajdę Twoje luki i dam zadanie. Możesz pisać albo mówić do mnie. Od czego zaczynamy?',
      reply: { text: '', suggestions: ['Od czego zacząć?', 'Nie rozumiem pierwiastków', 'Daj mi zadanie z procentów'] },
    },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const canListen = speechSupported();
  const canSpeak = ttsSupported();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Clean up any ongoing speech when leaving the screen.
  useEffect(() => () => stopSpeaking(), []);

  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = generateReply(text, state);
    setMsgs((m) => [...m, { role: 'user', text }, { role: 'ai', text: reply.text, reply }]);
    setInput('');
    if (voiceOn) speak(reply.text);
  };

  const toggleMic = () => {
    if (listening) return;
    setListening(true);
    const listener = listenOnce(
      (text) => {
        setInput('');
        send(text);
      },
      () => setListening(false),
      () => setListening(false),
    );
    if (!listener) setListening(false);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    if (!next) stopSpeaking();
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/5 p-4">
        <div>
          <h1 className="text-lg font-extrabold">🤖 Nauczyciel AI</h1>
          <p className="text-[11px] text-white/50">Działa offline na otwartej bazie wiedzy. Mów lub pisz.</p>
        </div>
        {canSpeak && (
          <button
            onClick={toggleVoice}
            className={`chip ${voiceOn ? 'bg-brand text-white' : 'bg-white/5 text-white/60'}`}
            title="Czytaj odpowiedzi na głos"
          >
            {voiceOn ? '🔊 Głos wł.' : '🔈 Głos wył.'}
          </button>
        )}
      </header>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-brand text-white' : 'bg-white/8 text-white/90'
              }`}
            >
              <Markdown text={m.text} />

              {m.reply?.lesson && (
                <div className="mt-2 rounded-lg border-l-2 border-accent bg-black/20 px-3 py-2 text-xs">
                  💡 {m.reply.lesson.takeaway}
                </div>
              )}

              {m.reply?.question && (
                <Link
                  to="/cwicz"
                  state={{ nodeId: m.reply.question.nodeId }}
                  className="mt-2 block rounded-lg bg-black/25 px-3 py-2 text-xs hover:bg-black/40"
                >
                  🎯 <span className="font-semibold">Zadanie:</span> {m.reply.question.stem.slice(0, 70)}…
                  <span className="text-brand-400"> — rozwiąż ›</span>
                </Link>
              )}

              {m.reply?.node && (
                <Link
                  to="/mapa"
                  state={{ subject: m.reply.node.subject }}
                  className="mt-1 inline-block text-xs text-accent hover:underline"
                >
                  Pokaż „{m.reply.node.name}" na mapie wiedzy →
                </Link>
              )}

              {m.reply?.suggestions && m.reply.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.reply.suggestions.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => send(sug)}
                      className="chip bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {listening && (
        <div className="px-4 pb-1 text-center text-xs font-semibold text-brand-400 animate-pop">
          🎙️ Słucham… mów teraz
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-white/5 p-3"
      >
        {canListen && (
          <button
            type="button"
            onClick={toggleMic}
            className={`btn px-3 ${listening ? 'bg-bad text-white animate-pulse' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
            title="Mów do nauczyciela"
            aria-label="Mów do nauczyciela"
          >
            🎙️
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canListen ? 'Napisz lub naciśnij 🎙️…' : 'Napisz, czego nie rozumiesz…'}
          className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
        />
        <button type="submit" className="btn-brand px-4">➤</button>
      </form>
    </div>
  );
}

// Minimal markdown: **bold** and newlines.
function Markdown({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </p>
      ))}
    </>
  );
}
