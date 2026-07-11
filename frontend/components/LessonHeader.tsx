"use client";

interface Props {
  progress: number; // 0..1
  hearts: number;
  onClose: () => void;
}

export default function LessonHeader({ progress, hearts, onClose }: Props) {
  return (
    <div className="flex items-center gap-4 py-4 max-w-3xl mx-auto px-6">
      <button
        onClick={onClose}
        aria-label="Close lesson"
        className="text-duoGrayDark hover:text-duoText text-2xl font-bold"
      >
        ✕
      </button>
      <div className="flex-1 h-4 rounded-full bg-duoGray overflow-hidden">
        <div
          className="h-full bg-duoGreen transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(4, progress * 100))}%` }}
        />
      </div>
      <div className="flex items-center gap-1 font-extrabold text-duoRed text-lg min-w-[48px]">
        ❤️ {hearts}
      </div>
    </div>
  );
}
