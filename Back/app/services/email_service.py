"""
Servicio de Email para envío de códigos de verificación.
Usa SMTP para enviar emails con códigos de 6 dígitos.
"""
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.models.verification_code import VerificationCode


class EmailService:
    """
    Servicio para envío de emails y gestión de códigos de verificación.
    """

    @staticmethod
    def generate_verification_code() -> str:
        """Genera un código de 6 dígitos aleatorio."""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def create_verification_code(db: Session, user_id: int, email: str) -> str:
        """
        Crea un nuevo código de verificación para un usuario.
        Invalida códigos anteriores no usados del mismo usuario.

        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
            email: Email al que se enviará el código

        Returns:
            El código de 6 dígitos generado
        """
        # Invalidar códigos anteriores no usados
        db.query(VerificationCode).filter(
            VerificationCode.user_id == user_id,
            VerificationCode.is_used == False
        ).delete()

        # Generar nuevo código
        code = EmailService.generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES
        )

        # Crear registro en BD
        verification = VerificationCode(
            user_id=user_id,
            code=code,
            email=email,
            expires_at=expires_at
        )

        db.add(verification)
        db.commit()

        return code

    @staticmethod
    def verify_code(db: Session, user_id: int, code: str) -> bool:
        """
        Verifica si un código es válido para un usuario.

        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
            code: Código de 6 dígitos a verificar

        Returns:
            True si el código es válido, False si no
        """
        verification = db.query(VerificationCode).filter(
            VerificationCode.user_id == user_id,
            VerificationCode.code == code,
            VerificationCode.is_used == False,
            VerificationCode.expires_at > datetime.now(timezone.utc)
        ).first()

        if verification:
            verification.is_used = True
            db.commit()
            return True

        return False

    @staticmethod
    def send_verification_email(to_email: str, code: str, user_name: str) -> bool:
        """
        Envía email con código de verificación.

        Args:
            to_email: Email del destinatario
            code: Código de 6 dígitos
            user_name: Nombre del usuario

        Returns:
            True si se envió correctamente, False si hubo error
        """
        # Verificar que SMTP está configurado
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            print(">> SMTP no configurado. Código de verificación:", code)
            return True  # En desarrollo, simular éxito

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'Verifica tu cuenta en Chazas - Código: {code}'
            msg['From'] = f'{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>'
            msg['To'] = to_email

            html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Chazas</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Conectando estudiantes con oportunidades</p>
                </div>

                <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #333; margin-top: 0;">¡Hola {user_name}!</h2>

                    <p style="color: #555; line-height: 1.6;">
                        Gracias por registrarte en Chazas. Para completar tu registro y
                        verificar que eres estudiante, ingresa el siguiente código:
                    </p>

                    <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white;
                                font-size: 36px; padding: 25px; text-align: center;
                                letter-spacing: 12px; border-radius: 12px; font-weight: bold;
                                margin: 25px 0;">
                        {code}
                    </div>

                    <p style="color: #666; font-size: 14px; margin-top: 25px;">
                        ⏱️ Este código expira en <strong>{settings.VERIFICATION_CODE_EXPIRE_MINUTES} minutos</strong>.
                    </p>

                    <p style="color: #999; font-size: 13px; margin-top: 20px;">
                        Si no solicitaste este código, puedes ignorar este mensaje.
                    </p>
                </div>

                <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
                    <p style="margin: 0 0 10px 0;">
                        Chazas - Conectando estudiantes con oportunidades de trabajo
                    </p>
                    <p style="margin: 0; padding: 10px; background: #fff3cd; border-radius: 6px; color: #856404;">
                        <strong>Aviso:</strong> Chazas es un proyecto independiente.
                        NO es una plataforma oficial de ninguna universidad.
                    </p>
                </div>
            </body>
            </html>
            """

            msg.attach(MIMEText(html, 'html'))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

            print(f">> Email enviado a {to_email}")
            return True

        except Exception as e:
            print(f">> Error enviando email: {e}")
            return False

    @staticmethod
    def get_pending_verification(db: Session, user_id: int) -> Optional[VerificationCode]:
        """
        Obtiene el código de verificación pendiente de un usuario.
        """
        return db.query(VerificationCode).filter(
            VerificationCode.user_id == user_id,
            VerificationCode.is_used == False,
            VerificationCode.expires_at > datetime.now(timezone.utc)
        ).first()

    @staticmethod
    def send_contact_notification(
        nombre: str,
        email_remitente: str,
        asunto: str,
        mensaje: str,
        admin_email: str = "craguerrerosa@gmail.com"
    ) -> bool:
        """
        Envía notificación al administrador cuando alguien usa el formulario de contacto.
        """
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            print(f">> SMTP no configurado. Mensaje de contacto de: {email_remitente}")
            return True

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'[Chazas Contacto] {asunto}'
            msg['From'] = f'{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>'
            msg['To'] = admin_email
            msg['Reply-To'] = email_remitente

            html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo mensaje de contacto</h1>
                </div>

                <div style="padding: 25px; background: #f9f9f9; border-radius: 0 0 12px 12px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">De:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{nombre or 'No especificado'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <a href="mailto:{email_remitente}" style="color: #3498db;">{email_remitente}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Asunto:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{asunto}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px;">
                        <h3 style="color: #333; margin-bottom: 10px;">Mensaje:</h3>
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                            <p style="margin: 0; white-space: pre-wrap; color: #555;">{mensaje}</p>
                        </div>
                    </div>

                    <p style="margin-top: 20px; padding: 10px; background: #e8f4fd; border-radius: 6px; font-size: 13px; color: #2980b9;">
                        Puedes responder directamente a este email - la respuesta llegara a {email_remitente}
                    </p>
                </div>
            </body>
            </html>
            """

            msg.attach(MIMEText(html, 'html'))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, admin_email, msg.as_string())

            print(f">> Notificacion de contacto enviada a {admin_email}")
            return True

        except Exception as e:
            print(f">> Error enviando notificacion de contacto: {e}")
            return False
