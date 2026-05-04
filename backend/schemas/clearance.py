from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime

class DepartmentApprovalResponse(BaseModel):
    id: int
    department_id: int
    department_name: Optional[str] = None
    status: str
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class ClearanceRequestResponse(BaseModel):
    id: int
    student_id: int
    status: str
    created_at: datetime
    approvals: List[DepartmentApprovalResponse] = []

    class Config:
        from_attributes = True

class ClearanceAction(BaseModel):
    status: str # APPROVED, REJECTED, QUERY
    remarks: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        normalized = value.upper()
        allowed = {"APPROVED", "REJECTED", "QUERY", "PENDING"}
        if normalized not in allowed:
            raise ValueError("Status must be APPROVED, REJECTED, QUERY, or PENDING")
        return normalized
