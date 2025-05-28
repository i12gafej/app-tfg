from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import Optional
import os
from dotenv import load_dotenv
from app.schemas.email import ContactFormData
from app.config import settings
import logging

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Patrimonio 2030"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

async def send_contact_info_to_server(data: ContactFormData):
    """
    Envía la información de contacto al servidor de correo.
    """
    try:
        message = MessageSchema(
            subject=f"Nuevo mensaje de contacto: {data.subject}",
            recipients=[settings.CONTACT_EMAIL],
            body=f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <p><strong>Nombre:</strong> {data.name}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Asunto:</strong> {data.subject}</p>
                    <p><strong>Mensaje:</strong></p>
                    <p style="white-space: pre-line;">{data.message}</p>
                </body>
            </html>
            """,
            subtype="html"
        )
        
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logging.error(f"Error al enviar el correo: {str(e)}")
        raise e

async def send_change_password_verification_mail(email: str, token: str):
    try:
        reset_link = f"{settings.FRONTEND_URL}/restaurar-contrasena?token={token}"
        message = MessageSchema(
            subject="Cambio de contraseña",
            recipients=[email],
            body=f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <p>Hola,</p>
                    <p>Has solicitado cambiar tu contraseña. Haz clic en el siguiente enlace para proceder:</p>
                    <p><a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Cambiar contraseña</a></p>
                    <p>Este enlace expirará en 30 minutos.</p>
                    <p>Si no has solicitado este cambio, puedes ignorar este correo.</p>
                    <p>Saludos,<br>El equipo de Patrimonio 2030 App</p>
                </body>
            </html>
            """,
            subtype="html"
        )
        
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logging.error(f"Error al enviar el correo de verificación: {str(e)}")
        logging.error(f"Token: {token}")
        raise e 