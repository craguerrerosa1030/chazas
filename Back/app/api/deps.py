"""
Dependencias para las rutas de la API.
Se usan con FastAPI Depends() para inyectar en los endpoints.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import decode_access_token
from app.services.auth_service import AuthService
from app.models.user import User


# Esquema de seguridad Bearer (JWT)
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependencia para obtener el usuario actual desde el token JWT.

    Args:
        credentials: Token JWT del header Authorization
        db: Sesión de base de datos

    Returns:
        Usuario autenticado

    Raises:
        HTTPException: Si el token es inválido o el usuario no existe

    Example:
        @app.get("/me")
        def get_me(current_user: User = Depends(get_current_user)):
            return current_user
    """
    # Extraer token
    token = credentials.credentials

    # Decodificar token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Obtener email del payload
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Buscar usuario en base de datos
    user = AuthService.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar que la cuenta está activa
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada"
        )

    return user


def get_current_chazero(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia para verificar que el usuario actual es un chazero.

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario chazero

    Raises:
        HTTPException: Si el usuario no es chazero
    """
    if current_user.tipo_usuario != "chazero":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los chazeros pueden realizar esta acción"
        )
    return current_user


def get_current_estudiante(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia para verificar que el usuario actual es un estudiante.

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario estudiante

    Raises:
        HTTPException: Si el usuario no es estudiante
    """
    if current_user.tipo_usuario != "estudiante":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los estudiantes pueden realizar esta acción"
        )
    return current_user


def get_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia para verificar que el usuario actual tiene email verificado.
    Permite uso limitado si no está verificado (ver chazas, pero no postularse).

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario verificado

    Raises:
        HTTPException: Si el usuario no ha verificado su email
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes verificar tu correo electrónico para realizar esta acción. Revisa tu bandeja de entrada."
        )
    return current_user


def get_verified_chazero(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia para verificar que el usuario es chazero Y tiene email verificado.

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario chazero verificado

    Raises:
        HTTPException: Si no es chazero o no está verificado
    """
    if current_user.tipo_usuario != "chazero":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los chazeros pueden realizar esta acción"
        )
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes verificar tu correo electrónico para crear o modificar chazas"
        )
    return current_user


def get_verified_estudiante(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia para verificar que el usuario es estudiante Y tiene email verificado.

    Args:
        current_user: Usuario autenticado

    Returns:
        Usuario estudiante verificado

    Raises:
        HTTPException: Si no es estudiante o no está verificado
    """
    if current_user.tipo_usuario != "estudiante":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los estudiantes pueden realizar esta acción"
        )
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes verificar tu correo electrónico para postularte a chazas"
        )
    return current_user