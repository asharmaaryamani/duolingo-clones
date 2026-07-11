from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["path"])


@router.get("/path", response_model=schemas.PathOut)
def get_path(db: Session = Depends(get_db)):
    user = crud.get_or_create_default_user(db)
    return crud.build_path(db, user)
