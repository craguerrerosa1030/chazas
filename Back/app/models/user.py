"""
Modelo de Usuario para la base de datos.
Define la tabla 'users' con SQLAlchemy.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class User(Base):
    """
    Modelo de Usuario.
    Representa tanto a estudiantes como a chazeros.
    Cada usuario pertenece a una universidad.
    """
    __tablename__ = "users"

    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)  # Contraseña hasheada
    tipo_usuario = Column(String(20), nullable=False)  # 'estudiante' o 'chazero'

    # Universidad a la que pertenece
    universidad_id = Column(Integer, ForeignKey("universidades.id"), nullable=False)

    # Estado de la cuenta
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Para futuro: verificación de email

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    universidad = relationship("Universidad", back_populates="usuarios")
    notificaciones = relationship("Notificacion", back_populates="usuario", order_by="desc(Notificacion.created_at)")
    # chazas = relationship("Chaza", back_populates="owner")  # Si el usuario es chazero
    # propuestas = relationship("Propuesta", back_populates="estudiante")  # Si es estudiante

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', tipo='{self.tipo_usuario}', uni_id={self.universidad_id})>"