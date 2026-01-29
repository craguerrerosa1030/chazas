"""
Endpoints para solicitudes de trabajo.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.services.solicitud_service import SolicitudService
from app.api.deps import get_current_user, get_verified_estudiante
from app.schemas.solicitud import (
    SolicitudCreate,
    ResponderSolicitudRequest,
    EstadoSolicitudEnum
)
from app.models.user import User
from app.models.solicitud import EstadoSolicitud

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_solicitud(
    solicitud_data: SolicitudCreate,
    current_user: User = Depends(get_verified_estudiante),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva solicitud de trabajo.
    El estudiante envía su postulación a una chaza con los horarios disponibles.
    Requiere email verificado.
    """
    try:
        solicitud = SolicitudService.crear_solicitud(
            db=db,
            estudiante_id=current_user.id,
            chaza_id=solicitud_data.chaza_id,
            horarios_seleccionados=solicitud_data.horarios_seleccionados,
            mensaje=solicitud_data.mensaje
        )
        return {
            "mensaje": "Solicitud enviada exitosamente",
            "solicitud_id": solicitud.id
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/mis-solicitudes")
def obtener_mis_solicitudes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene las solicitudes enviadas por el estudiante actual.
    """
    solicitudes = SolicitudService.obtener_mis_solicitudes(
        db=db,
        estudiante_id=current_user.id
    )
    return solicitudes


@router.get("/chaza/{chaza_id}")
def obtener_solicitudes_chaza(
    chaza_id: int,
    estado: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene las solicitudes recibidas para una chaza.
    Solo el dueño de la chaza puede ver estas solicitudes.
    """
    try:
        estado_enum = None
        if estado:
            try:
                estado_enum = EstadoSolicitud(estado)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Estado inválido. Opciones: {[e.value for e in EstadoSolicitud]}"
                )

        solicitudes = SolicitudService.obtener_solicitudes_chaza(
            db=db,
            chaza_id=chaza_id,
            dueno_id=current_user.id,
            estado=estado_enum
        )
        return solicitudes
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.get("/{solicitud_id}")
def obtener_solicitud(
    solicitud_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles de una solicitud específica.
    Solo el estudiante que la envió o el dueño de la chaza pueden verla.
    """
    try:
        solicitud = SolicitudService.obtener_solicitud_por_id(
            db=db,
            solicitud_id=solicitud_id,
            usuario_id=current_user.id
        )
        if not solicitud:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solicitud no encontrada"
            )
        return solicitud
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.put("/{solicitud_id}/responder")
def responder_solicitud(
    solicitud_id: int,
    respuesta_data: ResponderSolicitudRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    El dueño de la chaza responde a una solicitud (aceptar/rechazar).
    """
    try:
        # Convertir el enum del schema al enum del modelo
        estado_modelo = EstadoSolicitud(respuesta_data.estado.value)

        if estado_modelo not in [EstadoSolicitud.ACEPTADA, EstadoSolicitud.RECHAZADA]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo puedes aceptar o rechazar solicitudes"
            )

        solicitud = SolicitudService.responder_solicitud(
            db=db,
            solicitud_id=solicitud_id,
            dueno_id=current_user.id,
            nuevo_estado=estado_modelo,
            respuesta=respuesta_data.respuesta
        )

        return {
            "mensaje": f"Solicitud {estado_modelo.value}",
            "solicitud_id": solicitud.id,
            "estado": solicitud.estado.value
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{solicitud_id}/cancelar")
def cancelar_solicitud(
    solicitud_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    El estudiante cancela su propia solicitud.
    """
    try:
        solicitud = SolicitudService.cancelar_solicitud(
            db=db,
            solicitud_id=solicitud_id,
            estudiante_id=current_user.id
        )
        return {
            "mensaje": "Solicitud cancelada",
            "solicitud_id": solicitud.id
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
