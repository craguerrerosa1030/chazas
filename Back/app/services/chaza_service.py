"""
Servicio de Chazas.
Contiene toda la lógica de negocio relacionada con chazas.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
import uuid

from app.models.chaza import Chaza, HorarioTrabajo, generar_slug
from app.models.user import User
from app.schemas.chaza import ChazaCreate, ChazaUpdate, ChazaResponse, HorarioTrabajoCreate, HorarioTrabajoResponse


class ChazaService:
    """
    Servicio para gestión de chazas (CRUD completo).
    """

    @staticmethod
    def create_chaza(db: Session, chaza_data: ChazaCreate, owner_id: int) -> ChazaResponse:
        """
        Crea una nueva chaza.

        Args:
            db: Sesión de base de datos
            chaza_data: Datos de la chaza
            owner_id: ID del usuario que crea la chaza (debe ser chazero)

        Returns:
            Chaza creada

        Raises:
            HTTPException: Si el usuario no es chazero
        """
        # Verificar que el usuario es chazero
        user = db.query(User).filter(User.id == owner_id).first()
        if not user or user.tipo_usuario != "chazero":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo los chazeros pueden crear chazas"
            )

        # Verificar que el chazero no tenga ya una chaza (solo 1 por chazero)
        chaza_existente = db.query(Chaza).filter(
            Chaza.owner_id == owner_id,
            Chaza.is_active == True
        ).first()
        if chaza_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya tienes una chaza activa. Solo puedes tener una chaza."
            )

        # Generar slug unico
        base_slug = generar_slug(chaza_data.titulo)
        slug = base_slug

        # Verificar si el slug ya existe y agregar sufijo si es necesario
        existing = db.query(Chaza).filter(Chaza.slug == slug).first()
        if existing:
            slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"

        # Crear la chaza (hereda la universidad del chazero)
        new_chaza = Chaza(
            titulo=chaza_data.titulo,
            slug=slug,
            descripcion=chaza_data.descripcion,
            categoria=chaza_data.categoria,
            precio=chaza_data.precio,
            ubicacion=chaza_data.ubicacion,
            duracion_estimada=chaza_data.duracion_estimada,
            telefono=chaza_data.telefono,
            imagen_url=chaza_data.imagen_url,
            owner_id=owner_id,
            universidad_id=user.universidad_id  # Hereda la universidad del chazero
        )

        db.add(new_chaza)
        db.commit()
        db.refresh(new_chaza)

        return ChazaResponse.model_validate(new_chaza)

    @staticmethod
    def get_all_chazas(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        categoria: Optional[str] = None,
        activas_solo: bool = True,
        universidad_id: Optional[int] = None
    ) -> List[ChazaResponse]:
        """
        Obtiene todas las chazas con filtros opcionales.

        Args:
            db: Sesión de base de datos
            skip: Número de registros a saltar (paginación)
            limit: Número máximo de registros a devolver
            categoria: Filtrar por categoría (opcional)
            activas_solo: Solo mostrar chazas activas
            universidad_id: Filtrar por universidad (opcional)

        Returns:
            Lista de chazas
        """
        query = db.query(Chaza)

        # Filtros opcionales
        if activas_solo:
            query = query.filter(Chaza.is_active == True)

        if categoria:
            query = query.filter(Chaza.categoria == categoria)

        # Filtrar por universidad si se especifica
        if universidad_id:
            query = query.filter(Chaza.universidad_id == universidad_id)

        # Ordenar por más reciente
        query = query.order_by(Chaza.created_at.desc())

        # Paginación
        chazas = query.offset(skip).limit(limit).all()

        return [ChazaResponse.model_validate(chaza) for chaza in chazas]

    @staticmethod
    def get_chaza_by_id(db: Session, chaza_id: int) -> ChazaResponse:
        """
        Obtiene una chaza por su ID.

        Args:
            db: Sesión de base de datos
            chaza_id: ID de la chaza

        Returns:
            Chaza encontrada

        Raises:
            HTTPException: Si la chaza no existe
        """
        chaza = db.query(Chaza).filter(Chaza.id == chaza_id).first()

        if not chaza:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chaza no encontrada"
            )

        return ChazaResponse.model_validate(chaza)

    @staticmethod
    def get_chazas_by_owner(db: Session, owner_id: int) -> List[ChazaResponse]:
        """
        Obtiene todas las chazas de un chazero específico.

        Args:
            db: Sesión de base de datos
            owner_id: ID del chazero

        Returns:
            Lista de chazas del chazero
        """
        chazas = db.query(Chaza).filter(Chaza.owner_id == owner_id).order_by(Chaza.created_at.desc()).all()
        return [ChazaResponse.model_validate(chaza) for chaza in chazas]

    @staticmethod
    def update_chaza(
        db: Session,
        chaza_id: int,
        chaza_data: ChazaUpdate,
        user_id: int
    ) -> ChazaResponse:
        """
        Actualiza una chaza existente.

        Args:
            db: Sesión de base de datos
            chaza_id: ID de la chaza a actualizar
            chaza_data: Nuevos datos de la chaza
            user_id: ID del usuario que intenta actualizar (debe ser el owner)

        Returns:
            Chaza actualizada

        Raises:
            HTTPException: Si la chaza no existe o el usuario no es el owner
        """
        chaza = db.query(Chaza).filter(Chaza.id == chaza_id).first()

        if not chaza:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chaza no encontrada"
            )

        # Verificar que el usuario es el dueño de la chaza
        if chaza.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para editar esta chaza"
            )

        # Actualizar solo los campos proporcionados
        update_data = chaza_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(chaza, field, value)

        db.commit()
        db.refresh(chaza)

        return ChazaResponse.model_validate(chaza)

    @staticmethod
    def delete_chaza(db: Session, chaza_id: int, user_id: int) -> dict:
        """
        Elimina una chaza (soft delete - marca como inactiva).

        Args:
            db: Sesión de base de datos
            chaza_id: ID de la chaza a eliminar
            user_id: ID del usuario que intenta eliminar (debe ser el owner)

        Returns:
            Mensaje de confirmación

        Raises:
            HTTPException: Si la chaza no existe o el usuario no es el owner
        """
        chaza = db.query(Chaza).filter(Chaza.id == chaza_id).first()

        if not chaza:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chaza no encontrada"
            )

        # Verificar que el usuario es el dueño de la chaza
        if chaza.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar esta chaza"
            )

        # Soft delete: marcar como inactiva en lugar de eliminar
        chaza.is_active = False
        db.commit()

        return {"message": "Chaza eliminada correctamente"}

    @staticmethod
    def get_chaza_by_slug(db: Session, slug: str) -> ChazaResponse:
        """
        Obtiene una chaza por su slug (URL amigable).

        Args:
            db: Sesion de base de datos
            slug: Slug de la chaza

        Returns:
            Chaza encontrada

        Raises:
            HTTPException: Si la chaza no existe
        """
        chaza = db.query(Chaza).filter(Chaza.slug == slug).first()

        if not chaza:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chaza no encontrada"
            )

        return ChazaResponse.model_validate(chaza)

    # === METODOS DE HORARIOS DE TRABAJO ===

    @staticmethod
    def agregar_horario(
        db: Session,
        chaza_id: int,
        horario_data: HorarioTrabajoCreate,
        user_id: int
    ) -> HorarioTrabajoResponse:
        """
        Agrega un horario de trabajo a una chaza.
        """
        chaza = db.query(Chaza).filter(Chaza.id == chaza_id).first()
        if not chaza:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chaza no encontrada"
            )

        if chaza.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para editar esta chaza"
            )

        # Crear horario
        nuevo_horario = HorarioTrabajo(
            chaza_id=chaza_id,
            dia_semana=horario_data.dia_semana,
            hora_inicio=horario_data.hora_inicio,
            hora_fin=horario_data.hora_fin
        )

        db.add(nuevo_horario)
        db.commit()
        db.refresh(nuevo_horario)

        return HorarioTrabajoResponse.model_validate(nuevo_horario)

    @staticmethod
    def obtener_horarios(db: Session, chaza_id: int) -> List[HorarioTrabajoResponse]:
        """
        Obtiene todos los horarios de trabajo de una chaza.
        """
        horarios = db.query(HorarioTrabajo).filter(
            HorarioTrabajo.chaza_id == chaza_id,
            HorarioTrabajo.activo == True
        ).all()

        return [HorarioTrabajoResponse.model_validate(h) for h in horarios]

    @staticmethod
    def eliminar_horario(db: Session, horario_id: int, user_id: int) -> dict:
        """
        Elimina un horario de trabajo.
        """
        horario = db.query(HorarioTrabajo).filter(HorarioTrabajo.id == horario_id).first()

        if not horario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario no encontrado"
            )

        # Verificar permisos
        chaza = db.query(Chaza).filter(Chaza.id == horario.chaza_id).first()
        if chaza.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar este horario"
            )

        db.delete(horario)
        db.commit()

        return {"message": "Horario eliminado correctamente"}

    @staticmethod
    def actualizar_horarios_completos(
        db: Session,
        chaza_id: int,
        horarios: List[HorarioTrabajoCreate],
        user_id: int
    ) -> List[HorarioTrabajoResponse]:
        """
        Reemplaza todos los horarios de una chaza con los nuevos.
        """
        chaza = db.query(Chaza).filter(Chaza.id == chaza_id).first()
        if not chaza:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chaza no encontrada"
            )

        if chaza.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para editar esta chaza"
            )

        # Eliminar horarios existentes
        db.query(HorarioTrabajo).filter(HorarioTrabajo.chaza_id == chaza_id).delete()

        # Crear nuevos horarios
        nuevos_horarios = []
        for h in horarios:
            nuevo = HorarioTrabajo(
                chaza_id=chaza_id,
                dia_semana=h.dia_semana,
                hora_inicio=h.hora_inicio,
                hora_fin=h.hora_fin
            )
            db.add(nuevo)
            nuevos_horarios.append(nuevo)

        db.commit()

        # Refresh para obtener IDs
        for h in nuevos_horarios:
            db.refresh(h)

        return [HorarioTrabajoResponse.model_validate(h) for h in nuevos_horarios]