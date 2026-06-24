from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from core.database import get_db
from models.certificate import Certificate
from models.clearance import ClearanceRequest
from models.user import User
from services.certificate_service import CertificateService
from routes.auth import get_current_user

router = APIRouter()

@router.post("/generate/{request_id}")
def generate_certificate(request_id: int, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Only students can generate certificates")
        
    clearance = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
    if not clearance or clearance.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Clearance request not found")
        
    if clearance.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Clearance is not fully approved yet")
        
    cert = CertificateService.generate_certificate_record(db, request_id)
    if not cert:
        raise HTTPException(status_code=400, detail="Could not generate certificate")
        
    base_url = str(request.base_url).rstrip("/")
    pdf_buffer = CertificateService.generate_pdf(db, cert, base_url)
    
    return Response(content=pdf_buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=certificate_{cert.certificate_code}.pdf"})

@router.get("/{certificate_code}")
def get_certificate(certificate_code: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cert = db.query(Certificate).filter(Certificate.certificate_code == certificate_code).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if current_user.role == "STUDENT" and cert.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return cert
