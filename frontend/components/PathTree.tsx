"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PathOut } from "@/lib/types";
import SkillNode from "./SkillNode";

const OFFSET_PATTERN = [0, 56, 88, 56, 0, -56, -88, -56];

export default function PathTree() {
  const [path, setPath] = useState<PathOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPath()
      .then(setPath)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-duoGrayDark font-bold">Loading path…</div>;
  }
  if (!path) {
    return (
      <div className="text-center py-20 text-duoRed font-bold">
        Couldn&apos;t load your learning path. Is the backend running?
      </div>
    );
  }

  let globalIndex = 0;
  let currentAssigned = false;

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {path.units.map((unit) => (
        <div key={unit.id} className="mb-14">
          <div
            className="rounded-2xl px-6 py-4 mb-10 text-white shadow-md"
            style={{ backgroundColor: unit.color_hex }}
          >
            <div className="text-xs font-bold uppercase opacity-80">
              Unit {unit.order_index + 1}
            </div>
            <div className="text-xl font-extrabold">{unit.title}</div>
            <div className="text-sm opacity-90">{unit.description}</div>
          </div>

          <div className="flex flex-col items-center gap-10">
            {unit.skills.map((skill) => {
              const offset = OFFSET_PATTERN[globalIndex % OFFSET_PATTERN.length];
              globalIndex += 1;
              const isCurrent = !currentAssigned && skill.status === "available";
              if (isCurrent) currentAssigned = true;
              return (
                <SkillNode
                  key={skill.id}
                  skill={skill}
                  color={unit.color_hex}
                  offset={offset}
                  isCurrent={isCurrent}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
