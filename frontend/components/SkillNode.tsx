"use client";
import { useRouter } from "next/navigation";
import type { SkillOut } from "@/lib/types";

interface Props {
  skill: SkillOut;
  color: string;
  offset: number;
  isCurrent: boolean;
}

export default function SkillNode({ skill, color, offset, isCurrent }: Props) {
  const router = useRouter();
  const locked = skill.status === "locked";
  const completed = skill.status === "completed";

  return (
    <div
      className="flex flex-col items-center relative"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {isCurrent && !locked && (
        <div className="absolute -top-10 bg-white border-2 border-duoGray text-duoGreen font-extrabold text-xs uppercase px-3 py-1 rounded-xl shadow-sm animate-pop">
          Start
        </div>
      )}
      <button
        disabled={locked}
        onClick={() => router.push(`/lesson/${skill.id}`)}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 transition-transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed ${
          locked ? "grayscale opacity-70" : ""
        }`}
        style={{
          backgroundColor: locked ? "#e5e5e5" : completed ? "#ffc800" : color,
          borderColor: locked ? "#cfcfcf" : "rgba(0,0,0,0.08)",
          boxShadow: locked ? "0 4px 0 0 #cfcfcf" : `0 5px 0 0 rgba(0,0,0,0.15)`,
        }}
      >
        {locked ? "🔒" : skill.icon_emoji}
      </button>
      <div className="mt-2 text-xs font-bold text-duoGrayDark text-center w-24 truncate">
        {skill.title}
      </div>
      {!locked && (
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: skill.max_level }).map((_, i) => (
            <span key={i} className={i < skill.level ? "text-duoYellow" : "text-duoGray"}>
              👑
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
