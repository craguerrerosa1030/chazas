"""
Schemas para Solicitudes de trabajo.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EstadoSolicitudEnum(str, Enum):
    PENDIENTE = "pendiente"
    ACEPTADA = "aceptada"
    RECHAZADA = "rechazada"
    CANCELADA = "cancelada"


class SolicitudCreate(BaseModel):
    """Schema para crear una solicitud"""
    chaza_id: int
    horarios_seleccionados: List[str] = Field(
        ...,
        description="Lista de horarios en formato 'dia-hora', ej: ['0-8', '0-9', '1-10']"
    )
    mensaje: Optional[str] = Field(None, max_length=500)


class SolicitudResponse(BaseModel):
    """Schema para responder con datos de solicitud"""
    id: int
    estudiante_id: int
    chaza_id: int
    horarios_seleccionados: List[str]
    mensaje: Optional[str]
    estado: EstadoSolicitudEnum
    created_at: datetime
    updated_at: datetime
    respuesta: Optional[str]
    respondido_at: Optional[datetime]

    # Datos adicionales para mostrar
    estudiante_nombre: Optional[str] = None
    estudiante_email: Optional[str] = None
    chaza_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class SolicitudConDetalles(SolicitudResponse):
    """Solicitud con información expandida del estudiante y chaza"""
    horarios_formateados: Optional[str] = None


class ResponderSolicitudRequest(BaseModel):
    """Schema para responder a una solicitud"""
    estado: EstadoSolicitudEnum = Field(
        ...,
        description="Nuevo estado: 'aceptada' o 'rechazada'"
    )
    respuesta: Optional[str] = Field(None, max_length=500)
