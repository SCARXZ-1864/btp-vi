from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.core.database import engine, Base
from backend.core.database import SessionLocal, get_db
from backend.core.security import get_password_hash
import backend.models  # noqa: F401
from backend.models.user import User
from backend.routes import auth, clearance, department, certificate
from backend.services.certificate_service import CertificateService

# Create DB tables
Base.metadata.create_all(bind=engine)

def create_default_admin():
    if not settings.DEFAULT_ADMIN_EMAIL or not settings.DEFAULT_ADMIN_PASSWORD:
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if existing:
            return
        db.add(User(
            name=settings.DEFAULT_ADMIN_NAME,
            email=settings.DEFAULT_ADMIN_EMAIL,
            password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
            role="ADMIN",
        ))
        db.commit()
    finally:
        db.close()

create_default_admin()

app = FastAPI(title="Digital No-Dues Clearance System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(department.router, prefix="/department", tags=["Department"])
app.include_router(clearance.router, prefix="/clearance", tags=["Clearance"])
app.include_router(certificate.router, prefix="/certificate", tags=["Certificate"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Digital No-Dues Clearance System"}

@app.get("/verify/{certificate_id}")
def verify_certificate(certificate_id: str, db: Session = Depends(get_db)):
    return CertificateService.verify_certificate(db, certificate_id)
