from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class ClearanceRequest(Base):
    __tablename__ = "clearance_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, QUERY
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User")
    approvals = relationship("DepartmentApproval", back_populates="request")

class DepartmentApproval(Base):
    __tablename__ = "department_approvals"
    __table_args__ = (UniqueConstraint("request_id", "department_id", name="uq_request_department"),)

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("clearance_requests.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, QUERY
    remarks = Column(String, nullable=True)

    request = relationship("ClearanceRequest", back_populates="approvals")
    department = relationship("Department")
