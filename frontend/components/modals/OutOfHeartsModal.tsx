"use client";

interface Props {
  gems: number;
  onRefill: () => void;
  onPracticeInstead: () => void;
  onQuit: () => void;
}

export default function OutOfHeartsModal({ gems, onRefill, onPracticeInstead, onQuit }: Props) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-6 animate-pop">
      <div className="text-7xl mb-4">💔</div>
      <h1 className="text-3xl font-extrabold text-duoText mb-2">You're out of hearts!</h1>
      <p className="text-duoGrayDark font-semibold mb-10 text-center max-w-sm">
        Refill your hearts with gems, or practice to earn a heart back — for free.
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <button onClick={onRefill} className="btn-duo btn-duo-blue w-full">
          💎 Refill for 350 gems ({gems} available)
        </button>
        <button onClick={onPracticeInstead} className="btn-duo btn-duo-green w-full">
          Practice for free
        </button>
        <button onClick={onQuit} className="btn-duo btn-duo-outline w-full">
          Not now
        </button>
      </div>
    </div>
  );
}
