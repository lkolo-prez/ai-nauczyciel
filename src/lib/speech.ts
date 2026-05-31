// Layer 3 (voice): a thin wrapper over the browser Web Speech API so the AI
// tutor can be spoken to and can speak back — fully on-device, no backend, no
// API key. Degrades gracefully when the browser lacks support.

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnySpeechRecognition = any;

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export interface Listener {
  stop: () => void;
}

// Start one-shot Polish speech recognition. Calls onResult with the transcript.
export function listenOnce(
  onResult: (text: string) => void,
  onError?: (e: string) => void,
  onEnd?: () => void,
): Listener | null {
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) {
    onError?.('not-supported');
    return null;
  }
  const rec: AnySpeechRecognition = new Ctor();
  rec.lang = 'pl-PL';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;

  rec.onresult = (event: any) => {
    const text = event.results?.[0]?.[0]?.transcript ?? '';
    if (text) onResult(text);
  };
  rec.onerror = (event: any) => onError?.(event.error || 'error');
  rec.onend = () => onEnd?.();

  try {
    rec.start();
  } catch {
    onError?.('start-failed');
    return null;
  }
  return { stop: () => rec.stop() };
}

// Speak text in Polish. Strips markdown bold so it sounds natural.
export function speak(text: string) {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/\*\*/g, '').replace(/[#_`>]/g, '');
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'pl-PL';
  u.rate = 1.02;
  u.pitch = 1;
  const plVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('pl'));
  if (plVoice) u.voice = plVoice;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return ttsSupported() && window.speechSynthesis.speaking;
}
