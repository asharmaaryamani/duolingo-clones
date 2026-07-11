"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { ExercisePublic, LessonCompleteOut } from "@/lib/types";
import LessonHeader from "@/components/LessonHeader";
import FeedbackBar from "@/components/FeedbackBar";
import MultipleChoice from "@/components/exercises/MultipleChoice";
import Translate from "@/components/exercises/Translate";
import MatchPairs from "@/components/exercises/MatchPairs";
import FillBlank from "@/components/exercises/FillBlank";
import TypeAnswer from "@/components/exercises/TypeAnswer";
import LessonCompleteModal from "@/components/modals/LessonCompleteModal";
import OutOfHeartsModal from "@/components/modals/OutOfHeartsModal";

type Feedback = { status: "correct" | "incorrect"; correctAnswer?: string } | null;

function formatAnswer(a: any): string {
  if (Array.isArray(a)) return a.join(" ");
  if (typeof a === "object" && a !== null) return Object.values(a).join(", ");
  return String(a);
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = Number(params.skillId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillTitle, setSkillTitle] = useState("");
  const [exercises, setExercises] = useState<ExercisePublic[]>([]);
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [gems, setGems] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const [draft, setDraft] = useState<any>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [checking, setChecking] = useState(false);

  const [complete, setComplete] = useState<LessonCompleteOut | null>(null);
  const [outOfHearts, setOutOfHearts] = useState(false);

  useEffect(() => {
    api
      .startLesson(skillId)
      .then((lesson) => {
        setSkillTitle(lesson.skill_title);
        setExercises(lesson.exercises);
        setHearts(lesson.hearts);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    api.getMe().then((u) => setGems(u.gems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId]);

  const current = exercises[idx];
  const progress = exercises.length ? idx / exercises.length : 0;

  async function handleCheck() {
    if (!current || draft === null || draft === undefined || draft === "") return;
    setChecking(true);
    try {
      const result = await api.answer(current.id, draft);
      setHearts(result.hearts);
      if (result.correct) {
        setCorrectCount((c) => c + 1);
      } else {
        setWrongCount((w) => w + 1);
      }
      setFeedback({
        status: result.correct ? "correct" : "incorrect",
        correctAnswer: result.correct ? undefined : formatAnswer(result.correct_answer),
      });
    } finally {
      setChecking(false);
    }
  }

  async function handleMatchMistake() {
    if (!current) return;
    const result = await api.answer(current.id, "__no_match__");
    setHearts(result.hearts);
    setWrongCount((w) => w + 1);
    if (result.hearts <= 0) {
      setOutOfHearts(true);
    }
  }

  function handleMatchAllDone() {
    setCorrectCount((c) => c + 1);
    setFeedback({ status: "correct" });
  }

  async function goNext() {
    setFeedback(null);
    setDraft(null);
    if (hearts <= 0) {
      setOutOfHearts(true);
      return;
    }
    if (idx + 1 < exercises.length) {
      setIdx((i) => i + 1);
    } else {
      const result = await api.completeLesson(skillId, correctCount, wrongCount, 0);
      setComplete(result);
    }
  }

  async function handlePracticeInstead() {
    const res = await api.practiceRefill();
    setHearts(res.hearts);
    setOutOfHearts(false);
  }

  async function handleRefill() {
    const res = await api.refillHearts();
    setHearts(res.hearts);
    setGems(res.gems);
    setOutOfHearts(false);
  }

  if (loading) {
    return <div className="text-center py-24 font-bold text-duoGrayDark">Loading lesson…</div>;
  }
  if (error || !current) {
    return (
      <div className="text-center py-24 px-6">
        <p className="font-bold text-duoRed mb-4">{error || "This lesson has no exercises."}</p>
        <button onClick={() => router.push("/")} className="btn-duo btn-duo-green">
          Back to path
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32">
      <LessonHeader progress={progress} hearts={hearts} onClose={() => router.push("/")} />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="text-sm font-bold text-duoGrayDark uppercase mb-6">{skillTitle}</div>

        {current.type === "multiple_choice" && (
          <MultipleChoice
            prompt={current.prompt}
            options={current.options as string[]}
            value={draft}
            onChange={setDraft}
          />
        )}
        {current.type === "translate" && (
          <Translate
            prompt={current.prompt}
            wordBank={current.word_bank as string[]}
            value={draft || []}
            onChange={setDraft}
          />
        )}
        {current.type === "match" && (
          <MatchPairs
            prompt={current.prompt}
            correctMap={current.options as Record<string, string>}
            onAllMatched={handleMatchAllDone}
            onMistake={handleMatchMistake}
          />
        )}
        {current.type === "fill_blank" && (
          <FillBlank
            prompt={current.prompt}
            options={current.options as string[]}
            value={draft}
            onChange={setDraft}
          />
        )}
        {current.type === "type_answer" && (
          <TypeAnswer
            prompt={current.prompt}
            value={draft || ""}
            onChange={setDraft}
            onSubmit={handleCheck}
          />
        )}
      </div>

      {!feedback && current.type !== "match" && (
        <div className="fixed bottom-0 left-0 right-0 border-t-2 border-duoGray bg-white">
          <div className="max-w-3xl mx-auto px-6 py-5 flex justify-end">
            <button
              onClick={handleCheck}
              disabled={
                checking ||
                draft === null ||
                draft === undefined ||
                draft === "" ||
                (Array.isArray(draft) && draft.length === 0)
              }
              className="btn-duo btn-duo-green"
            >
              Check
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <FeedbackBar
          status={feedback.status}
          correctAnswer={feedback.correctAnswer}
          onContinue={goNext}
        />
      )}

      {complete && (
        <LessonCompleteModal
          xpEarned={complete.xp_earned}
          streakCount={complete.streak_count}
          streakExtended={complete.streak_extended}
          skillCompleted={complete.skill_completed}
          dailyGoalMet={complete.daily_goal_met}
          onContinue={() => router.push("/")}
        />
      )}

      {outOfHearts && !complete && (
        <OutOfHeartsModal
          gems={gems}
          onRefill={handleRefill}
          onPracticeInstead={handlePracticeInstead}
          onQuit={() => router.push("/")}
        />
      )}
    </main>
  );
}
