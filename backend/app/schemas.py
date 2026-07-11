from typing import Any, List, Optional
from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_emoji: str
    xp_total: int
    streak_count: int
    hearts: int
    max_hearts: int
    gems: int
    daily_goal_xp: int
    today_xp: int = 0

    class Config:
        from_attributes = True


class SkillOut(BaseModel):
    id: int
    title: str
    icon_emoji: str
    order_index: int
    max_level: int
    level: int
    status: str  # locked | available | completed


class UnitOut(BaseModel):
    id: int
    title: str
    description: str
    color_hex: str
    order_index: int
    skills: List[SkillOut]


class PathOut(BaseModel):
    course_title: str
    flag_emoji: str
    units: List[UnitOut]


class ExercisePublic(BaseModel):
    id: int
    type: str
    prompt: str
    options: Optional[Any] = None
    word_bank: Optional[Any] = None


class LessonStartOut(BaseModel):
    skill_id: int
    skill_title: str
    exercises: List[ExercisePublic]
    hearts: int


class AnswerIn(BaseModel):
    exercise_id: int
    answer: Any


class AnswerOut(BaseModel):
    correct: bool
    correct_answer: Any
    hearts: int
    out_of_hearts: bool


class LessonCompleteIn(BaseModel):
    skill_id: int
    correct_count: int
    wrong_count: int
    hearts_lost: int


class LessonCompleteOut(BaseModel):
    xp_earned: int
    new_xp_total: int
    new_level: int
    skill_completed: bool
    streak_count: int
    streak_extended: bool
    newly_unlocked_skill_ids: List[int]
    daily_goal_met: bool


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    display_name: str
    avatar_emoji: str
    xp_total: int
    is_me: bool


class HeartsRefillOut(BaseModel):
    hearts: int
    gems: int
