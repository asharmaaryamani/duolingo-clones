import type {
  UserOut,
  PathOut,
  LessonStartOut,
  AnswerOut,
  LessonCompleteOut,
  LeaderboardEntry,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

export const api = {
  getMe: () => request<UserOut>("/api/me"),
  getPath: () => request<PathOut>("/api/path"),
  refillHearts: () =>
    request<{ hearts: number; gems: number }>("/api/hearts/refill", { method: "POST" }),
  practiceRefill: () =>
    request<{ hearts: number; gems: number }>("/api/hearts/practice", { method: "POST" }),
  startLesson: (skillId: number) =>
    request<LessonStartOut>(`/api/lesson/start/${skillId}`),
  answer: (exerciseId: number, answer: any) =>
    request<AnswerOut>("/api/lesson/answer", {
      method: "POST",
      body: JSON.stringify({ exercise_id: exerciseId, answer }),
    }),
  completeLesson: (
    skillId: number,
    correctCount: number,
    wrongCount: number,
    heartsLost: number
  ) =>
    request<LessonCompleteOut>("/api/lesson/complete", {
      method: "POST",
      body: JSON.stringify({
        skill_id: skillId,
        correct_count: correctCount,
        wrong_count: wrongCount,
        hearts_lost: heartsLost,
      }),
    }),
  getLeaderboard: () => request<LeaderboardEntry[]>("/api/leaderboard"),
};
