from sqlalchemy import Column, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship
from backend.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # STUDENT, DEPARTMENT, ADMIN
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    mis_id = Column(String, nullable=True)
    cgpa = Column(Float, nullable=True)
    profile_picture_url = Column(String, nullable=True)

    department = relationship("Department", back_populates="users")
