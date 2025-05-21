from fastapi import APIRouter, HTTPException, Depends
from app.services.email import send_contact_info_to_server, send_change_password_verification_mail
from app.schemas.email import ContactFormData
from app.crud import user as crud_user
from app.schemas.email import PasswordResetRequest
import logging
from app.api.deps import get_db
from sqlalchemy.orm import Session


router = APIRouter()

@router.post("/send/contact-information/")
async def send_contact_information(data: ContactFormData):
    try:
        await send_contact_info_to_server(data)
        return {"message": "Correo enviado exitosamente"}
    except Exception as e:
        logging.error(f"Error al enviar el correo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send/change-password-verification/")
async def send_change_password_verification(data: PasswordResetRequest, db: Session = Depends(get_db)):
    try:
        # Generar token y guardarlo en la base de datos
        user = crud_user.get_by_email(db, email=data.email)
        if not user:
            return {"message": ""}
        token = await crud_user.generate_change_password_token(db, data.email)
        if not token:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Enviar correo con el token
        await send_change_password_verification_mail(data.email, token)
        return {"message": "Correo de verificación enviado exitosamente"}
    except Exception as e:
        logging.error(f"Error al enviar el correo de verificación: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 