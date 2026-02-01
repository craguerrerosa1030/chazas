"""
Servicio de Autenticacion.
Contiene toda la logica de negocio relacionada con login, registro, etc.
"""
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status
from datetime import datetime, timedelta, timezone
import random
import string

from app.models.user import User
from app.models.universidad import Universidad
from app.models.pending_registration import PendingRegistration
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.schemas.verification import PendingRegistrationResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.config import settings


class AuthService:
    """
    Servicio de autenticacion con metodos para registro y login.
    """

    @staticmethod
    def generate_verification_code() -> str:
        """Genera un codigo de 6 digitos aleatorio."""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def create_pending_registration(db: Session, user_data: UserCreate) -> PendingRegistrationResponse:
        """
        Crea un registro pendiente de verificacion.
        El usuario no se crea hasta que verifique su email.
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
                detail="La universidad seleccionada no esta activa en la plataforma"
            )

        # Verificar que el email pertenece al dominio de la universidad
        if not universidad.verificar_dominio_correo(user_data.email):
            dominios = universidad.dominios_correo.replace(',', ', @')
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Debes usar tu correo institucional de {universidad.nombre_corto}. Dominios permitidos: @{dominios}"
            )

        # Verificar si el email ya existe como usuario
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya esta registrado"
            )

        # Verificar si hay registro pendiente previo y borrarlo
        existing_pending = db.query(PendingRegistration).filter(
            PendingRegistration.email == user_data.email
        ).first()
        if existing_pending:
            db.delete(existing_pending)
            db.commit()

        # Generar codigo de verificacion
        code = AuthService.generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES
        )

        # Crear registro pendiente
        hashed_password = get_password_hash(user_data.password)
        pending = PendingRegistration(
            nombre=user_data.nombre,
            email=user_data.email,
            password_hash=hashed_password,
            tipo_usuario=user_data.tipo_usuario,
            universidad_id=user_data.universidad_id,
            verification_code=code,
            expires_at=expires_at
        )

        db.add(pending)
        db.commit()

        return PendingRegistrationResponse(
            message="Codigo de verificacion enviado a tu correo",
            email=user_data.email,
            requires_verification=True
        ), code

    @staticmethod
    def verify_and_create_user(db: Session, email: str, code: str) -> Token:
        """
        Verifica el codigo y crea el usuario real.
        """
        # Buscar registro pendiente
        pending = db.query(PendingRegistration).filter(
            PendingRegistration.email == email
        ).first()

        if not pending:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay registro pendiente para este email. Registrate primero."
            )

        # Verificar que no haya expirado
        if datetime.now(timezone.utc) > pending.expires_at:
            db.delete(pending)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El codigo ha expirado. Registrate de nuevo."
            )

        # Verificar codigo
        if pending.verification_code != code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Codigo incorrecto. Verifica e intenta de nuevo."
            )

        # Crear usuario real
        new_user = User(
            nombre=pending.nombre,
            email=pending.email,
            password_hash=pending.password_hash,
            tipo_usuario=pending.tipo_usuario,
            universidad_id=pending.universidad_id,
            is_verified=True  # Ya verificado
        )

        db.add(new_user)
        db.delete(pending)
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
    def resend_verification_code(db: Session, email: str) -> tuple:
        """
        Reenvia el codigo de verificacion para un registro pendiente.
        """
        pending = db.query(PendingRegistration).filter(
            PendingRegistration.email == email
        ).first()

        if not pending:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay registro pendiente para este email"
            )

        # Generar nuevo codigo
        code = AuthService.generate_verification_code()
        pending.verification_code = code
        pending.expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES
        )

        db.commit()

        return pending, code

    @staticmethod
    def login_user(db: Session, credentials: UserLogin) -> Token:
        """
        Autentica un usuario y devuelve un token JWT.
        """
        # Buscar usuario por email (con universidad incluida)
        user = db.query(User).options(joinedload(User.universidad)).filter(User.email == credentials.email).first()

        # Verificar que el usuario existe y la contrasena es correcta
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contrasena incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verificar que la cuenta esta activa
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
        """Obtiene un usuario por su email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Obtiene un usuario por su ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def verify_user_email(db: Session, user_id: int) -> User:
        """Marca un usuario como verificado."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_verified = True
            db.commit()
            db.refresh(user)
        return user
