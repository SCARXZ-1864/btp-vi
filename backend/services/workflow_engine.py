from sqlalchemy.orm import Session
from backend.models.clearance import ClearanceRequest, DepartmentApproval
from backend.models.department import Department
from backend.models.audit import AuditLog

VALID_TRANSITIONS = {
    "PENDING": {"APPROVED", "REJECTED", "QUERY"},
    "QUERY": {"PENDING"},
    "APPROVED": set(),
    "REJECTED": set(),
}

class WorkflowEngine:
    @staticmethod
    def apply_for_clearance(db: Session, student_id: int):
        # Check if already applied
        existing = db.query(ClearanceRequest).filter(ClearanceRequest.student_id == student_id).first()
        if existing:
            return existing
        
        new_request = ClearanceRequest(student_id=student_id, status="PENDING")
        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        # Create department approvals
        departments = db.query(Department).all()
        for dept in departments:
            approval = DepartmentApproval(
                request_id=new_request.id,
                department_id=dept.id,
                status="PENDING"
            )
            db.add(approval)
        db.commit()
        
        return new_request

    @staticmethod
    def update_department_status(
        db: Session,
        request_id: int,
        department_id: int,
        status: str,
        remarks: str = None,
        actor_id: int = None,
    ):
        approval = db.query(DepartmentApproval).filter(
            DepartmentApproval.request_id == request_id,
            DepartmentApproval.department_id == department_id
        ).first()
        
        if not approval:
            return None

        next_status = status.upper()
        allowed = VALID_TRANSITIONS.get(approval.status, set())
        if next_status not in allowed:
            raise ValueError(f"Invalid transition from {approval.status} to {next_status}")

        approval.status = status
        approval.remarks = remarks
        db.add(AuditLog(
            actor_id=actor_id,
            action=f"DEPARTMENT_{next_status}",
            entity_type="department_approval",
            entity_id=approval.id,
            details=remarks,
        ))
        db.commit()

        # Check overall status
        WorkflowEngine.check_overall_status(db, request_id)
        
        return approval

    @staticmethod
    def check_overall_status(db: Session, request_id: int):
        request = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
        if not request:
            return
            
        approvals = db.query(DepartmentApproval).filter(DepartmentApproval.request_id == request_id).all()
        
        all_approved = True
        any_rejected = False
        any_query = False
        
        for app in approvals:
            if app.status == "REJECTED":
                any_rejected = True
            elif app.status == "QUERY":
                any_query = True
            elif app.status == "PENDING":
                all_approved = False
                
        if any_rejected:
            request.status = "REJECTED"
        elif any_query:
            request.status = "QUERY"
        elif approvals and all_approved:
            request.status = "APPROVED"
        else:
            request.status = "PENDING"
            
        db.commit()
