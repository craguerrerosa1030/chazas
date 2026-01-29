from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TipoNotificacionEnum(str, Enum):
    NUEVA_POSTULACION = "nueva_postulacion"
    POSTULACION_CANCELADA = "postulacion_cancelada"
    POSTULACION_ACEPTADA = "postulacion_aceptada"
    POSTULACION_RECHAZADA = "postulacion_rechazada"
    MENSAJE_NUEVO = "mensaje_nuevo"
    SISTEMA = "sistema"


class NotificacionBase(BaseModel):
    tipo: TipoNotificacionEnum
    titulo: str
    mensaje: str
    chaza_id: Optional[int] = None
    postulacion_id: Optional[int] = None


class NotificacionCreate(NotificacionBase):
    usuario_id: int


class NotificacionResponse(NotificacionBase):
    id: int
    usuario_id: int
    leida: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificacionResumen(BaseModel):
    """Resumen de notificaciones para el badge del header"""
    total_sin_leer: int
    notificaciones_recientes: list[NotificacionResponse]


class MarcarLeidaRequest(BaseModel):
    notificacion_ids: list[int]