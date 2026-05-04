import uuid
import qrcode
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from sqlalchemy.orm import Session
from models.certificate import Certificate
from models.clearance import ClearanceRequest, DepartmentApproval
from models.user import User

class CertificateService:
    @staticmethod
    def generate_certificate_record(db: Session, request_id: int):
        request = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
        if not request or request.status != "APPROVED":
            return None

        approvals = db.query(DepartmentApproval).filter(DepartmentApproval.request_id == request_id).all()
        if not approvals or any(approval.status != "APPROVED" for approval in approvals):
            return None
            
        # Check if already generated
        existing = db.query(Certificate).filter(Certificate.clearance_request_id == request_id).first()
        if existing:
            return existing

        cert_code = str(uuid.uuid4())
        cert = Certificate(
            student_id=request.student_id,
            clearance_request_id=request_id,
            certificate_code=cert_code
        )
        db.add(cert)
        db.commit()
        db.refresh(cert)
        return cert

    @staticmethod
    def generate_pdf(db: Session, cert: Certificate, verify_url_base: str):
        student = db.query(User).filter(User.id == cert.student_id).first()
        approvals = db.query(DepartmentApproval).filter(
            DepartmentApproval.request_id == cert.clearance_request_id
        ).all()
        
        # QR Code Generation
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(f"{verify_url_base}/verify/{cert.certificate_code}")
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code to bytes
        img_buffer = BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        # PDF Generation
        pdf_buffer = BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=letter)
        width, height = letter
        
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(width/2, height - 100, "NO-DUES CERTIFICATE")
        
        c.setFont("Helvetica", 14)
        c.drawString(100, height - 180, f"This is to certify that")
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, height - 210, f"{student.name} ({student.email})")
        c.setFont("Helvetica", 14)
        c.drawString(100, height - 240, "has successfully cleared all dues from all departments.")
        
        c.drawString(100, height - 300, f"Certificate ID: {cert.certificate_code}")
        c.drawString(100, height - 330, f"Issue Date: {cert.issue_date.strftime('%Y-%m-%d')}")

        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, height - 380, "Department Approval Summary")
        c.setFont("Helvetica", 12)
        y = height - 405
        for approval in approvals:
            department_name = approval.department.name if approval.department else f"Department {approval.department_id}"
            c.drawString(120, y, f"- {department_name}: {approval.status}")
            y -= 22
        
        # Draw QR Code
        from reportlab.lib.utils import ImageReader
        qr_img = ImageReader(img_buffer)
        c.drawImage(qr_img, width - 200, 100, width=150, height=150)
        
        c.save()
        pdf_buffer.seek(0)
        
        return pdf_buffer

    @staticmethod
    def verify_certificate(db: Session, certificate_code: str):
        cert = db.query(Certificate).filter(Certificate.certificate_code == certificate_code).first()
        if not cert:
            return {"status": "INVALID"}

        student = db.query(User).filter(User.id == cert.student_id).first()
        return {
            "status": "VALID",
            "student_name": student.name if student else None,
            "issue_date": cert.issue_date,
        }
