"""
Modelo de Código de Verificación para la base de datos.
Almacena códigos de 6 dígitos para verificar emails de usuarios.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class VerificationCode(Base):
    """
    Modelo para almacenar códigos de verificación de email.
    Cada código tiene una expiración de 15 minutos por defecto.
    """
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)

    # Usuario al que pertenece el código
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Código de 6 dígitos
    code = Column(String(6), nullable=False)

    # Email al que se envió (por si cambia en el futuro)
    email = Column(String(255), nullable=False)

    # Estado del código
    is_used = Column(Boolean, default=False)

    # Expiración
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # Timestamp de creación
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relación con usuario
    user = relationship("User", backref="verification_codes")

    def __repr__(self):
        return f"<VerificationCode(user_id={self.user_id}, code='{self.code}', used={self.is_used})>"
