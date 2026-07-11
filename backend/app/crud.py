import json
import unicodedata
import datetime as dt
from sqlalchemy.orm import Session
from . import models


def _strip_accents(text: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )

DEFAULT_USERNAME = "learner1"
HEART_REGEN_MINUTES = 30  # 1 heart every 30 min (demo-friendly interval)
XP_PER_CORRECT = 10
XP_LESSON_COMPLETE_BONUS = 15


def get_or_create_default_user(db: Session) -> models.User:
    user = db.query(models.User).filter_by(username=DEFAULT_USERNAME).first()

    # Existing user -> force demo mode values
    if user:
        user.hearts = 999
        user.max_hearts = 999
        db.commit()
        db.refresh(user)
        return user

    # Create demo user
    user = models.User(
        username=DEFAULT_USERNAME,
        display_name="Alex",
        avatar_emoji="🦉",
        xp_total=0,
        streak_count=0,
        hearts=999,
        max_hearts=999,
        gems=500,
        daily_goal_xp=30,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def regenerate_hearts(db: Session, user: models.User) -> models.User:
    """Passive heart regeneration over time."""
    if user.hearts >= user.max_hearts or user.last_heart_lost_at is None:
        return user
    elapsed = dt.datetime.utcnow() - user.last_heart_lost_at
    regained = int(elapsed.total_seconds() // (HEART_REGEN_MINUTES * 60))
    if regained > 0:
        user.hearts = min(user.max_hearts, user.hearts + regained)
        if user.hearts >= user.max_hearts:
            user.last_heart_lost_at = None
        else:
            # keep remainder time so regen continues smoothly
            user.last_heart_lost_at = user.last_heart_lost_at + dt.timedelta(
                minutes=HEART_REGEN_MINUTES * regained
            )
        db.commit()
        db.refresh(user)
    return user


def today_xp(db: Session, user: models.User) -> int:
    today = dt.date.today()
    row = db.query(models.DailyActivity).filter_by(user_id=user.id, date=today).first()
    return row.xp_earned if row else 0


def ensure_progress_rows(db: Session, user: models.User):
    """Create UserSkillProgress rows for any skill that doesn't have one yet,
    and compute lock/unlock state based on ordering."""
    units = db.query(models.Unit).order_by(models.Unit.order_index).all()
    prev_skill_completed = True  # first skill of first unit is always unlocked
    for unit in units:
        for skill in sorted(unit.skills, key=lambda s: s.order_index):
            progress = db.query(models.UserSkillProgress).filter_by(
                user_id=user.id, skill_id=skill.id
            ).first()
            if not progress:
                status = "available" if prev_skill_completed else "locked"
                progress = models.UserSkillProgress(
                    user_id=user.id, skill_id=skill.id, level=0, status=status
                )
                db.add(progress)
                db.commit()
                db.refresh(progress)
            else:
                # unlock it now if it was locked but predecessor is now done
                if progress.status == "locked" and prev_skill_completed:
                    progress.status = "available"
                    db.commit()
            prev_skill_completed = progress.level >= 1
    db.commit()


def build_path(db: Session, user: models.User):
    ensure_progress_rows(db, user)
    course = db.query(models.Course).first()
    units_out = []
    for unit in sorted(course.units, key=lambda u: u.order_index):
        skills_out = []
        for skill in sorted(unit.skills, key=lambda s: s.order_index):
            progress = db.query(models.UserSkillProgress).filter_by(
                user_id=user.id, skill_id=skill.id
            ).first()
            status = progress.status if progress else "locked"
            level = progress.level if progress else 0
            if level >= skill.max_level:
                status = "completed"
            skills_out.append({
                "id": skill.id,
                "title": skill.title,
                "icon_emoji": skill.icon_emoji,
                "order_index": skill.order_index,
                "max_level": skill.max_level,
                "level": level,
                "status": status,
            })
        units_out.append({
            "id": unit.id,
            "title": unit.title,
            "description": unit.description,
            "color_hex": unit.color_hex,
            "order_index": unit.order_index,
            "skills": skills_out,
        })
    return {"course_title": course.title, "flag_emoji": course.flag_emoji, "units": units_out}


def start_lesson(db: Session, user: models.User, skill_id: int):
    skill = db.query(models.Skill).filter_by(id=skill_id).first()
    if not skill:
        return None
    exercises = sorted(skill.exercises, key=lambda e: e.order_index)
    public = []
    for ex in exercises:
        public.append({
            "id": ex.id,
            "type": ex.type,
            "prompt": ex.prompt,
            "options": json.loads(ex.options_json) if ex.options_json else None,
            "word_bank": json.loads(ex.word_bank_json) if ex.word_bank_json else None,
        })
    return {
        "skill_id": skill.id,
        "skill_title": skill.title,
        "exercises": public,
        "hearts": user.hearts,
    }


def _normalize(value):
    if isinstance(value, str):
        return _strip_accents(value.strip().lower())
    if isinstance(value, list):
        return [_normalize(v) for v in value]
    if isinstance(value, dict):
        return {str(k).lower(): _normalize(v) for k, v in value.items()}
    return value


def check_answer(db: Session, user: models.User, exercise_id: int, answer):
    ex = db.query(models.Exercise).filter_by(id=exercise_id).first()
    if not ex:
        return None
    correct_answer = json.loads(ex.correct_answer_json)
    is_correct = _normalize(answer) == _normalize(correct_answer)

    if not is_correct:
       if user.hearts > 0:
        user.hearts -= 1
        if user.last_heart_lost_at is None:
            user.last_heart_lost_at = dt.datetime.utcnow()
        db.commit()
        db.refresh(user)

    return {
        "correct": is_correct,
        "correct_answer": correct_answer,
        "hearts": user.hearts,
        "out_of_hearts": user.hearts <= 0,
    }


def complete_lesson(db: Session, user: models.User, skill_id: int, correct_count: int,
                     wrong_count: int, hearts_lost: int):
    skill = db.query(models.Skill).filter_by(id=skill_id).first()
    progress = db.query(models.UserSkillProgress).filter_by(
        user_id=user.id, skill_id=skill_id
    ).first()

    xp_earned = correct_count * XP_PER_CORRECT
    passed = correct_count > 0 and wrong_count <= max(2, correct_count)  # lenient pass bar
    if passed:
        xp_earned += XP_LESSON_COMPLETE_BONUS

    attempt = models.LessonAttempt(
        user_id=user.id, skill_id=skill_id, completed_at=dt.datetime.utcnow(),
        correct_count=correct_count, wrong_count=wrong_count,
        hearts_lost=hearts_lost, xp_earned=xp_earned, passed=passed,
    )
    db.add(attempt)

    skill_completed = False
    if passed and progress:
        progress.level = min(skill.max_level, progress.level + 1)
        progress.xp_earned += xp_earned
        if progress.level >= skill.max_level:
            progress.status = "completed"
        skill_completed = progress.level >= skill.max_level

    # --- streak logic ---
    today = dt.date.today()
    streak_extended = False
    if user.last_activity_date != today:
        if user.last_activity_date == today - dt.timedelta(days=1):
            user.streak_count += 1
            streak_extended = True
        elif user.last_activity_date is None:
            user.streak_count = 1
            streak_extended = True
        else:
            user.streak_count = 1
            streak_extended = True
        user.last_activity_date = today

    user.xp_total += xp_earned

    # --- daily activity / goal ---
    daily = db.query(models.DailyActivity).filter_by(user_id=user.id, date=today).first()
    if not daily:
        daily = models.DailyActivity(user_id=user.id, date=today, xp_earned=0)
        db.add(daily)
    daily.xp_earned += xp_earned
    daily.goal_met = daily.xp_earned >= user.daily_goal_xp

    db.commit()
    db.refresh(user)

    newly_unlocked = []
    if skill_completed:
        # unlock the very next skill in overall order
        all_skills = []
        for unit in sorted(skill.unit.course.units, key=lambda u: u.order_index):
            for s in sorted(unit.skills, key=lambda s: s.order_index):
                all_skills.append(s)
        idx = next((i for i, s in enumerate(all_skills) if s.id == skill.id), None)
        if idx is not None and idx + 1 < len(all_skills):
            nxt = all_skills[idx + 1]
            nxt_progress = db.query(models.UserSkillProgress).filter_by(
                user_id=user.id, skill_id=nxt.id
            ).first()
            if not nxt_progress:
                nxt_progress = models.UserSkillProgress(
                    user_id=user.id, skill_id=nxt.id, level=0, status="available"
                )
                db.add(nxt_progress)
                newly_unlocked.append(nxt.id)
            elif nxt_progress.status == "locked":
                nxt_progress.status = "available"
                newly_unlocked.append(nxt.id)
            db.commit()

    return {
        "xp_earned": xp_earned,
        "new_xp_total": user.xp_total,
        "new_level": progress.level if progress else 0,
        "skill_completed": skill_completed,
        "streak_count": user.streak_count,
        "streak_extended": streak_extended,
        "newly_unlocked_skill_ids": newly_unlocked,
        "daily_goal_met": daily.goal_met,
    }


def refill_hearts(db: Session, user: models.User, gem_cost: int = 350):
    if user.hearts >= user.max_hearts:
        return {"hearts": user.hearts, "gems": user.gems}
    if user.gems >= gem_cost:
        user.gems -= gem_cost
    user.hearts = user.max_hearts
    user.last_heart_lost_at = None
    db.commit()
    db.refresh(user)
    return {"hearts": user.hearts, "gems": user.gems}


def practice_refill(db: Session, user: models.User):
    """Mocked free heart refill, framed as 'practice to earn a heart back'."""
    user.hearts = min(user.max_hearts, user.hearts + 1) if user.hearts > 0 else 1
    if user.hearts >= user.max_hearts:
        user.last_heart_lost_at = None
    db.commit()
    db.refresh(user)
    return {"hearts": user.hearts, "gems": user.gems}


def leaderboard(db: Session, user: models.User):
    users = db.query(models.User).order_by(models.User.xp_total.desc()).all()
    out = []
    for i, u in enumerate(users):
        out.append({
            "rank": i + 1,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_emoji": u.avatar_emoji,
            "xp_total": u.xp_total,
            "is_me": u.id == user.id,
        })
    return out
