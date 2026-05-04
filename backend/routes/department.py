from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from models.clearance import ClearanceRequest, DepartmentApproval
from models.department import Department
from routes.auth import get_current_user
from models.user import User

router = APIRouter()

class DepartmentCreate(BaseModel):
    name: str

@router.post("/")
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    existing = db.query(Department).filter(Department.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    dept = Department(name=payload.name)
    db.add(dept)
    db.commit()
    db.refresh(dept)

    active_requests = db.query(ClearanceRequest).filter(ClearanceRequest.status.in_(["PENDING", "QUERY"])).all()
    for request in active_requests:
        db.add(DepartmentApproval(request_id=request.id, department_id=dept.id, status="PENDING"))
    db.commit()
    return dept

@router.get("/")
def get_departments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Department).all()
