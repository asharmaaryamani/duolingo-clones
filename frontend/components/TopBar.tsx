"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { UserOut } from "@/lib/types";

export default function TopBar({ active }: { active: "learn" | "leaderboard" | "profile" }) {
  const [user, setUser] = useState<UserOut | null>(null);

  useEffect(() => {
    api.getMe().then(setUser).catch(() => {});
  }, []);

  const tabs: { key: "learn" | "leaderboard" | "profile"; label: string; href: string }[] = [
    { key: "learn", label: "Learn", href: "/" },
    { key: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
    { key: "profile", label: "Profile", href: "/profile" },
  ];

  return (
    <div className="sticky top-0 z-30 bg-white border-b-2 border-duoGray">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-extrabold text-duoGreen text-2xl">
          🦉 <span className="hidden sm:inline">Duo Clone</span>
        </div>

        <div className="hidden md:flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`px-4 py-2 rounded-xl font-bold text-sm uppercase ${
                active === t.key
                  ? "text-duoGreen bg-green-50"
                  : "text-duoGrayDark hover:bg-gray-50"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {user && (
          <div className="flex items-center gap-4 font-extrabold text-sm sm:text-base">
            <span className="flex items-center gap-1 text-duoOrange">
              🔥 {user.streak_count}
            </span>
            <span className="flex items-center gap-1 text-duoBlue">💎 {user.gems}</span>
            <span className="flex items-center gap-1 text-duoRed">
              ❤️ {user.hearts}/{user.max_hearts}
            </span>
          </div>
        )}
      </div>
      <div className="flex md:hidden justify-around border-t border-duoGray">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`flex-1 text-center py-2 font-bold text-xs uppercase ${
              active === t.key ? "text-duoGreen" : "text-duoGrayDark"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
