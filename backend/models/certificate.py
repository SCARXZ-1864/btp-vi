from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from core.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    clearance_request_id = Column(Integer, ForeignKey("clearance_requests.id"), unique=True)
    certificate_code = Column(String, unique=True, index=True) # UUID
    issue_date = Column(DateTime, default=datetime.utcnow)
