"""
Modelo de Universidad para la base de datos.
Cada universidad tiene sus propios estudiantes, chazeros y chazas.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class Universidad(Base):
    """
    Modelo de Universidad.
    Representa una universidad con su dominio de correo institucional.
    """
    __tablename__ = "universidades"

    id = Column(Integer, primary_key=True, index=True)

    # Informacion basica
    nombre = Column(String(200), nullable=False, unique=True)
    nombre_corto = Column(String(50), nullable=False)  # Ej: "UNAL", "UdeA", "EAFIT"
    slug = Column(String(100), unique=True, index=True, nullable=False)  # URL amigable

    # Dominio de correo institucional (para verificacion futura)
    # Puede haber multiples dominios separados por coma
    # Ej: "unal.edu.co,un.edu.co" o "udea.edu.co"
    dominios_correo = Column(String(500), nullable=False)

    # Ubicacion
    ciudad = Column(String(100), nullable=False)
    direccion = Column(String(300), nullable=True)

    # Informacion adicional
    descripcion = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    color_primario = Column(String(7), default="#3498db")  # Color hex para personalizar UI

    # Estado
    is_active = Column(Boolean, default=True)  # Si la universidad esta activa en la plataforma

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    usuarios = relationship("User", back_populates="universidad")
    chazas = relationship("Chaza", back_populates="universidad")

    def __repr__(self):
        return f"<Universidad(id={self.id}, nombre='{self.nombre_corto}', dominios='{self.dominios_correo}')>"

    def verificar_dominio_correo(self, email: str) -> bool:
        """
        Verifica si un email pertenece a los dominios de esta universidad.
        """
        if not email or '@' not in email:
            return False

        dominio_email = email.split('@')[1].lower()
        dominios_permitidos = [d.strip().lower() for d in self.dominios_correo.split(',')]

        return dominio_email in dominios_permitidos
