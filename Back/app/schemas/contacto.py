from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class MensajeContactoCreate(BaseModel):
    """Schema para crear un mensaje de contacto."""
    email: EmailStr = Field(..., description="Email de contacto del remitente")
    nombre: Optional[str] = Field(None, max_length=100, description="Nombre del remitente (opcional)")
    asunto: str = Field(..., min_length=3, max_length=200, description="Asunto del mensaje")
    mensaje: str = Field(..., min_length=10, max_length=2000, description="Contenido del mensaje")


class MensajeContactoResponse(BaseModel):
    """Schema para respuesta de mensaje de contacto."""
    id: int
    email: str
    nombre: Optional[str]
    asunto: str
    mensaje: str
    leido: bool
    respondido: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MensajeContactoSimple(BaseModel):
    """Respuesta simple para confirmacion."""
    mensaje: str
    id: int
