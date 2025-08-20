declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onaudiostart?: (ev: Event) => void;
    onspeechstart?: (ev: Event) => void;
    onspeechend?: (ev: Event) => void;
    onresult?: (ev: SpeechRecognitionEvent) => void;
    onerror?: (ev: any) => void;
    onend?: (ev: Event) => void;
  }
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
  interface SpeechRecognitionResult {
    0: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
  }
  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
}
export {};
