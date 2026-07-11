"use client";

interface Props {
  status: "correct" | "incorrect";
  correctAnswer?: string;
  onContinue: () => void;
}

export default function FeedbackBar({ status, correctAnswer, onContinue }: Props) {
  const isCorrect = status === "correct";
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 animate-slideUp border-t-2 ${
        isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{isCorrect ? "✅" : "❌"}</span>
          <div>
            <div
              className={`text-xl font-extrabold ${
                isCorrect ? "text-duoGreenDark" : "text-duoRedDark"
              }`}
            >
              {isCorrect ? "Excellent!" : "Correct solution:"}
            </div>
            {!isCorrect && correctAnswer && (
              <div className="text-duoRedDark font-semibold">{correctAnswer}</div>
            )}
          </div>
        </div>
        <button
          onClick={onContinue}
          className={`btn-duo ${isCorrect ? "btn-duo-green" : "btn-duo-red"}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
