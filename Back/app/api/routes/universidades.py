"""
Rutas de Universidad.
Endpoints para gestionar universidades.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.schemas.universidad import UniversidadResponse, UniversidadSimple
from app.services.universidad_service import UniversidadService

router = APIRouter(prefix="/universidades", tags=["Universidades"])


@router.get("/", response_model=List[UniversidadSimple])
def listar_universidades(
    solo_activas: bool = True,
    db: Session = Depends(get_db)
):
    """
    Lista todas las universidades disponibles.
    Endpoint público para que los usuarios puedan seleccionar su universidad al registrarse.
    """
    return UniversidadService.get_all(db, solo_activas)


@router.get("/{universidad_id}", response_model=UniversidadResponse)
def obtener_universidad(
    universidad_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene una universidad por ID."""
    return UniversidadService.get_by_id(db, universidad_id)


@router.get("/slug/{slug}", response_model=UniversidadResponse)
def obtener_universidad_por_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Obtiene una universidad por slug."""
    return UniversidadService.get_by_slug(db, slug)
