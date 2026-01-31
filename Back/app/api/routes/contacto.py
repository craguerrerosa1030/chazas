"""
Rutas para el formulario de contacto.
Permite a los usuarios enviar mensajes sin necesidad de autenticacion.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.contacto import MensajeContacto
from app.schemas.contacto import MensajeContactoCreate, MensajeContactoSimple
from app.services.email_service import EmailService

router = APIRouter(prefix="/contacto", tags=["Contacto"])


@router.post("/", response_model=MensajeContactoSimple, status_code=201)
def enviar_mensaje(
    datos: MensajeContactoCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Envia un mensaje a traves del formulario de contacto.
    No requiere autenticacion.
    Envia notificacion por email al administrador.
    """
    nuevo_mensaje = MensajeContacto(
        email=datos.email,
        nombre=datos.nombre,
        asunto=datos.asunto,
        mensaje=datos.mensaje
    )

    db.add(nuevo_mensaje)
    db.commit()
    db.refresh(nuevo_mensaje)

    # Enviar notificacion por email en segundo plano
    background_tasks.add_task(
        EmailService.send_contact_notification,
        nombre=datos.nombre,
        email_remitente=datos.email,
        asunto=datos.asunto,
        mensaje=datos.mensaje
    )

    return MensajeContactoSimple(
        mensaje="Tu mensaje ha sido enviado correctamente. Te responderemos pronto.",
        id=nuevo_mensaje.id
    )
