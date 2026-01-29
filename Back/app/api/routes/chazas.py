"""
Rutas de chazas.
Endpoints para crear, leer, actualizar y eliminar chazas.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.schemas.chaza import ChazaCreate, ChazaUpdate, ChazaResponse, HorarioTrabajoCreate, HorarioTrabajoResponse
from app.services.chaza_service import ChazaService
from app.api.deps import get_current_user, get_current_chazero, get_verified_chazero
from app.models.user import User


router = APIRouter(prefix="/chazas", tags=["Chazas"])


@router.post("/", response_model=ChazaResponse, status_code=201)
def create_chaza(
    chaza_data: ChazaCreate,
    current_user: User = Depends(get_verified_chazero),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva chaza.

    **Solo para chazeros con email verificado.**

    Requiere autenticación JWT.
    """
    return ChazaService.create_chaza(db, chaza_data, current_user.id)


@router.get("/", response_model=List[ChazaResponse])
def get_all_chazas(
    skip: int = Query(0, ge=0, description="Número de chazas a saltar (paginación)"),
    limit: int = Query(100, ge=1, le=100, description="Número máximo de chazas a devolver"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    activas_solo: bool = Query(True, description="Solo mostrar chazas activas"),
    universidad_id: Optional[int] = Query(None, description="Filtrar por universidad"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las chazas con filtros opcionales.

    - **skip**: Paginación - número de registros a saltar
    - **limit**: Paginación - máximo de registros (max 100)
    - **categoria**: Filtrar por categoría (opcional)
    - **activas_solo**: Solo chazas activas (default: true)
    - **universidad_id**: Filtrar por universidad (opcional)

    No requiere autenticación.
    """
    return ChazaService.get_all_chazas(db, skip, limit, categoria, activas_solo, universidad_id)


@router.get("/mis-chazas", response_model=List[ChazaResponse])
def get_my_chazas(
    current_user: User = Depends(get_current_chazero),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las chazas del chazero autenticado.

    **Solo para chazeros.**

    Requiere autenticación JWT.
    """
    return ChazaService.get_chazas_by_owner(db, current_user.id)


@router.get("/slug/{slug}", response_model=ChazaResponse)
def get_chaza_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene una chaza por su slug (URL amigable).

    Ejemplo: /chazas/slug/chaza-don-carlos

    No requiere autenticacion.
    """
    return ChazaService.get_chaza_by_slug(db, slug)


@router.get("/{chaza_id}", response_model=ChazaResponse)
def get_chaza(
    chaza_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene una chaza específica por su ID.

    No requiere autenticación.
    """
    return ChazaService.get_chaza_by_id(db, chaza_id)


@router.put("/{chaza_id}", response_model=ChazaResponse)
def update_chaza(
    chaza_id: int,
    chaza_data: ChazaUpdate,
    current_user: User = Depends(get_verified_chazero),
    db: Session = Depends(get_db)
):
    """
    Actualiza una chaza existente.

    Solo el dueño de la chaza con email verificado puede actualizarla.

    Requiere autenticación JWT.
    """
    return ChazaService.update_chaza(db, chaza_id, chaza_data, current_user.id)


@router.delete("/{chaza_id}")
def delete_chaza(
    chaza_id: int,
    current_user: User = Depends(get_verified_chazero),
    db: Session = Depends(get_db)
):
    """
    Elimina una chaza (soft delete - marca como inactiva).

    Solo el dueño de la chaza con email verificado puede eliminarla.

    Requiere autenticación JWT.
    """
    return ChazaService.delete_chaza(db, chaza_id, current_user.id)


# === ENDPOINTS DE HORARIOS DE TRABAJO ===

@router.post("/{chaza_id}/horarios", response_model=HorarioTrabajoResponse, status_code=201)
def agregar_horario(
    chaza_id: int,
    horario_data: HorarioTrabajoCreate,
    current_user: User = Depends(get_verified_chazero),
    db: Session = Depends(get_db)
):
    """
    Agrega un horario de trabajo a la chaza.

    Solo el dueño de la chaza puede agregar horarios.
    Las horas son completas (0-23), sin medias horas.
    """
    return ChazaService.agregar_horario(db, chaza_id, horario_data, current_user.id)


@router.get("/{chaza_id}/horarios", response_model=List[HorarioTrabajoResponse])
def obtener_horarios(
    chaza_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los horarios de trabajo de una chaza.

    No requiere autenticacion.
    """
    return ChazaService.obtener_horarios(db, chaza_id)


@router.put("/{chaza_id}/horarios", response_model=List[HorarioTrabajoResponse])
def actualizar_horarios(
    chaza_id: int,
    horarios: List[HorarioTrabajoCreate],
    current_user: User = Depends(get_verified_chazero),
    db: Session = Depends(get_db)
):
    """
    Reemplaza todos los horarios de la chaza con los nuevos.

    Solo el dueño puede actualizar los horarios.
    """
    return ChazaService.actualizar_horarios_completos(db, chaza_id, horarios, current_user.id)


@router.delete("/horarios/{horario_id}")
def eliminar_horario(
    horario_id: int,
    current_user: User = Depends(get_verified_chazero),
    db: Session = Depends(get_db)
):
    """
    Elimina un horario de trabajo especifico.

    Solo el dueño de la chaza puede eliminar horarios.
    """
    return ChazaService.eliminar_horario(db, horario_id, current_user.id)