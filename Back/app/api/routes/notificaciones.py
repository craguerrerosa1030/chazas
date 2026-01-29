from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.services.notificacion_service import NotificacionService
from app.api.deps import get_current_user
from app.schemas.notificacion import (
    NotificacionResponse,
    NotificacionResumen,
    MarcarLeidaRequest
)
from app.models.user import User

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("/", response_model=List[NotificacionResponse])
def obtener_notificaciones(
    solo_sin_leer: bool = False,
    limite: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene las notificaciones del usuario autenticado"""
    return NotificacionService.obtener_notificaciones_usuario(
        db=db,
        usuario_id=current_user.id,
        solo_sin_leer=solo_sin_leer,
        limite=limite
    )


@router.get("/resumen", response_model=NotificacionResumen)
def obtener_resumen(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene el resumen de notificaciones (para el badge del header)"""
    total_sin_leer = NotificacionService.contar_sin_leer(db, current_user.id)
    recientes = NotificacionService.obtener_notificaciones_usuario(
        db=db,
        usuario_id=current_user.id,
        solo_sin_leer=False,
        limite=5
    )

    return NotificacionResumen(
        total_sin_leer=total_sin_leer,
        notificaciones_recientes=recientes
    )


@router.get("/sin-leer/count")
def contar_sin_leer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene solo el conteo de notificaciones sin leer"""
    count = NotificacionService.contar_sin_leer(db, current_user.id)
    return {"count": count}


@router.put("/{notificacion_id}/leer", response_model=NotificacionResponse)
def marcar_como_leida(
    notificacion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca una notificacion como leida"""
    notificacion = NotificacionService.marcar_como_leida(
        db=db,
        notificacion_id=notificacion_id,
        usuario_id=current_user.id
    )

    if not notificacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificacion no encontrada"
        )

    return notificacion


@router.put("/leer-todas")
def marcar_todas_como_leidas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca todas las notificaciones como leidas"""
    cantidad = NotificacionService.marcar_todas_como_leidas(db, current_user.id)
    return {"mensaje": f"{cantidad} notificaciones marcadas como leidas"}


@router.put("/leer-varias")
def marcar_varias_como_leidas(
    request: MarcarLeidaRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca varias notificaciones como leidas"""
    cantidad = NotificacionService.marcar_varias_como_leidas(
        db=db,
        notificacion_ids=request.notificacion_ids,
        usuario_id=current_user.id
    )
    return {"mensaje": f"{cantidad} notificaciones marcadas como leidas"}


@router.delete("/{notificacion_id}")
def eliminar_notificacion(
    notificacion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina una notificacion"""
    eliminada = NotificacionService.eliminar_notificacion(
        db=db,
        notificacion_id=notificacion_id,
        usuario_id=current_user.id
    )

    if not eliminada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificacion no encontrada"
        )

    return {"mensaje": "Notificacion eliminada"}