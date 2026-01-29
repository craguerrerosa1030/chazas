"""
Modelo de Solicitud de trabajo.
Representa una solicitud de un estudiante para trabajar en una chaza.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.session import Base


class EstadoSolicitud(str, enum.Enum):
    PENDIENTE = "pendiente"
    ACEPTADA = "aceptada"
    RECHAZADA = "rechazada"
    CANCELADA = "cancelada"


class Solicitud(Base):
    """
    Modelo de Solicitud.
    Un estudiante envía una solicitud a una chaza con los horarios que puede trabajar.
    """
    __tablename__ = "solicitudes"

    id = Column(Integer, primary_key=True, index=True)

    # Estudiante que envía la solicitud
    estudiante_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    estudiante = relationship("User", foreign_keys=[estudiante_id], backref="solicitudes_enviadas")

    # Chaza a la que se postula
    chaza_id = Column(Integer, ForeignKey("chazas.id"), nullable=False)
    chaza = relationship("Chaza", backref="solicitudes_recibidas")

    # Horarios seleccionados (formato JSON: ["0-8", "0-9", "1-10", ...])
    # Donde el primer número es el día (0=Lunes) y el segundo es la hora
    horarios_seleccionados = Column(JSON, nullable=False)

    # Mensaje opcional del estudiante
    mensaje = Column(Text, nullable=True)

    # Estado de la solicitud
    estado = Column(Enum(EstadoSolicitud), default=EstadoSolicitud.PENDIENTE)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Respuesta del chazero (opcional)
    respuesta = Column(Text, nullable=True)
    respondido_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Solicitud(id={self.id}, estudiante={self.estudiante_id}, chaza={self.chaza_id}, estado={self.estado})>"
