"""
Rutas de autenticación.
Endpoints para registro, login, y gestión de usuarios.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.schemas.verification import VerifyCodeRequest, VerificationResponse, SendCodeResponse
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario en el sistema.

    - **nombre**: Nombre completo del usuario
    - **email**: Email único del usuario
    - **password**: Contraseña (mínimo 6 caracteres)
    - **tipo_usuario**: 'estudiante' o 'chazero'

    Devuelve un token JWT para autenticación inmediata.
    """
    return AuthService.register_user(db, user_data)


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Inicia sesión con email y contraseña.

    - **email**: Email del usuario
    - **password**: Contraseña del usuario

    Devuelve un token JWT válido por 30 minutos.
    """
    return AuthService.login_user(db, credentials)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtiene la información del usuario autenticado.

    Requiere token JWT en el header:
    ```
    Authorization: Bearer <token>
    ```
    """
    return UserResponse.model_validate(current_user)


@router.get("/test")
def test_auth():
    """
    Endpoint de prueba para verificar que la API está funcionando.
    No requiere autenticación.
    """
    return {
        "message": "API de Chazas funcionando correctamente",
        "version": "1.0.0",
        "status": "OK"
    }


# ============================================
# ENDPOINTS DE VERIFICACIÓN DE EMAIL
# ============================================

@router.post("/send-verification", response_model=SendCodeResponse)
def send_verification_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envía código de verificación al email del usuario autenticado.

    Requiere token JWT. El código expira en 15 minutos.
    """
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta ya está verificada"
        )

    # Crear y enviar código
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
        message="Código enviado a tu correo",
        email=current_user.email
    )


@router.post("/verify-email", response_model=VerificationResponse)
def verify_email(
    request: VerifyCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifica el código de 6 dígitos enviado al email.

    Requiere token JWT y el código recibido por email.
    """
    if current_user.is_verified:
        return VerificationResponse(
            message="Tu cuenta ya está verificada",
            is_verified=True
        )

    # Verificar código
    is_valid = EmailService.verify_code(db, current_user.id, request.code)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado. Solicita uno nuevo."
        )

    # Marcar usuario como verificado
    AuthService.verify_user_email(db, current_user.id)

    return VerificationResponse(
        message="¡Email verificado exitosamente!",
        is_verified=True
    )


@router.post("/resend-verification", response_model=SendCodeResponse)
def resend_verification_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reenvía código de verificación.

    Útil si el código anterior expiró o no llegó.
    """
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu cuenta ya está verificada"
        )

    # Crear nuevo código (invalida el anterior)
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
        message="Nuevo código enviado a tu correo",
        email=current_user.email
    )