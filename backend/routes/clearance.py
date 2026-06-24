from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.clearance import ClearanceRequest, DepartmentApproval
from models.department import Department
from schemas.clearance import ClearanceAction, ClearanceRequestResponse
from services.workflow_engine import WorkflowEngine
from routes.auth import get_current_user
from models.user import User

router = APIRouter()

def serialize_request(req: ClearanceRequest):
    return {
        "id": req.id,
        "student_id": req.student_id,
        "status": req.status,
        "created_at": req.created_at,
        "approvals": [
            {
                "id": approval.id,
                "department_id": approval.department_id,
                "department_name": approval.department.name if approval.department else None,
                "status": approval.status,
                "remarks": approval.remarks,
            }
            for approval in req.approvals
        ],
    }

@router.post("/apply", response_model=ClearanceRequestResponse)
def apply_clearance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Only students can apply")
    
    req = WorkflowEngine.apply_for_clearance(db, current_user.id)
    return serialize_request(req)

@router.get("/status", response_model=ClearanceRequestResponse)
def get_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Only students can view their status")
    
    req = db.query(ClearanceRequest).filter(ClearanceRequest.student_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Clearance request not found")

    return serialize_request(req)

@router.get("/status/{request_id}", response_model=ClearanceRequestResponse)
def get_status_by_id(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Clearance request not found")

    if current_user.role == "STUDENT" and req.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return serialize_request(req)

@router.get("/assigned")
def get_assigned_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "DEPARTMENT":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(DepartmentApproval, ClearanceRequest, User).join(
        ClearanceRequest, DepartmentApproval.request_id == ClearanceRequest.id
    ).join(
        User, ClearanceRequest.student_id == User.id
    )

    if current_user.department_id:
        query = query.filter(DepartmentApproval.department_id == current_user.department_id)

    approvals = query.order_by(ClearanceRequest.created_at.desc()).all()
    
    res = []
    for app, req, user in approvals:
        dept = db.query(Department).filter(Department.id == app.department_id).first()
        res.append({
            "approval_id": app.id,
            "request_id": req.id,
            "student_name": user.name,
            "department_id": app.department_id,
            "department_name": dept.name if dept else "",
            "status": app.status,
            "remarks": app.remarks
        })
    return res

@router.post("/{request_id}/action/{department_id}")
def take_action(request_id: int, department_id: int, action: ClearanceAction, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "DEPARTMENT":
        raise HTTPException(status_code=403, detail="Not authorized")

    if current_user.department_id and current_user.department_id != department_id:
        raise HTTPException(status_code=403, detail="Department users can only update their assigned department")

    try:
        res = WorkflowEngine.update_department_status(db, request_id, department_id, action.status, action.remarks, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not res:
        raise HTTPException(status_code=404, detail="Approval record not found")
    return {"message": "Action recorded"}

@router.post("/{request_id}/action")
def take_action_for_assigned_department(request_id: int, action: ClearanceAction, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "DEPARTMENT" or not current_user.department_id:
        raise HTTPException(status_code=403, detail="Department assignment required")

    return take_action(request_id, current_user.department_id, action, db, current_user)
