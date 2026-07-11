from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/lesson", tags=["lesson"])


@router.get("/start/{skill_id}", response_model=schemas.LessonStartOut)
def start_lesson(skill_id: int, db: Session = Depends(get_db)):
    user = crud.get_or_create_default_user(db)
    user = crud.regenerate_hearts(db, user)
    if user.hearts <= 0:
        raise HTTPException(status_code=400, detail="Out of hearts")
    lesson = crud.start_lesson(db, user, skill_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Skill not found")
    return lesson


@router.post("/answer", response_model=schemas.AnswerOut)
def answer(payload: schemas.AnswerIn, db: Session = Depends(get_db)):
    user = crud.get_or_create_default_user(db)
    result = crud.check_answer(db, user, payload.exercise_id, payload.answer)
    if result is None:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return result


@router.post("/complete", response_model=schemas.LessonCompleteOut)
def complete(payload: schemas.LessonCompleteIn, db: Session = Depends(get_db)):
    user = crud.get_or_create_default_user(db)
    return crud.complete_lesson(
        db, user, payload.skill_id, payload.correct_count,
        payload.wrong_count, payload.hearts_lost,
    )
