export interface UserOut {
  id: number;
  username: string;
  display_name: string;
  avatar_emoji: string;
  xp_total: number;
  streak_count: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_goal_xp: number;
  today_xp: number;
}

export type SkillStatus = "locked" | "available" | "completed";

export interface SkillOut {
  id: number;
  title: string;
  icon_emoji: string;
  order_index: number;
  max_level: number;
  level: number;
  status: SkillStatus;
}

export interface UnitOut {
  id: number;
  title: string;
  description: string;
  color_hex: string;
  order_index: number;
  skills: SkillOut[];
}

export interface PathOut {
  course_title: string;
  flag_emoji: string;
  units: UnitOut[];
}

export type ExerciseType =
  | "multiple_choice"
  | "translate"
  | "match"
  | "fill_blank"
  | "type_answer";

export interface ExercisePublic {
  id: number;
  type: ExerciseType;
  prompt: string;
  options?: any;
  word_bank?: string[] | null;
}

export interface LessonStartOut {
  skill_id: number;
  skill_title: string;
  exercises: ExercisePublic[];
  hearts: number;
}

export interface AnswerOut {
  correct: boolean;
  correct_answer: any;
  hearts: number;
  out_of_hearts: boolean;
}

export interface LessonCompleteOut {
  xp_earned: number;
  new_xp_total: number;
  new_level: number;
  skill_completed: boolean;
  streak_count: number;
  streak_extended: boolean;
  newly_unlocked_skill_ids: number[];
  daily_goal_met: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  display_name: string;
  avatar_emoji: string;
  xp_total: number;
  is_me: boolean;
}
