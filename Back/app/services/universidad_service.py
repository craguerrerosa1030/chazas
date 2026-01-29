"""
Servicio de Universidad.
Contiene la lógica de negocio para operaciones con universidades.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List
import re
import unicodedata

from app.models.universidad import Universidad
from app.schemas.universidad import UniversidadCreate, UniversidadUpdate, UniversidadResponse, UniversidadSimple


def generar_slug_universidad(nombre_corto: str) -> str:
    """Genera un slug a partir del nombre corto de la universidad."""
    texto = unicodedata.normalize('NFKD', nombre_corto)
    texto = texto.encode('ascii', 'ignore').decode('ascii')
    texto = texto.lower().strip()
    texto = re.sub(r'[^a-z0-9\s-]', '', texto)
    texto = re.sub(r'[\s_-]+', '-', texto)
    return texto


class UniversidadService:
    """Servicio para operaciones con universidades."""

    @staticmethod
    def get_all(db: Session, solo_activas: bool = True) -> List[UniversidadSimple]:
        """Obtiene todas las universidades."""
        query = db.query(Universidad)
        if solo_activas:
            query = query.filter(Universidad.is_active == True)
        universidades = query.order_by(Universidad.nombre).all()
        return [UniversidadSimple.model_validate(u) for u in universidades]

    @staticmethod
    def get_by_id(db: Session, universidad_id: int) -> UniversidadResponse:
        """Obtiene una universidad por ID."""
        universidad = db.query(Universidad).filter(Universidad.id == universidad_id).first()
        if not universidad:
            raise HTTPException(status_code=404, detail="Universidad no encontrada")
        return UniversidadResponse.model_validate(universidad)

    @staticmethod
    def get_by_slug(db: Session, slug: str) -> UniversidadResponse:
        """Obtiene una universidad por slug."""
        universidad = db.query(Universidad).filter(Universidad.slug == slug).first()
        if not universidad:
            raise HTTPException(status_code=404, detail="Universidad no encontrada")
        return UniversidadResponse.model_validate(universidad)

    @staticmethod
    def create(db: Session, universidad_data: UniversidadCreate) -> UniversidadResponse:
        """Crea una nueva universidad."""
        # Verificar que no exista con el mismo nombre
        existente = db.query(Universidad).filter(Universidad.nombre == universidad_data.nombre).first()
        if existente:
            raise HTTPException(status_code=400, detail="Ya existe una universidad con ese nombre")

        # Generar slug
        slug = generar_slug_universidad(universidad_data.nombre_corto)

        # Verificar que el slug sea unico
        slug_existente = db.query(Universidad).filter(Universidad.slug == slug).first()
        if slug_existente:
            # Agregar un sufijo numerico
            contador = 1
            while db.query(Universidad).filter(Universidad.slug == f"{slug}-{contador}").first():
                contador += 1
            slug = f"{slug}-{contador}"

        nueva_universidad = Universidad(
            nombre=universidad_data.nombre,
            nombre_corto=universidad_data.nombre_corto,
            slug=slug,
            dominios_correo=universidad_data.dominios_correo.lower(),
            ciudad=universidad_data.ciudad,
            direccion=universidad_data.direccion,
            descripcion=universidad_data.descripcion,
            logo_url=universidad_data.logo_url,
            color_primario=universidad_data.color_primario or "#3498db"
        )

        db.add(nueva_universidad)
        db.commit()
        db.refresh(nueva_universidad)

        return UniversidadResponse.model_validate(nueva_universidad)

    @staticmethod
    def update(db: Session, universidad_id: int, universidad_data: UniversidadUpdate) -> UniversidadResponse:
        """Actualiza una universidad."""
        universidad = db.query(Universidad).filter(Universidad.id == universidad_id).first()
        if not universidad:
            raise HTTPException(status_code=404, detail="Universidad no encontrada")

        update_data = universidad_data.model_dump(exclude_unset=True)

        # Si se actualiza nombre_corto, actualizar tambien el slug
        if 'nombre_corto' in update_data:
            update_data['slug'] = generar_slug_universidad(update_data['nombre_corto'])

        for field, value in update_data.items():
            setattr(universidad, field, value)

        db.commit()
        db.refresh(universidad)

        return UniversidadResponse.model_validate(universidad)

    @staticmethod
    def verificar_email_universidad(db: Session, email: str, universidad_id: int) -> bool:
        """
        Verifica si un email pertenece a los dominios de una universidad.
        Retorna True si el dominio coincide, False si no.
        """
        universidad = db.query(Universidad).filter(Universidad.id == universidad_id).first()
        if not universidad:
            return False

        return universidad.verificar_dominio_correo(email)

    @staticmethod
    def obtener_universidad_por_email(db: Session, email: str) -> Universidad | None:
        """
        Intenta encontrar la universidad basándose en el dominio del email.
        Retorna la universidad si encuentra coincidencia, None si no.
        """
        if not email or '@' not in email:
            return None

        dominio_email = email.split('@')[1].lower()

        universidades = db.query(Universidad).filter(Universidad.is_active == True).all()
        for universidad in universidades:
            dominios = [d.strip().lower() for d in universidad.dominios_correo.split(',')]
            if dominio_email in dominios:
                return universidad

        return None

    @staticmethod
    def seed_universidades_iniciales(db: Session):
        """
        Crea la universidad inicial: Universidad Nacional de Colombia - Sede Bogotá.
        Por ahora solo esta universidad está habilitada.
        """
        universidades_seed = [
            {
                "nombre": "Universidad Nacional de Colombia - Sede Bogotá",
                "nombre_corto": "UNAL Bogotá",
                "dominios_correo": "unal.edu.co",
                "ciudad": "Bogotá",
                "descripcion": "Sede principal de la Universidad Nacional de Colombia, la universidad pública más importante del país.",
                "color_primario": "#1e4d2b"
            },
        ]

        for uni_data in universidades_seed:
            existente = db.query(Universidad).filter(Universidad.nombre == uni_data["nombre"]).first()
            if not existente:
                slug = generar_slug_universidad(uni_data["nombre_corto"])
                nueva_uni = Universidad(
                    nombre=uni_data["nombre"],
                    nombre_corto=uni_data["nombre_corto"],
                    slug=slug,
                    dominios_correo=uni_data["dominios_correo"],
                    ciudad=uni_data["ciudad"],
                    descripcion=uni_data.get("descripcion"),
                    color_primario=uni_data.get("color_primario", "#1e4d2b")
                )
                db.add(nueva_uni)

        db.commit()
