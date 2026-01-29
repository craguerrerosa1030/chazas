"""
Servicio de Autenticación.
Contiene toda la lógica de negocio relacionada con login, registro, etc.
Este archivo es REUTILIZABLE en otros proyectos.
"""
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status
from datetime import timedelta

from app.models.user import User
from app.models.universidad import Universidad
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.config import settings


class AuthService:
    """
    Servicio de autenticación con métodos para registro y login.
    """

    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> Token:
        """
        Registra un nuevo usuario en el sistema.

        Args:
            db: Sesión de base de datos
            user_data: Datos del usuario a registrar

        Returns:
            Token JWT con información del usuario

        Raises:
            HTTPException: Si el email ya existe o tipo de usuario es inválido
        """
        # Validar tipo de usuario
        if user_data.tipo_usuario not in ["estudiante", "chazero"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de usuario debe ser 'estudiante' o 'chazero'"
            )

        # Verificar que la universidad existe
        universidad = db.query(Universidad).filter(Universidad.id == user_data.universidad_id).first()
        if not universidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La universidad seleccionada no existe"
            )

        if not universidad.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La universidad seleccionada no está activa en la plataforma"
            )

        # Verificar que el email pertenece al dominio de la universidad
        if not universidad.verificar_dominio_correo(user_data.email):
            dominios = universidad.dominios_correo.replace(',', ', @')
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Debes usar tu correo institucional de {universidad.nombre_corto}. Dominios permitidos: @{dominios}"
            )

        # Verificar si el email ya existe
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )

        # Crear usuario con password hasheado
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            nombre=user_data.nombre,
            email=user_data.email,
            password_hash=hashed_password,
            tipo_usuario=user_data.tipo_usuario,
            universidad_id=user_data.universidad_id
        )

        # Guardar en base de datos
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Crear token JWT
        access_token = create_access_token(
            data={"sub": new_user.email, "user_id": new_user.id}
        )

        # Convertir usuario a schema de respuesta
        user_response = UserResponse.model_validate(new_user)

        return Token(access_token=access_token, user=user_response)

    @staticmethod
    def login_user(db: Session, credentials: UserLogin) -> Token:
        """
        Autentica un usuario y devuelve un token JWT.

        Args:
            db: Sesión de base de datos
            credentials: Email y contraseña

        Returns:
            Token JWT con información del usuario

        Raises:
            HTTPException: Si las credenciales son incorrectas
        """
        # Buscar usuario por email (con universidad incluida)
        user = db.query(User).options(joinedload(User.universidad)).filter(User.email == credentials.email).first()

        # Verificar que el usuario existe y la contraseña es correcta
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verificar que la cuenta está activa
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cuenta desactivada. Contacta al soporte."
            )

        # Crear token JWT
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )

        # Convertir usuario a schema de respuesta
        user_response = UserResponse.model_validate(user)

        return Token(access_token=access_token, user=user_response)

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """
        Obtiene un usuario por su email.

        Args:
            db: Sesión de base de datos
            email: Email del usuario

        Returns:
            Usuario encontrado o None
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """
        Obtiene un usuario por su ID.

        Args:
            db: Sesión de base de datos
            user_id: ID del usuario

        Returns:
            Usuario encontrado o None
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def verify_user_email(db: Session, user_id: int) -> User:
        """
        Marca un usuario como verificado.

        Args:
            db: Sesión de base de datos
            user_id: ID del usuario

        Returns:
            Usuario actualizado
        """
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_verified = True
            db.commit()
            db.refresh(user)
        return user