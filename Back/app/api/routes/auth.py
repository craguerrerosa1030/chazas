"""
Rutas de autenticacion.
Endpoints para registro, login, y gestion de usuarios.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.schemas.verification import (
    VerifyCodeRequest, VerificationResponse, SendCodeResponse,
    VerifyRegistrationRequest, PendingRegistrationResponse
)
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Autenticacion"])


class ResendCodeRequest(BaseModel):
    email: str


@router.post("/register", response_model=PendingRegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Inicia el registro de un nuevo usuario.
    NO crea el usuario inmediatamente - envia un codigo de verificacion al email.
    El usuario debe verificar el codigo para completar el registro.
    """
    response, code = AuthService.create_pending_registration(db, user_data)

    # Enviar email con codigo en segundo plano
    background_tasks.add_task(
        EmailService.send_verification_email,
        user_data.email,
        code,
        user_data.nombre
    )

    return response


@router.post("/verify-registration", response_model=Token)
def verify_registration(
    request: VerifyRegistrationRequest,
    db: Session = Depends(get_db)
):
    """
    Verifica el codigo de registro y crea el usuario.
    Devuelve token JWT para login automatico.
    """
    return AuthService.verify_and_create_user(db, request.email, request.code)


@router.post("/resend-registration-code", response_model=SendCodeResponse)
def resend_registration_code(
    request: ResendCodeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Reenvia el codigo de verificacion para un registro pendiente.
    """
    pending, code = AuthService.resend_verification_code(db, request.email)

    # Enviar email con nuevo codigo
    background_tasks.add_task(
        EmailService.send_verification_email,
        pending.email,
        code,
        pending.nombre
    )

    return SendCodeResponse(
        message="Nuevo codigo enviado a tu correo",
        email=pending.email
    )


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Inicia sesion con email y contrasena.
    Devuelve un token JWT valido por 24 horas.
    """
    return AuthService.login_user(db, credentials)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtiene la informacion del usuario autenticado.
    Requiere token JWT en el header Authorization.
    """
    return UserResponse.model_validate(current_user)


@router.get("/test")
def test_auth():
    """
    Endpoint de prueba para verificar que la API esta funcionando.
    """
    return {
        "message": "API de Chazas funcionando correctamente",
        "version": "2.0.0",
        "status": "OK"
    }


# ============================================
# ENDPOINTS DE VERIFICACION DE EMAIL (para usuarios ya creados)
# ============================================

@router.post("/send-verification", response_model=SendCodeResponse)
def send_verification_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envia codigo de verificacion al email del usuario autenticado.
    Para usuarios que se registraron antes del nuevo sistema.
    """
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta ya esta verificada"
        )

    code = EmailService.create_verification_code(db, current_user.id, current_user.email)
    success = EmailService.send_verification_email(
        current_user.email,
        code,
        current_user.nombre
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error enviando el email. Intenta de nuevo."
        )

    return SendCodeResponse(
        message="Codigo enviado a tu correo",
        email=current_user.email
    )


@router.post("/verify-email", response_model=VerificationResponse)
def verify_email(
    request: VerifyCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifica el codigo de 6 digitos enviado al email.
    Para usuarios que se registraron antes del nuevo sistema.
    """
    if current_user.is_verified:
        return VerificationResponse(
            message="Tu cuenta ya esta verificada",
            is_verified=True
        )

    is_valid = EmailService.verify_code(db, current_user.id, request.code)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Codigo invalido o expirado. Solicita uno nuevo."
        )

    AuthService.verify_user_email(db, current_user.id)

    return VerificationResponse(
        message="Email verificado exitosamente!",
        is_verified=True
    )


@router.post("/resend-verification", response_model=SendCodeResponse)
def resend_old_verification_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reenvia codigo de verificacion.
    Para usuarios que se registraron antes del nuevo sistema.
    """
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta ya esta verificada"
        )

    code = EmailService.create_verification_code(db, current_user.id, current_user.email)
    success = EmailService.send_verification_email(
        current_user.email,
        code,
        current_user.nombre
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error enviando el email. Intenta de nuevo."
        )

    return SendCodeResponse(
        message="Nuevo codigo enviado a tu correo",
        email=current_user.email
    )
