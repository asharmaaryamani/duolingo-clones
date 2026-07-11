"use client";

interface Props {
  xpEarned: number;
  streakCount: number;
  streakExtended: boolean;
  skillCompleted: boolean;
  dailyGoalMet: boolean;
  onContinue: () => void;
}

export default function LessonCompleteModal({
  xpEarned,
  streakCount,
  streakExtended,
  skillCompleted,
  dailyGoalMet,
  onContinue,
}: Props) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-6 animate-pop">
      <div className="text-7xl mb-4">{skillCompleted ? "🏆" : "🎉"}</div>
      <h1 className="text-3xl font-extrabold text-duoText mb-2">
        {skillCompleted ? "Skill complete!" : "Lesson complete!"}
      </h1>
      <p className="text-duoGrayDark font-semibold mb-10">Great job, keep it up!</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
        <div className="card-duo p-5 flex flex-col items-center border-duoYellow">
          <div className="text-3xl mb-1">⚡</div>
          <div className="text-2xl font-extrabold text-duoYellowDark">+{xpEarned} XP</div>
          <div className="text-xs text-duoGrayDark font-bold uppercase">Total XP</div>
        </div>
        <div className="card-duo p-5 flex flex-col items-center border-duoOrange">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-extrabold text-duoOrange">{streakCount}</div>
          <div className="text-xs text-duoGrayDark font-bold uppercase">
            {streakExtended ? "Streak extended!" : "Day streak"}
          </div>
        </div>
      </div>

      {dailyGoalMet && (
        <div className="mb-8 px-4 py-2 rounded-full bg-green-50 text-duoGreenDark font-bold text-sm">
          ✅ Daily goal reached!
        </div>
      )}

      <button onClick={onContinue} className="btn-duo btn-duo-green w-full max-w-sm">
        Continue
      </button>
    </div>
  );
}
