"""
Schemas de Pydantic para verificación de email.
"""
from pydantic import BaseModel, Field


class VerifyCodeRequest(BaseModel):
    """Schema para verificar código de 6 dígitos."""
    code: str = Field(
        ...,
        min_length=6,
        max_length=6,
        description="Código de 6 dígitos enviado al email"
    )


class VerificationResponse(BaseModel):
    """Respuesta de verificación."""
    message: str
    is_verified: bool


class SendCodeResponse(BaseModel):
    """Respuesta al enviar código."""
    message: str
    email: str
