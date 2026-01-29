from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime

from app.models.notificacion import Notificacion, TipoNotificacion
from app.schemas.notificacion import NotificacionCreate


class NotificacionService:
    """Servicio para manejar notificaciones"""

    @staticmethod
    def crear_notificacion(
        db: Session,
        usuario_id: int,
        tipo: TipoNotificacion,
        titulo: str,
        mensaje: str,
        chaza_id: Optional[int] = None,
        postulacion_id: Optional[int] = None  # Parámetro ignorado temporalmente
    ) -> Notificacion:
        """Crea una nueva notificacion"""
        notificacion = Notificacion(
            usuario_id=usuario_id,
            tipo=tipo,
            titulo=titulo,
            mensaje=mensaje,
            chaza_id=chaza_id
            # postulacion_id omitido - columna no existe en DB actual
        )
        db.add(notificacion)
        db.commit()
        db.refresh(notificacion)
        return notificacion

    @staticmethod
    def obtener_notificaciones_usuario(
        db: Session,
        usuario_id: int,
        solo_sin_leer: bool = False,
        limite: int = 50
    ) -> List[Notificacion]:
        """Obtiene las notificaciones de un usuario"""
        query = db.query(Notificacion).filter(
            Notificacion.usuario_id == usuario_id
        )

        if solo_sin_leer:
            query = query.filter(Notificacion.leida == False)

        return query.order_by(Notificacion.created_at.desc()).limit(limite).all()

    @staticmethod
    def contar_sin_leer(db: Session, usuario_id: int) -> int:
        """Cuenta las notificaciones sin leer de un usuario"""
        return db.query(Notificacion).filter(
            and_(
                Notificacion.usuario_id == usuario_id,
                Notificacion.leida == False
            )
        ).count()

    @staticmethod
    def marcar_como_leida(db: Session, notificacion_id: int, usuario_id: int) -> Optional[Notificacion]:
        """Marca una notificacion como leida"""
        notificacion = db.query(Notificacion).filter(
            and_(
                Notificacion.id == notificacion_id,
                Notificacion.usuario_id == usuario_id
            )
        ).first()

        if notificacion:
            notificacion.leida = True
            notificacion.read_at = datetime.utcnow()
            db.commit()
            db.refresh(notificacion)

        return notificacion

    @staticmethod
    def marcar_todas_como_leidas(db: Session, usuario_id: int) -> int:
        """Marca todas las notificaciones de un usuario como leidas"""
        resultado = db.query(Notificacion).filter(
            and_(
                Notificacion.usuario_id == usuario_id,
                Notificacion.leida == False
            )
        ).update({
            "leida": True,
            "read_at": datetime.utcnow()
        })
        db.commit()
        return resultado

    @staticmethod
    def marcar_varias_como_leidas(db: Session, notificacion_ids: List[int], usuario_id: int) -> int:
        """Marca varias notificaciones como leidas"""
        resultado = db.query(Notificacion).filter(
            and_(
                Notificacion.id.in_(notificacion_ids),
                Notificacion.usuario_id == usuario_id,
                Notificacion.leida == False
            )
        ).update({
            "leida": True,
            "read_at": datetime.utcnow()
        }, synchronize_session=False)
        db.commit()
        return resultado

    @staticmethod
    def eliminar_notificacion(db: Session, notificacion_id: int, usuario_id: int) -> bool:
        """Elimina una notificacion"""
        notificacion = db.query(Notificacion).filter(
            and_(
                Notificacion.id == notificacion_id,
                Notificacion.usuario_id == usuario_id
            )
        ).first()

        if notificacion:
            db.delete(notificacion)
            db.commit()
            return True
        return False

    # ============ METODOS PARA CREAR NOTIFICACIONES ESPECIFICAS ============

    @staticmethod
    def notificar_nueva_postulacion(
        db: Session,
        chazero_id: int,
        estudiante_nombre: str,
        chaza_nombre: str,
        chaza_id: int,
        postulacion_id: Optional[int] = None  # Opcional temporalmente
    ) -> Notificacion:
        """Notifica al chazero que tiene una nueva postulacion"""
        return NotificacionService.crear_notificacion(
            db=db,
            usuario_id=chazero_id,
            tipo=TipoNotificacion.NUEVA_POSTULACION,
            titulo="Nueva postulacion recibida",
            mensaje=f"{estudiante_nombre} se ha postulado para trabajar en {chaza_nombre}",
            chaza_id=chaza_id,
            postulacion_id=postulacion_id
        )

    @staticmethod
    def notificar_postulacion_aceptada(
        db: Session,
        estudiante_id: int,
        chaza_nombre: str,
        chaza_id: int,
        postulacion_id: Optional[int] = None  # Opcional temporalmente
    ) -> Notificacion:
        """Notifica al estudiante que su postulacion fue aceptada"""
        return NotificacionService.crear_notificacion(
            db=db,
            usuario_id=estudiante_id,
            tipo=TipoNotificacion.POSTULACION_ACEPTADA,
            titulo="Postulacion aceptada",
            mensaje=f"Tu postulacion para {chaza_nombre} ha sido aceptada. El chazero se pondra en contacto contigo.",
            chaza_id=chaza_id,
            postulacion_id=postulacion_id
        )

    @staticmethod
    def notificar_postulacion_rechazada(
        db: Session,
        estudiante_id: int,
        chaza_nombre: str,
        chaza_id: int,
        postulacion_id: Optional[int] = None  # Opcional temporalmente
    ) -> Notificacion:
        """Notifica al estudiante que su postulacion fue rechazada"""
        return NotificacionService.crear_notificacion(
            db=db,
            usuario_id=estudiante_id,
            tipo=TipoNotificacion.POSTULACION_RECHAZADA,
            titulo="Postulacion no seleccionada",
            mensaje=f"Tu postulacion para {chaza_nombre} no fue seleccionada en esta ocasion. Sigue intentando!",
            chaza_id=chaza_id,
            postulacion_id=postulacion_id
        )

    @staticmethod
    def notificar_postulacion_cancelada(
        db: Session,
        chazero_id: int,
        estudiante_nombre: str,
        chaza_nombre: str,
        chaza_id: int
    ) -> Notificacion:
        """Notifica al chazero que un estudiante cancelo su postulacion"""
        return NotificacionService.crear_notificacion(
            db=db,
            usuario_id=chazero_id,
            tipo=TipoNotificacion.POSTULACION_CANCELADA,
            titulo="Postulacion cancelada",
            mensaje=f"{estudiante_nombre} ha cancelado su postulacion para {chaza_nombre}",
            chaza_id=chaza_id
        )

    @staticmethod
    def notificar_sistema(
        db: Session,
        usuario_id: int,
        titulo: str,
        mensaje: str
    ) -> Notificacion:
        """Envia una notificacion del sistema"""
        return NotificacionService.crear_notificacion(
            db=db,
            usuario_id=usuario_id,
            tipo=TipoNotificacion.SISTEMA,
            titulo=titulo,
            mensaje=mensaje
        )