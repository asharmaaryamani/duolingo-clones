from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["user"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(db: Session = Depends(get_db)):
    user = crud.get_or_create_default_user(db)
    user = crud.regenerate_hearts(db, user)
    out = schemas.UserOut.model_validate(user)
    out.today_xp = crud.today_xp(db, user)
    return out


@router.post("/hearts/refill", response_model=schemas.HeartsRefillOut)
def refill_hearts(db: Session = Depends(get_db)):
    user = crud.get_or_create_default_user(db)
    return crud.refill_hearts(db, user)


@router.post("/hearts/practice", response_model=schemas.HeartsRefillOut)
def practice_refill(db: Session = Depends(get_db)):
    """Mocked free 'practice' action that earns back one heart."""
    user = crud.get_or_create_default_user(db)
    return crud.practice_refill(db, user)
