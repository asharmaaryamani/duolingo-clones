"""
Seeds the SQLite DB with one Spanish course, 3 units x 3 skills, 5 exercises
per skill (one of each type), plus a default learner and a few leaderboard users.
Safe to re-run: it skips seeding if a course already exists.
"""
import json
import random
import datetime as dt
from .database import Base, engine, SessionLocal
from . import models

random.seed(42)

# unit_title -> (skill_title, icon, [(english, spanish), ...])
COURSE_DATA = [
    ("Basics", "#58cc02", [
        ("Greetings", "👋", [
            ("hello", "hola"), ("goodbye", "adiós"), ("please", "por favor"),
            ("thanks", "gracias"), ("yes", "sí"), ("no", "no"),
        ]),
        ("Pronouns", "🙋", [
            ("I", "yo"), ("you", "tú"), ("he", "él"), ("she", "ella"),
            ("we", "nosotros"), ("they", "ellos"),
        ]),
        ("Basics 2", "🔤", [
            ("water", "agua"), ("bread", "pan"), ("house", "casa"),
            ("man", "hombre"), ("woman", "mujer"), ("book", "libro"),
        ]),
    ]),
    ("Food", "#1cb0f6", [
        ("Fruits", "🍎", [
            ("apple", "manzana"), ("banana", "plátano"), ("orange", "naranja"),
            ("grape", "uva"), ("lemon", "limón"), ("strawberry", "fresa"),
        ]),
        ("Meals", "🍽️", [
            ("breakfast", "desayuno"), ("lunch", "almuerzo"), ("dinner", "cena"),
            ("soup", "sopa"), ("salad", "ensalada"), ("rice", "arroz"),
        ]),
        ("Drinks", "🥤", [
            ("coffee", "café"), ("juice", "jugo"), ("milk", "leche"),
            ("tea", "té"), ("beer", "cerveza"), ("wine", "vino"),
        ]),
    ]),
    ("Family & Animals", "#ff9600", [
        ("Family", "👪", [
            ("mother", "madre"), ("father", "padre"), ("brother", "hermano"),
            ("sister", "hermana"), ("son", "hijo"), ("daughter", "hija"),
        ]),
        ("Animals", "🐶", [
            ("dog", "perro"), ("cat", "gato"), ("bird", "pájaro"),
            ("horse", "caballo"), ("fish", "pez"), ("bear", "oso"),
        ]),
        ("Colors", "🎨", [
            ("red", "rojo"), ("blue", "azul"), ("green", "verde"),
            ("yellow", "amarillo"), ("black", "negro"), ("white", "blanco"),
        ]),
    ]),
]


def build_exercises_for_skill(word_pairs):
    """Given >=6 (en, es) pairs, generate one exercise of each of the 5 types."""
    exercises = []
    all_es = [es for _, es in word_pairs]

    # 1. Multiple choice
    en1, es1 = word_pairs[0]
    distractors = random.sample([w for w in all_es if w != es1], k=min(3, len(all_es) - 1))
    options = distractors + [es1]
    random.shuffle(options)
    exercises.append(dict(
        type="multiple_choice",
        prompt=f'Which word means "{en1}"?',
        options_json=json.dumps(options),
        correct_answer_json=json.dumps(es1),
        word_bank_json=None,
    ))

    # 2. Translate (tap-the-words / word bank)
    en2, es2 = word_pairs[1]
    en3, es3 = word_pairs[2]
    phrase_en = f"the {en2} and the {en3}"
    correct_tokens = ["el", es2, "y", "el", es3]
    distractor_tokens = random.sample(
        [w for w in all_es if w not in (es2, es3)], k=min(2, max(0, len(all_es) - 2))
    )
    bank = list(dict.fromkeys(correct_tokens + distractor_tokens))
    random.shuffle(bank)
    exercises.append(dict(
        type="translate",
        prompt=f'Translate: "{phrase_en}"',
        options_json=None,
        correct_answer_json=json.dumps(correct_tokens),
        word_bank_json=json.dumps(bank),
    ))

    # 3. Match pairs
    match_pairs = word_pairs[:4] if len(word_pairs) >= 4 else word_pairs
    exercises.append(dict(
        type="match",
        prompt="Match the pairs",
        options_json=json.dumps({en: es for en, es in match_pairs}),
        correct_answer_json=json.dumps({en: es for en, es in match_pairs}),
        word_bank_json=None,
    ))

    # 4. Fill in the blank
    en4, es4 = word_pairs[3] if len(word_pairs) > 3 else word_pairs[0]
    fill_options = random.sample(
        [w for w in all_es if w != es4], k=min(3, len(all_es) - 1)
    ) + [es4]
    random.shuffle(fill_options)
    exercises.append(dict(
        type="fill_blank",
        prompt=f'Complete the sentence: "___" means "{en4}" in Spanish.',
        options_json=json.dumps(fill_options),
        correct_answer_json=json.dumps(es4),
        word_bank_json=None,
    ))

    # 5. Type the answer
    en5, es5 = word_pairs[4] if len(word_pairs) > 4 else word_pairs[0]
    exercises.append(dict(
        type="type_answer",
        prompt=f'Type in Spanish: "{en5}"',
        options_json=None,
        correct_answer_json=json.dumps(es5),
        word_bank_json=None,
    ))

    for i, ex in enumerate(exercises):
        ex["order_index"] = i
    return exercises


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Course).first():
            print("Course already seeded, skipping seed().")
            return

        course = models.Course(
            slug="spanish", title="Spanish", flag_emoji="🇪🇸",
            from_language="English", to_language="Spanish",
        )
        db.add(course)
        db.commit()
        db.refresh(course)

        for u_idx, (unit_title, color, skills) in enumerate(COURSE_DATA):
            unit = models.Unit(
                course_id=course.id, order_index=u_idx, title=unit_title,
                description=f"Learn {unit_title.lower()} in Spanish", color_hex=color,
            )
            db.add(unit)
            db.commit()
            db.refresh(unit)

            for s_idx, (skill_title, icon, word_pairs) in enumerate(skills):
                skill = models.Skill(
                    unit_id=unit.id, order_index=s_idx, title=skill_title,
                    icon_emoji=icon, max_level=3,
                )
                db.add(skill)
                db.commit()
                db.refresh(skill)

                for ex_data in build_exercises_for_skill(word_pairs):
                    db.add(models.Exercise(skill_id=skill.id, **ex_data))
                db.commit()

        # Default learner with a bit of seeded progress so the app is usable immediately
        learner = models.User(
            username="learner1", display_name="Alex", avatar_emoji="🦉",
            xp_total=45, streak_count=3,
            last_activity_date=dt.date.today() - dt.timedelta(days=1),
            hearts=5, max_hearts=5, gems=500, daily_goal_xp=30,
        )
        db.add(learner)
        db.commit()
        db.refresh(learner)

        first_unit = course.units[0]
        first_skill = sorted(first_unit.skills, key=lambda s: s.order_index)[0]
        second_skill = sorted(first_unit.skills, key=lambda s: s.order_index)[1]
        db.add(models.UserSkillProgress(
            user_id=learner.id, skill_id=first_skill.id, level=2, status="available"
        ))
        db.add(models.UserSkillProgress(
            user_id=learner.id, skill_id=second_skill.id, level=0, status="available"
        ))
        db.commit()

        # Seeded leaderboard rivals
        rivals = [
            ("maria_g", "Maria", "🐨", 210),
            ("kenji_s", "Kenji", "🐼", 175),
            ("liam_o", "Liam", "🦊", 140),
            ("sara_k", "Sara", "🐸", 90),
            ("noah_t", "Noah", "🐵", 60),
        ]
        for username, name, emoji, xp in rivals:
            db.add(models.User(
                username=username, display_name=name, avatar_emoji=emoji,
                xp_total=xp, streak_count=random.randint(1, 12),
                hearts=5, max_hearts=5, gems=random.randint(100, 800),
            ))
        db.commit()

        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
