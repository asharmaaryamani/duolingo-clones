"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import TopBar from "@/components/TopBar";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.getLeaderboard().then(setEntries);
  }, []);

  return (
    <main>
      <TopBar active="leaderboard" />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-duoText mb-2">🏆 Leaderboard</h1>
        <p className="text-duoGrayDark font-semibold mb-8">
          This week&apos;s top XP earners in the Bronze League
        </p>

        <div className="card-duo divide-y-2 divide-duoGray">
          {entries.map((e) => (
            <div
              key={e.username}
              className={`flex items-center gap-4 px-5 py-4 ${
                e.is_me ? "bg-green-50" : ""
              }`}
            >
              <div className="w-8 text-center font-extrabold text-duoGrayDark">
                {e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : e.rank}
              </div>
              <div className="text-2xl">{e.avatar_emoji}</div>
              <div className="flex-1 font-bold text-duoText">
                {e.display_name}
                {e.is_me && <span className="text-duoGreen text-xs ml-2">(you)</span>}
              </div>
              <div className="font-extrabold text-duoYellowDark">{e.xp_total} XP</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
