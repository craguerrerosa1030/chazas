"""
Modelo de Chaza para la base de datos.
Define la tabla 'chazas' con SQLAlchemy.
"""
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base
import re
import unicodedata


def generar_slug(titulo: str) -> str:
    """Genera un slug a partir del titulo de la chaza."""
    # Normalizar caracteres unicode (quitar tildes)
    texto = unicodedata.normalize('NFKD', titulo)
    texto = texto.encode('ascii', 'ignore').decode('ascii')
    # Convertir a minusculas y reemplazar espacios por guiones
    texto = texto.lower().strip()
    texto = re.sub(r'[^a-z0-9\s-]', '', texto)
    texto = re.sub(r'[\s_-]+', '-', texto)
    return texto


class Chaza(Base):
    """
    Modelo de Chaza.
    Representa un trabajo/servicio publicado por un chazero.
    """
    __tablename__ = "chazas"

    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, index=True, nullable=False)  # URL amigable
    descripcion = Column(Text, nullable=False)
    categoria = Column(String(50), nullable=False)  # Ej: "plomería", "electricidad", etc.

    # Información del trabajo
    precio = Column(Float, nullable=True)  # Puede ser null si el precio es "a convenir"
    ubicacion = Column(String(200), nullable=False)
    duracion_estimada = Column(String(50), nullable=True)  # Ej: "2 horas", "1 día"
    telefono = Column(String(20), nullable=True)  # Telefono de contacto
    imagen_url = Column(String(500), nullable=True)  # URL de la imagen de la chaza

    # Relación con el dueño (chazero)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # owner = relationship("User", back_populates="chazas")

    # Universidad a la que pertenece la chaza
    universidad_id = Column(Integer, ForeignKey("universidades.id"), nullable=False)

    # Estado
    is_active = Column(Boolean, default=True)  # Si la chaza está disponible
    is_completed = Column(Boolean, default=False)  # Si ya fue completada

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    horarios = relationship("HorarioTrabajo", back_populates="chaza", cascade="all, delete-orphan")
    universidad = relationship("Universidad", back_populates="chazas")

    def __repr__(self):
        return f"<Chaza(id={self.id}, titulo='{self.titulo}', categoria='{self.categoria}')>"


class HorarioTrabajo(Base):
    """
    Modelo de Horario de Trabajo.
    Define los horarios en los que la chaza busca trabajadores.
    Horarios por hora completa (sin medias horas).
    """
    __tablename__ = "horarios_trabajo"

    id = Column(Integer, primary_key=True, index=True)
    chaza_id = Column(Integer, ForeignKey("chazas.id"), nullable=False)

    # Dia de la semana (0=Lunes, 6=Domingo)
    dia_semana = Column(Integer, nullable=False)  # 0-6

    # Hora de inicio y fin (solo horas completas)
    hora_inicio = Column(Integer, nullable=False)  # 0-23
    hora_fin = Column(Integer, nullable=False)  # 0-23

    # Si esta activo este horario
    activo = Column(Boolean, default=True)

    # Relacion con chaza
    chaza = relationship("Chaza", back_populates="horarios")

    def __repr__(self):
        dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]
        return f"<HorarioTrabajo({dias[self.dia_semana]} {self.hora_inicio}:00 - {self.hora_fin}:00)>"