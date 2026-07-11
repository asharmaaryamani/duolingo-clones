"use client";

interface Props {
  prompt: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}

export default function MultipleChoice({ prompt, options, value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-duoText mb-8">{prompt}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`text-left px-5 py-4 rounded-2xl border-2 font-semibold text-lg transition-colors ${
                selected
                  ? "border-duoBlue bg-sky-50 text-duoBlueDark"
                  : "border-duoGray hover:bg-gray-50 text-duoText"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
