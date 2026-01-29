"""
Servicio para manejar solicitudes de trabajo.
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime

from app.models.solicitud import Solicitud, EstadoSolicitud
from app.models.chaza import Chaza
from app.models.user import User
from app.services.notificacion_service import NotificacionService
from app.models.notificacion import TipoNotificacion


DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']


class SolicitudService:
    """Servicio para manejar solicitudes de trabajo en chazas"""

    @staticmethod
    def formatear_horarios(horarios: List[str]) -> str:
        """
        Convierte lista de horarios ['0-8', '0-9', '1-10'] a texto legible.
        Agrupa por día para mostrar mejor.
        """
        if not horarios:
            return "Sin horarios especificados"

        # Agrupar por día
        por_dia = {}
        for h in horarios:
            try:
                dia, hora = h.split('-')
                dia = int(dia)
                hora = int(hora)
                if dia not in por_dia:
                    por_dia[dia] = []
                por_dia[dia].append(hora)
            except (ValueError, IndexError):
                continue

        # Formatear
        resultado = []
        for dia in sorted(por_dia.keys()):
            if 0 <= dia < 7:
                horas = sorted(por_dia[dia])
                horas_str = ", ".join([f"{h}:00" for h in horas])
                resultado.append(f"{DIAS_SEMANA[dia]}: {horas_str}")

        return " | ".join(resultado) if resultado else "Sin horarios válidos"

    @staticmethod
    def crear_solicitud(
        db: Session,
        estudiante_id: int,
        chaza_id: int,
        horarios_seleccionados: List[str],
        mensaje: Optional[str] = None
    ) -> Solicitud:
        """Crea una nueva solicitud de trabajo"""

        # Verificar que la chaza existe
        chaza = db.query(Chaza).filter(Chaza.id == chaza_id).first()
        if not chaza:
            raise ValueError("La chaza no existe")

        # Verificar que el estudiante no sea el dueño de la chaza
        if chaza.owner_id == estudiante_id:
            raise ValueError("No puedes postularte a tu propia chaza")

        # Verificar que no exista una solicitud pendiente del mismo estudiante a la misma chaza
        solicitud_existente = db.query(Solicitud).filter(
            and_(
                Solicitud.estudiante_id == estudiante_id,
                Solicitud.chaza_id == chaza_id,
                Solicitud.estado == EstadoSolicitud.PENDIENTE
            )
        ).first()

        if solicitud_existente:
            raise ValueError("Ya tienes una solicitud pendiente para esta chaza")

        # Crear la solicitud
        solicitud = Solicitud(
            estudiante_id=estudiante_id,
            chaza_id=chaza_id,
            horarios_seleccionados=horarios_seleccionados,
            mensaje=mensaje,
            estado=EstadoSolicitud.PENDIENTE
        )

        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)

        # Obtener datos del estudiante para la notificación
        estudiante = db.query(User).filter(User.id == estudiante_id).first()

        # Crear notificación para el dueño de la chaza
        horarios_texto = SolicitudService.formatear_horarios(horarios_seleccionados)
        NotificacionService.crear_notificacion(
            db=db,
            usuario_id=chaza.owner_id,
            tipo=TipoNotificacion.NUEVA_POSTULACION,
            titulo="Nueva solicitud de trabajo",
            mensaje=f"{estudiante.nombre} quiere trabajar en {chaza.titulo}. Horarios: {horarios_texto}",
            chaza_id=chaza_id,
            postulacion_id=solicitud.id
        )

        return solicitud

    @staticmethod
    def obtener_solicitudes_chaza(
        db: Session,
        chaza_id: int,
        dueno_id: int,
        estado: Optional[EstadoSolicitud] = None
    ) -> List[dict]:
        """Obtiene las solicitudes recibidas para una chaza (solo el dueño puede verlas)"""

        # Verificar que el usuario es el dueño
        chaza = db.query(Chaza).filter(
            and_(Chaza.id == chaza_id, Chaza.owner_id == dueno_id)
        ).first()

        if not chaza:
            raise ValueError("No tienes permiso para ver estas solicitudes")

        query = db.query(Solicitud).filter(Solicitud.chaza_id == chaza_id)

        if estado:
            query = query.filter(Solicitud.estado == estado)

        solicitudes = query.order_by(Solicitud.created_at.desc()).all()

        # Enriquecer con datos del estudiante
        resultado = []
        for sol in solicitudes:
            estudiante = db.query(User).filter(User.id == sol.estudiante_id).first()
            resultado.append({
                "id": sol.id,
                "estudiante_id": sol.estudiante_id,
                "estudiante_nombre": estudiante.nombre if estudiante else "Desconocido",
                "estudiante_email": estudiante.email if estudiante else None,
                "chaza_id": sol.chaza_id,
                "chaza_nombre": chaza.titulo,
                "horarios_seleccionados": sol.horarios_seleccionados,
                "horarios_formateados": SolicitudService.formatear_horarios(sol.horarios_seleccionados),
                "mensaje": sol.mensaje,
                "estado": sol.estado.value,
                "created_at": sol.created_at,
                "updated_at": sol.updated_at,
                "respuesta": sol.respuesta,
                "respondido_at": sol.respondido_at
            })

        return resultado

    @staticmethod
    def obtener_mis_solicitudes(
        db: Session,
        estudiante_id: int
    ) -> List[dict]:
        """Obtiene las solicitudes enviadas por un estudiante"""

        solicitudes = db.query(Solicitud).filter(
            Solicitud.estudiante_id == estudiante_id
        ).order_by(Solicitud.created_at.desc()).all()

        resultado = []
        for sol in solicitudes:
            chaza = db.query(Chaza).filter(Chaza.id == sol.chaza_id).first()
            resultado.append({
                "id": sol.id,
                "estudiante_id": sol.estudiante_id,
                "chaza_id": sol.chaza_id,
                "chaza_nombre": chaza.titulo if chaza else "Chaza eliminada",
                "horarios_seleccionados": sol.horarios_seleccionados,
                "horarios_formateados": SolicitudService.formatear_horarios(sol.horarios_seleccionados),
                "mensaje": sol.mensaje,
                "estado": sol.estado.value,
                "created_at": sol.created_at,
                "updated_at": sol.updated_at,
                "respuesta": sol.respuesta,
                "respondido_at": sol.respondido_at
            })

        return resultado

    @staticmethod
    def responder_solicitud(
        db: Session,
        solicitud_id: int,
        dueno_id: int,
        nuevo_estado: EstadoSolicitud,
        respuesta: Optional[str] = None
    ) -> Solicitud:
        """El dueño de la chaza responde a una solicitud"""

        # Obtener la solicitud
        solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
        if not solicitud:
            raise ValueError("Solicitud no encontrada")

        # Verificar que el usuario es el dueño de la chaza
        chaza = db.query(Chaza).filter(
            and_(Chaza.id == solicitud.chaza_id, Chaza.owner_id == dueno_id)
        ).first()

        if not chaza:
            raise ValueError("No tienes permiso para responder a esta solicitud")

        # Verificar que la solicitud está pendiente
        if solicitud.estado != EstadoSolicitud.PENDIENTE:
            raise ValueError("Esta solicitud ya fue respondida")

        # Actualizar solicitud
        solicitud.estado = nuevo_estado
        solicitud.respuesta = respuesta
        solicitud.respondido_at = datetime.utcnow()
        solicitud.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(solicitud)

        # Notificar al estudiante
        if nuevo_estado == EstadoSolicitud.ACEPTADA:
            NotificacionService.notificar_postulacion_aceptada(
                db=db,
                estudiante_id=solicitud.estudiante_id,
                chaza_nombre=chaza.titulo,
                chaza_id=chaza.id,
                postulacion_id=solicitud.id
            )
        elif nuevo_estado == EstadoSolicitud.RECHAZADA:
            NotificacionService.notificar_postulacion_rechazada(
                db=db,
                estudiante_id=solicitud.estudiante_id,
                chaza_nombre=chaza.titulo,
                chaza_id=chaza.id,
                postulacion_id=solicitud.id
            )

        return solicitud

    @staticmethod
    def cancelar_solicitud(
        db: Session,
        solicitud_id: int,
        estudiante_id: int
    ) -> Solicitud:
        """El estudiante cancela su propia solicitud"""

        solicitud = db.query(Solicitud).filter(
            and_(
                Solicitud.id == solicitud_id,
                Solicitud.estudiante_id == estudiante_id
            )
        ).first()

        if not solicitud:
            raise ValueError("Solicitud no encontrada")

        if solicitud.estado != EstadoSolicitud.PENDIENTE:
            raise ValueError("Solo puedes cancelar solicitudes pendientes")

        solicitud.estado = EstadoSolicitud.CANCELADA
        solicitud.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(solicitud)

        # Notificar al chazero
        chaza = db.query(Chaza).filter(Chaza.id == solicitud.chaza_id).first()
        estudiante = db.query(User).filter(User.id == estudiante_id).first()

        if chaza and estudiante:
            NotificacionService.notificar_postulacion_cancelada(
                db=db,
                chazero_id=chaza.owner_id,
                estudiante_nombre=estudiante.nombre,
                chaza_nombre=chaza.titulo,
                chaza_id=chaza.id
            )

        return solicitud

    @staticmethod
    def obtener_solicitud_por_id(
        db: Session,
        solicitud_id: int,
        usuario_id: int
    ) -> Optional[dict]:
        """Obtiene una solicitud por ID (solo si el usuario tiene permiso)"""

        solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
        if not solicitud:
            return None

        # Verificar permisos: debe ser el estudiante o el dueño de la chaza
        chaza = db.query(Chaza).filter(Chaza.id == solicitud.chaza_id).first()

        if solicitud.estudiante_id != usuario_id and (not chaza or chaza.owner_id != usuario_id):
            raise ValueError("No tienes permiso para ver esta solicitud")

        estudiante = db.query(User).filter(User.id == solicitud.estudiante_id).first()

        return {
            "id": solicitud.id,
            "estudiante_id": solicitud.estudiante_id,
            "estudiante_nombre": estudiante.nombre if estudiante else "Desconocido",
            "estudiante_email": estudiante.email if estudiante else None,
            "chaza_id": solicitud.chaza_id,
            "chaza_nombre": chaza.titulo if chaza else "Chaza eliminada",
            "horarios_seleccionados": solicitud.horarios_seleccionados,
            "horarios_formateados": SolicitudService.formatear_horarios(solicitud.horarios_seleccionados),
            "mensaje": solicitud.mensaje,
            "estado": solicitud.estado.value,
            "created_at": solicitud.created_at,
            "updated_at": solicitud.updated_at,
            "respuesta": solicitud.respuesta,
            "respondido_at": solicitud.respondido_at
        }
