import datetime as dt
from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    avatar_emoji = Column(String, default="🦉")

    xp_total = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)

    hearts = Column(Integer, default=5)
    max_hearts = Column(Integer, default=5)
    last_heart_lost_at = Column(DateTime, nullable=True)

    gems = Column(Integer, default=500)
    daily_goal_xp = Column(Integer, default=30)

    created_at = Column(DateTime, default=dt.datetime.utcnow)

    skill_progress = relationship("UserSkillProgress", back_populates="user")
    daily_activity = relationship("DailyActivity", back_populates="user")
    lesson_attempts = relationship("LessonAttempt", back_populates="user")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    flag_emoji = Column(String, default="🇪🇸")
    from_language = Column(String, default="English")
    to_language = Column(String, default="Spanish")

    units = relationship("Unit", back_populates="course", order_by="Unit.order_index")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    color_hex = Column(String, default="#58cc02")

    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit", order_by="Skill.order_index")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    icon_emoji = Column(String, default="⭐")
    max_level = Column(Integer, default=3)  # crowns

    unit = relationship("Unit", back_populates="skills")
    exercises = relationship("Exercise", back_populates="skill", order_by="Exercise.order_index")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  # multiple_choice | translate | match | fill_blank | type_answer
    prompt = Column(String, nullable=False)
    options_json = Column(Text, nullable=True)       # JSON encoded list/dict
    correct_answer_json = Column(Text, nullable=False)  # JSON encoded (str | list | dict)
    word_bank_json = Column(Text, nullable=True)     # JSON encoded list (for translate/fill_blank)

    skill = relationship("Skill", back_populates="exercises")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    level = Column(Integer, default=0)      # crowns earned
    status = Column(String, default="locked")  # locked | available | completed
    xp_earned = Column(Integer, default=0)

    user = relationship("User", back_populates="skill_progress")
    skill = relationship("Skill")


class DailyActivity(Base):
    __tablename__ = "daily_activity"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    xp_earned = Column(Integer, default=0)
    goal_met = Column(Boolean, default=False)

    user = relationship("User", back_populates="daily_activity")


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    started_at = Column(DateTime, default=dt.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    hearts_lost = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    passed = Column(Boolean, default=False)

    user = relationship("User", back_populates="lesson_attempts")
    skill = relationship("Skill")
