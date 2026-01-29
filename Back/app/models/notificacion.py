from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.session import Base


class TipoNotificacion(str, enum.Enum):
    # Notificaciones para chazeros
    NUEVA_POSTULACION = "nueva_postulacion"
    POSTULACION_CANCELADA = "postulacion_cancelada"

    # Notificaciones para estudiantes
    POSTULACION_ACEPTADA = "postulacion_aceptada"
    POSTULACION_RECHAZADA = "postulacion_rechazada"

    # Notificaciones generales
    MENSAJE_NUEVO = "mensaje_nuevo"
    SISTEMA = "sistema"


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)

    # Usuario que recibe la notificacion
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    usuario = relationship("User", back_populates="notificaciones")

    # Tipo de notificacion
    tipo = Column(Enum(TipoNotificacion), nullable=False)

    # Contenido
    titulo = Column(String(200), nullable=False)
    mensaje = Column(Text, nullable=False)

    # Estado
    leida = Column(Boolean, default=False)

    # Referencias opcionales (para navegar al contenido relacionado)
    chaza_id = Column(Integer, ForeignKey("chazas.id"), nullable=True)
    # postulacion_id se omite temporalmente - agregar manualmente a la DB si se necesita

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)

    # Relaciones opcionales
    chaza = relationship("Chaza", backref="notificaciones_relacionadas")

    def marcar_como_leida(self):
        self.leida = True
        self.read_at = datetime.utcnow()