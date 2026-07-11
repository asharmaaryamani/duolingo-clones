# Duo Clone — Duolingo Web App Clone

A functional clone of Duolingo's learning path, lesson loop, and gamification
mechanics (XP, streaks, hearts, gems, leaderboard). Built for the SDE
Fullstack Assignment.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** SQLite (auto-created and auto-seeded on first run)

---

## 1. Quick Start (GitHub Codespaces)

This repo includes a `.devcontainer/devcontainer.json`. When you open it in a
Codespace, it automatically installs both the Python and Node dependencies.

Once the Codespace finishes building:

**Terminal 1 — backend**
```bash
cd backend
./run_dev.sh
# or manually:
# pip install --break-system-packages -r requirements.txt
# python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The first time it runs, it creates `backend/duolingo.db` and seeds it with
course content and a demo user automatically — nothing else to configure.

**Terminal 2 — frontend**
```bash
cd frontend
./run_dev.sh
# or manually:
# cp .env.local.example .env.local
# npm install
# npm run dev
```

Codespaces will prompt you to open the forwarded port `3000` in your browser
(port `8000` is the API and doesn't need to be opened directly). Make sure
port `8000` is set to **Public** (or at least visible to your browser) in the
"Ports" tab if the frontend can't reach the API.

If you're running locally (not Codespaces), the defaults already point the
frontend at `http://localhost:8000`.

---

## 2. Manual Setup (local machine)

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload   # http://localhost:8000

# Frontend (separate terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                                 # http://localhost:3000
```

Open **http://localhost:3000**. There is no login screen — the app assumes a
single default learner (`learner1` / "Alex"), per the assignment's
simplified-auth allowance.

---

## 3. Architecture Overview

```
duolingo-clone/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS, router registration, seed-on-boot
│   │   ├── database.py       # SQLAlchemy engine/session (SQLite file: backend/duolingo.db)
│   │   ├── models.py         # ORM models = the DB schema
│   │   ├── schemas.py        # Pydantic request/response models
│   │   ├── crud.py           # All game logic: unlocking, hearts regen, streaks, XP, leaderboard
│   │   ├── seed.py           # Generates course/units/skills/exercises + demo users
│   │   └── routers/
│   │       ├── user.py       # /api/me, /api/hearts/*
│   │       ├── path.py       # /api/path
│   │       ├── lesson.py     # /api/lesson/*
│   │       └── leaderboard.py
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx                 # Home: top bar + skill tree
    │   ├── lesson/[skillId]/page.tsx  # The core lesson-player loop
    │   ├── profile/page.tsx
    │   └── leaderboard/page.tsx
    ├── components/
    │   ├── TopBar.tsx, PathTree.tsx, SkillNode.tsx
    │   ├── LessonHeader.tsx, FeedbackBar.tsx
    │   ├── exercises/  (MultipleChoice, Translate, MatchPairs, FillBlank, TypeAnswer)
    │   └── modals/     (LessonCompleteModal, OutOfHeartsModal)
    └── lib/  (api.ts client, types.ts)
```

**Why this split:** the backend owns all game rules (what counts as correct,
how hearts/XP/streaks/unlocks change) so the frontend can't be tricked into
awarding itself XP — every exercise answer and lesson completion is validated
and computed server-side. The frontend is a thin, highly interactive
presentation layer per Duolingo's actual UI patterns (tap-to-answer, sliding
feedback bar, full-screen completion modal).

---

## 4. Database Schema

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Learner profile + live game state | `xp_total`, `streak_count`, `last_activity_date`, `hearts`, `max_hearts`, `last_heart_lost_at`, `gems`, `daily_goal_xp` |
| `courses` | One seeded course (Spanish) | `slug`, `title`, `flag_emoji` |
| `units` | Ordered groups of skills within a course | `course_id` (FK), `order_index`, `color_hex` |
| `skills` | A node on the path (e.g. "Greetings") | `unit_id` (FK), `order_index`, `max_level` (crowns) |
| `exercises` | One question belonging to a skill | `skill_id` (FK), `type`, `prompt`, `options_json`, `correct_answer_json`, `word_bank_json` |
| `user_skill_progress` | Per-user progress on each skill | `user_id`+`skill_id` (unique), `level` (crowns earned), `status` (locked/available/completed) |
| `daily_activity` | Per-user, per-day XP (drives streak + daily goal) | `user_id`+`date` (unique), `xp_earned`, `goal_met` |
| `lesson_attempts` | History log of every lesson played | `user_id`, `skill_id`, `correct_count`, `wrong_count`, `xp_earned`, `passed` |

Relationships: `Course 1—N Unit 1—N Skill 1—N Exercise`, and
`User 1—N UserSkillProgress N—1 Skill` (join table capturing per-user state on
a shared content graph), plus `User 1—N DailyActivity` and
`User 1—N LessonAttempt` for history/analytics.

Correct answers are never sent to the client — `/api/lesson/start/{id}`
strips `correct_answer_json` from the exercise payload; checking happens
server-side in `/api/lesson/answer`.

---

## 5. API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/me` | Current user + live stats (also passively regenerates hearts over time) |
| GET | `/api/path` | Full skill tree with per-skill lock/available/completed status and crown level |
| GET | `/api/lesson/start/{skill_id}` | Starts a lesson: returns its exercises (answers hidden) |
| POST | `/api/lesson/answer` | `{exercise_id, answer}` → checks correctness server-side, deducts a heart if wrong |
| POST | `/api/lesson/complete` | `{skill_id, correct_count, wrong_count, hearts_lost}` → awards XP, updates crowns/streak/daily goal, unlocks next skill |
| POST | `/api/hearts/refill` | Mocked gem-cost full refill |
| POST | `/api/hearts/practice` | Mocked free "practice" refill (+1 heart) |
| GET | `/api/leaderboard` | Seeded users + current learner, ranked by total XP |

Interactive OpenAPI docs are available at `http://localhost:8000/docs` once
the backend is running.

---

## 6. Gamification Logic (where to find it)

All of this lives in `backend/app/crud.py`:

- **Hearts:** lose 1 per wrong answer; passively regenerate 1 every 30
  minutes (`regenerate_hearts`); a lesson can't start with 0 hearts.
- **Streak:** `complete_lesson` compares `last_activity_date` to today —
  consecutive day → streak +1, same day → unchanged, gap → resets to 1.
- **XP:** 10 XP per correct answer + a 15 XP completion bonus if the lesson
  is passed; tracked both as a running `xp_total` and per-day in
  `daily_activity` (drives the daily-goal progress ring).
- **Crowns / unlocking:** each skill has `max_level` crowns (3). Finishing a
  lesson increments the skill's crown level; reaching `max_level` marks it
  `completed` and unlocks the next skill in sequence.

---

## 7. Exercise Types Implemented

1. **Multiple choice** — pick the correct translation from 4 options.
2. **Translate (tap-the-words)** — build a translated phrase by tapping
   word-bank tiles in order.
3. **Match pairs** — connect English↔Spanish word pairs; a wrong tap costs a
   heart, exactly like a real answer.
4. **Fill in the blank** — choose the word that completes a cloze sentence.
5. **Type the answer** — free-text input, checked accent-insensitively
   (typing `si` is accepted for `sí`).

Each skill is seeded with exactly one of each type so every lesson has
variety, per the assignment brief.

---

## 8. Assumptions & Simplifications

- **Auth:** a single default learner is assumed (no login flow), as
  explicitly allowed by the assignment.
- **Gems / Super / social features:** gems are mocked currency (start at
  500); in-app purchases, Super subscription, and friends are "Coming Soon"
  placeholders rather than built out, per the assignment's optional list.
- **Audio:** not implemented (placeholder-optional per brief).
- **Streak "day" logic:** uses the server's real calendar date rather than a
  simulated clock, so you can test it by changing your machine/container
  date if you want to see multi-day streak behavior without waiting.
- **Leaderboard:** ranks all seeded users by all-time total XP rather than a
  rolling weekly window, to keep the seeded demo meaningful immediately.
- **Match-pairs answer submission:** the correct mapping is intentionally
  visible to the client for this exercise type (it's a sorting/recall task,
  not a multiple-choice task with hidden distractors), but wrong taps still
  cost a heart via the same server-validated `/api/lesson/answer` path used
  by every other exercise type.

---

## 9. Deployment Notes

- **Frontend:** deploy to Vercel/Netlify; set `NEXT_PUBLIC_API_URL` to your
  deployed backend's URL.
- **Backend:** deploy to Render/Railway; SQLite is file-based, so pick a host
  with a persistent disk (or swap `DATABASE_URL` in `database.py` for a
  managed Postgres instance if you want durability across redeploys — the
  SQLAlchemy models require no changes to do so).
