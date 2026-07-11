"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import TopBar from "@/components/TopBar";
import type { UserOut } from "@/lib/types";

const ACHIEVEMENTS = [
  { emoji: "🔥", title: "On Fire", desc: "Reach a 3-day streak" },
  { emoji: "⚡", title: "XP Grinder", desc: "Earn 100 total XP" },
  { emoji: "🏆", title: "Skill Master", desc: "Complete your first skill" },
  { emoji: "🎯", title: "Sharp Shooter", desc: "Finish a lesson with no mistakes" },
];

export default function ProfilePage() {
  const [user, setUser] = useState<UserOut | null>(null);

  useEffect(() => {
    api.getMe().then(setUser);
  }, []);

  return (
    <main>
      <TopBar active="profile" />
      <div className="max-w-2xl mx-auto px-6 py-10">
        {user && (
          <>
            <div className="flex items-center gap-5 mb-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-5xl">
                {user.avatar_emoji}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-duoText">{user.display_name}</h1>
                <p className="text-duoGrayDark font-semibold">@{user.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
              <StatCard emoji="🔥" label="Day streak" value={user.streak_count} color="text-duoOrange" />
              <StatCard emoji="⚡" label="Total XP" value={user.xp_total} color="text-duoYellowDark" />
              <StatCard emoji="❤️" label="Hearts" value={`${user.hearts}/${user.max_hearts}`} color="text-duoRed" />
              <StatCard emoji="💎" label="Gems" value={user.gems} color="text-duoBlue" />
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold text-duoGrayDark mb-2">
                <span>Today&apos;s goal</span>
                <span>
                  {user.today_xp} / {user.daily_goal_xp} XP
                </span>
              </div>
              <div className="h-4 rounded-full bg-duoGray overflow-hidden">
                <div
                  className="h-full bg-duoYellow rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (user.today_xp / user.daily_goal_xp) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-duoText mb-4 mt-10">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.title} className="card-duo p-4 flex flex-col items-center text-center">
                  <div className="text-3xl mb-2">{a.emoji}</div>
                  <div className="font-bold text-sm text-duoText">{a.title}</div>
                  <div className="text-xs text-duoGrayDark">{a.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 card-duo p-5">
              <h3 className="font-extrabold text-duoText mb-2">Settings</h3>
              <p className="text-sm text-duoGrayDark">
                Notifications, sound, and account settings — coming soon.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="card-duo p-4 flex flex-col items-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-duoGrayDark font-bold uppercase text-center">{label}</div>
    </div>
  );
}
