"use client";

interface Props {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function TypeAnswer({ prompt, value, onChange, onSubmit }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-duoText mb-8">{prompt}</h2>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) onSubmit();
        }}
        placeholder="Type your answer"
        className="w-full max-w-xl border-2 border-duoGray focus:border-duoBlue rounded-2xl px-5 py-4 text-lg font-semibold outline-none"
      />
    </div>
  );
}
