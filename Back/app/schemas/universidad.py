"""
Schemas de Pydantic para Universidad.
Define la validación y serialización de datos de universidades.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UniversidadBase(BaseModel):
    """Campos base de universidad."""
    nombre: str = Field(..., min_length=3, max_length=200)
    nombre_corto: str = Field(..., min_length=2, max_length=50)
    dominios_correo: str = Field(..., min_length=5)  # Ej: "unal.edu.co,un.edu.co"
    ciudad: str = Field(..., min_length=2, max_length=100)
    direccion: Optional[str] = None
    descripcion: Optional[str] = None
    logo_url: Optional[str] = None
    color_primario: Optional[str] = "#3498db"


class UniversidadCreate(UniversidadBase):
    """Schema para crear una universidad."""
    pass


class UniversidadUpdate(BaseModel):
    """Schema para actualizar una universidad."""
    nombre: Optional[str] = Field(None, min_length=3, max_length=200)
    nombre_corto: Optional[str] = Field(None, min_length=2, max_length=50)
    dominios_correo: Optional[str] = Field(None, min_length=5)
    ciudad: Optional[str] = Field(None, min_length=2, max_length=100)
    direccion: Optional[str] = None
    descripcion: Optional[str] = None
    logo_url: Optional[str] = None
    color_primario: Optional[str] = None
    is_active: Optional[bool] = None


class UniversidadResponse(UniversidadBase):
    """Schema de respuesta para universidad."""
    id: int
    slug: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UniversidadSimple(BaseModel):
    """Schema simplificado para listados."""
    id: int
    nombre: str
    nombre_corto: str
    slug: str
    ciudad: str
    dominios_correo: str  # Incluir para validación en frontend
    logo_url: Optional[str] = None
    color_primario: str

    class Config:
        from_attributes = True
