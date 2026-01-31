from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime

from app.database.session import Base


class MensajeContacto(Base):
    """Modelo para mensajes del formulario de contacto."""
    __tablename__ = "mensajes_contacto"

    id = Column(Integer, primary_key=True, index=True)

    # Datos del remitente
    email = Column(String(255), nullable=False)
    nombre = Column(String(100), nullable=True)

    # Contenido del mensaje
    asunto = Column(String(200), nullable=False)
    mensaje = Column(Text, nullable=False)

    # Estado
    leido = Column(Boolean, default=False)
    respondido = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
