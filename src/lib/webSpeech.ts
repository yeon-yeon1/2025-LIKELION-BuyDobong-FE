export function speak(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  try {
    window.speechSynthesis.cancel();
  } catch {}
  window.speechSynthesis.speak(u);
}

export function createRecognition(): SpeechRecognition | null {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec: SpeechRecognition = new SR();
  rec.lang = 'ko-KR';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false; // 한 발화 후 종료
  return rec;
}
