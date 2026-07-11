"use client";
import { useMemo, useState } from "react";

interface Props {
  prompt: string;
  correctMap: Record<string, string>;
  onAllMatched: () => void;
  onMistake: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchPairs({ prompt, correctMap, onAllMatched, onMistake }: Props) {
  const englishWords = useMemo(() => shuffle(Object.keys(correctMap)), [correctMap]);
  const spanishWords = useMemo(() => shuffle(Object.values(correctMap)), [correctMap]);

  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [selectedEs, setSelectedEs] = useState<string | null>(null);
  const [wrongPulse, setWrongPulse] = useState(false);

  function evaluate(en: string, es: string) {
    if (correctMap[en] === es) {
      const next = new Set(matched);
      next.add(en);
      setMatched(next);
      setSelectedEn(null);
      setSelectedEs(null);
      if (next.size === englishWords.length) {
        setTimeout(onAllMatched, 200);
      }
    } else {
      setWrongPulse(true);
      onMistake();
      setTimeout(() => {
        setWrongPulse(false);
        setSelectedEn(null);
        setSelectedEs(null);
      }, 350);
    }
  }

  function clickEn(word: string) {
    if (matched.has(word)) return;
    setSelectedEn(word);
    if (selectedEs) evaluate(word, selectedEs);
  }

  function clickEs(word: string) {
    if (Object.values(correctMap).filter((v) => v === word).length === 0) return;
    const isMatchedEs = [...matched].some((en) => correctMap[en] === word);
    if (isMatchedEs) return;
    setSelectedEs(word);
    if (selectedEn) evaluate(selectedEn, word);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-duoText mb-8">{prompt}</h2>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="flex flex-col gap-3">
          {englishWords.map((word) => {
            const isMatched = matched.has(word);
            const isSelected = selectedEn === word;
            return (
              <button
                key={word}
                disabled={isMatched}
                onClick={() => clickEn(word)}
                className={`px-4 py-3 rounded-xl border-2 font-semibold text-left transition-all ${
                  isMatched
                    ? "opacity-0 pointer-events-none"
                    : isSelected
                    ? wrongPulse
                      ? "border-duoRed bg-red-50 animate-shake"
                      : "border-duoBlue bg-sky-50"
                    : "border-duoGray bg-white hover:bg-gray-50"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {spanishWords.map((word, i) => {
            const isMatched = [...matched].some((en) => correctMap[en] === word);
            const isSelected = selectedEs === word;
            return (
              <button
                key={`${word}-${i}`}
                disabled={isMatched}
                onClick={() => clickEs(word)}
                className={`px-4 py-3 rounded-xl border-2 font-semibold text-left transition-all ${
                  isMatched
                    ? "opacity-0 pointer-events-none"
                    : isSelected
                    ? wrongPulse
                      ? "border-duoRed bg-red-50 animate-shake"
                      : "border-duoBlue bg-sky-50"
                    : "border-duoGray bg-white hover:bg-gray-50"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
