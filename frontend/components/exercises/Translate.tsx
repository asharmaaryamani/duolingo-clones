"use client";
import { useMemo, useState, useEffect } from "react";

interface Props {
  prompt: string;
  wordBank: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

// Each bank word gets a stable unique id so duplicate words (e.g. "el") remain distinguishable
function withIds(words: string[]) {
  return words.map((w, i) => ({ id: `${w}-${i}`, word: w }));
}

export default function Translate({ prompt, wordBank, value, onChange }: Props) {
  const bankTokens = useMemo(() => withIds(wordBank), [wordBank]);
  const [usedIds, setUsedIds] = useState<string[]>([]);

  useEffect(() => {
    setUsedIds([]);
  }, [prompt]);

  const chosenWords = usedIds.map((id) => bankTokens.find((t) => t.id === id)?.word || "");

  function tapBankWord(id: string) {
    if (usedIds.includes(id)) return;
    const next = [...usedIds, id];
    setUsedIds(next);
    onChange(next.map((uid) => bankTokens.find((t) => t.id === uid)?.word || ""));
  }

  function tapChosenWord(id: string) {
    const next = usedIds.filter((uid) => uid !== id);
    setUsedIds(next);
    onChange(next.map((uid) => bankTokens.find((t) => t.id === uid)?.word || ""));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-duoText mb-8">{prompt}</h2>

      <div className="min-h-[64px] border-b-2 border-duoGray flex flex-wrap gap-2 pb-4 mb-8 max-w-xl">
        {usedIds.map((id) => {
          const token = bankTokens.find((t) => t.id === id);
          if (!token) return null;
          return (
            <button
              key={id}
              onClick={() => tapChosenWord(id)}
              className="px-4 py-2 rounded-xl border-2 border-duoGray bg-white font-semibold text-duoText hover:opacity-70"
            >
              {token.word}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 max-w-xl">
        {bankTokens.map((t) => {
          const used = usedIds.includes(t.id);
          return (
            <button
              key={t.id}
              disabled={used}
              onClick={() => tapBankWord(t.id)}
              className={`px-4 py-2 rounded-xl border-2 font-semibold transition-opacity ${
                used
                  ? "opacity-0 pointer-events-none border-duoGray"
                  : "border-duoGray bg-white text-duoText hover:bg-gray-50"
              }`}
            >
              {t.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
