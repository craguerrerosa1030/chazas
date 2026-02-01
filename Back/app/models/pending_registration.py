"""
Modelo para registros pendientes de verificacion.
Almacena los datos del usuario hasta que verifique su email.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.session import Base


class PendingRegistration(Base):
    """
    Almacena registros pendientes de verificacion.
    Una vez verificado el codigo, se crea el usuario real y se borra de aqui.
    """
    __tablename__ = "pending_registrations"

    id = Column(Integer, primary_key=True, index=True)

    # Datos del usuario
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    tipo_usuario = Column(String(20), nullable=False)
    universidad_id = Column(Integer, nullable=False)

    # Codigo de verificacion
    verification_code = Column(String(6), nullable=False)

    # Expiracion (15 minutos por defecto)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # Timestamp de creacion
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PendingRegistration(email='{self.email}', code='{self.verification_code}')>"
